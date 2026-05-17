import { Icon } from "@/components/ui/Icon";
import Sparkles from "@/assets/icon/Sparkles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "@/lib/axiosInstance";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
  PanResponder,
  Animated,
} from "react-native";
import MarkdownDisplay from "react-native-markdown-display";
import {
  ActivityIndicator,
  Button,
  IconButton,
  Surface,
  Text,
  TextInput,
} from "@/components/ui";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

type Message = {
  sender: "user" | "bot";
  text: string;
};

type ChatWindowProps = {
  userId: string;
  onClose: () => void;
};

const suggestions = [
  "Fetch all leads from Contacts in CRM",
  "When is my next veterinary doctor's appointment?",
  "When should I next milk the cows?",
];

const ChatWindow = ({ userId, onClose }: ChatWindowProps) => {
  const { plan, isSubTypesLoading, darkMode } = useUserPreferences();
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadMessages = async () => {
      const stored = await AsyncStorage.getItem(`chatMessages_${userId}`);
      if (stored) {
        setMessages(JSON.parse(stored));
      }
    };
    loadMessages();
  }, [userId]);

  useEffect(() => {
    if (messages.length > 0) {
      AsyncStorage.setItem(`chatMessages_${userId}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    const userMessage: Message = { sender: "user", text: messageText };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    if (!textToSend) {
      setInput("");
    }
    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) throw new Error("Authentication token not found.");

      const response = await axiosInstance.post(`/llm`, {
        history: updatedMessages,
        userId: userId,
        token: token,
      });

      const botMessage: Message = { sender: "bot", text: response.data.answer };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error communicating with the chat API:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Error: Could not get a response. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    handleSend(suggestion);
  };

  const handleClearChat = async () => {
    await AsyncStorage.removeItem(`chatMessages_${userId}`);
    setMessages([]);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5 && Math.abs(gestureState.dx) < 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.4) {
          Animated.timing(translateY, {
            toValue: 1000,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            onClose();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 15,
            stiffness: 100,
          }).start();
        }
      },
    }),
  ).current;

  const getMarkdownStyles = (sender: "user" | "bot") => {
    const textColor =
      sender === "user" ? "#ffffff" : darkMode ? "#e8e8e9" : "#131317";

    return {
      body: {
        color: textColor,
        fontSize: 15,
        lineHeight: 20,
      },
      paragraph: {
        color: textColor,
        fontSize: 15,
        lineHeight: 20,
        marginBottom: 4,
        marginTop: 0,
      },
      strong: {
        color: textColor,
        fontWeight: "bold" as const,
      },
      bullet_list: {
        marginBottom: 6,
        marginTop: 4,
      },
      ordered_list: {
        marginBottom: 6,
        marginTop: 4,
      },
      list_item: {
        color: textColor,
        fontSize: 15,
        lineHeight: 20,
      },
      bullet_list_icon: {
        color: textColor,
        fontSize: 15,
      },
      ordered_list_icon: {
        color: textColor,
        fontSize: 15,
      },
      code_inline: {
        color: sender === "user" ? "#d8fdf2" : "#2b7860",
        backgroundColor:
          sender === "user" ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.05)",
        borderRadius: 4,
        paddingHorizontal: 4,
        fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
      },
      code_block: {
        color: sender === "user" ? "#ffffff" : darkMode ? "#e8e8e9" : "#131317",
        backgroundColor:
          sender === "user"
            ? "rgba(0,0,0,0.2)"
            : darkMode
              ? "#111827"
              : "#f3f4f6",
        padding: 8,
        borderRadius: 8,
        fontSize: 13,
        fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
      },
      fence: {
        color: sender === "user" ? "#ffffff" : darkMode ? "#e8e8e9" : "#131317",
        backgroundColor:
          sender === "user"
            ? "rgba(0,0,0,0.2)"
            : darkMode
              ? "#111827"
              : "#f3f4f6",
        padding: 8,
        borderRadius: 8,
        fontSize: 13,
        fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
      },
      link: {
        color: sender === "user" ? "#d8fdf2" : "#2b7860",
        textDecorationLine: "underline" as const,
      },
    };
  };

  const markdownRules = {
    body: (node: any, children: any) => <View key={node.key}>{children}</View>,
    table: (node: any, children: any) => (
      <ScrollView
        horizontal
        key={node.key}
        showsHorizontalScrollIndicator={false}
      >
        <View className="border border-gray-300 dark:border-zinc-800 rounded-xl bg-white dark:bg-dark-100 my-2 overflow-hidden">
          {children}
        </View>
      </ScrollView>
    ),
    thead: (node: any, children: any) => (
      <View
        key={node.key}
        className="bg-gray-400 dark:bg-gray-100 border-b border-gray-300 dark:border-zinc-800"
      >
        {children}
      </View>
    ),
    th: (node: any, children: any) => (
      <View
        key={node.key}
        className="p-3 border-r border-gray-300 dark:border-zinc-800 min-w-[100px]"
      >
        {children}
      </View>
    ),
    tr: (node: any, children: any) => (
      <View
        key={node.key}
        className="flex-row border-b border-gray-300 dark:border-zinc-800"
      >
        {children}
      </View>
    ),
    td: (node: any, children: any) => (
      <View
        key={node.key}
        className="p-3 border-r border-gray-300 dark:border-zinc-800 min-w-[100px]"
      >
        {children}
      </View>
    ),
  };

  if (isSubTypesLoading) {
    return (
      <View className="flex-1 bg-black/50 justify-end">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <Animated.View
          style={{
            transform: [{ translateY }],
            height: "94%",
          }}
          className="bg-white dark:bg-dark rounded-t-[32px] overflow-hidden"
        >
          <View
            {...panResponder.panHandlers}
            className="bg-gray-50 dark:bg-dark-surface pt-3 pb-2 items-center border-b border-gray-100 dark:border-gray-800"
          >
            <View className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mb-3" />
            <View className="flex-row items-center w-full px-4 justify-between">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-green-300 dark:bg-green-100 items-center justify-center mr-2.5">
                  <Sparkles
                    size={18}
                    className="text-green-100 dark:text-green-300"
                  />
                </View>
                <Text className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Graminate AI
                </Text>
              </View>
              <IconButton
                icon={() => (
                  <Icon
                    type="close"
                    size={24}
                    className="text-gray-400 dark:text-gray-500"
                  />
                )}
                onPress={onClose}
                size={24}
              />
            </View>
          </View>
          <View className="flex-1 justify-center items-center bg-white dark:bg-dark">
            <ActivityIndicator size="large" className="text-green-100" />
          </View>
        </Animated.View>
      </View>
    );
  }

  if (plan !== "PRO") {
    return (
      <View className="flex-1 bg-black/50 justify-end">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <Animated.View
          style={{
            transform: [{ translateY }],
            height: "94%",
          }}
          className="bg-white dark:bg-dark rounded-t-[32px] overflow-hidden"
        >
          <View
            {...panResponder.panHandlers}
            className="bg-gray-50 dark:bg-dark-surface pt-3 pb-2 items-center"
          >
            <View className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mb-3" />
            <View className="flex-row items-center w-full px-4 justify-between">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-green-300 dark:bg-green-100 items-center justify-center mr-2.5">
                  <Sparkles
                    size={18}
                    className="text-green-100 dark:text-green-300"
                  />
                </View>
                <Text className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Graminate AI
                </Text>
              </View>
              <IconButton
                icon={() => (
                  <Icon
                    type="close"
                    size={24}
                    className="text-dark dark:text-light"
                  />
                )}
                onPress={onClose}
                size={24}
              />
            </View>
          </View>
          <View className="flex-1 justify-center items-center p-6 bg-white dark:bg-dark">
            <View className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-950/30 items-center justify-center mb-6">
              <Sparkles
                size={48}
                className="text-green-100 dark:text-green-300"
              />
            </View>
            <Text className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-3">
              Feature Locked
            </Text>
            <Text className="text-base text-center text-gray-500 dark:text-gray-400 px-4 leading-6 mb-8">
              Graminate AI is only available for Paid Users. Please upgrade your
              plan on the web dashboard to access this feature.
            </Text>
            <Button
              mode="contained"
              onPress={onClose}
              className="px-8 py-1 bg-green-100 rounded-full"
            >
              Got it
            </Button>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black/50 justify-end">
      <Pressable className="absolute inset-0" onPress={onClose} />
      <Animated.View
        style={{
          transform: [{ translateY }],
          height: "94%",
        }}
        className="bg-white dark:bg-dark rounded-t-[32px] overflow-hidden"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        >
          <View
            {...panResponder.panHandlers}
            className="bg-gray-50 dark:bg-dark-surface pt-3 pb-2 items-center border-b border-gray-100 dark:border-gray-800"
          >
            <View className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mb-3" />
            <View className="flex-row items-center w-full px-4 justify-between">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-green-300 dark:bg-green-100 items-center justify-center mr-2.5">
                  <Sparkles
                    size={18}
                    className="text-green-100 dark:text-green-300"
                  />
                </View>
                <Text className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Graminate AI
                </Text>
              </View>
              <View className="flex-row items-center">
                {messages.length > 0 && (
                  <Button
                    mode="text"
                    onPress={handleClearChat}
                    textColor="#ef4444"
                    compact
                    className="mr-1"
                  >
                    Clear
                  </Button>
                )}
                <IconButton
                  icon={() => (
                    <Icon
                      type="close"
                      size={24}
                      className="text-gray-400 dark:text-gray-500"
                    />
                  )}
                  onPress={onClose}
                  size={24}
                />
              </View>
            </View>
          </View>

          <View className="flex-1 bg-white dark:bg-dark">
            {messages.length === 0 && !isLoading ? (
              <View className="flex-1 justify-center items-center p-6 pb-20">
                <View className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950/30 items-center justify-center mb-4">
                  <Sparkles
                    size={36}
                    className="text-green-100 dark:text-green-300"
                  />
                </View>
                <Text className="text-xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
                  How can I help today?
                </Text>
                <Text className="text-sm text-center text-gray-500 dark:text-gray-400 mb-8 max-w-[280px]">
                  Ask about contacts, appointments, cows milking schedules, or
                  sales analytics.
                </Text>
                <View className="w-full">
                  {suggestions.map((s, i) => (
                    <Pressable
                      key={i}
                      onPress={() => handleSuggestionPress(s)}
                      className="w-full bg-gray-50 dark:bg-dark-100 rounded-2xl py-3.5 px-4 mb-3 active:bg-gray-400 dark:active:bg-zinc-800"
                    >
                      <Text className="text-sm text-dark dark:text-light font-medium">
                        {s}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <ScrollView
                ref={scrollViewRef}
                className="flex-1 px-4"
                contentContainerClassName="pb-8 pt-4"
              >
                {messages.map((msg, index) => (
                  <View
                    key={index}
                    className={`flex-row items-end my-2.5 max-w-[85%] ${
                      msg.sender === "user"
                        ? "self-end flex-row-reverse"
                        : "self-start"
                    }`}
                  >
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center bg-gray-400 dark:bg-dark-200 ${
                        msg.sender === "user" ? "ml-2" : "mr-2"
                      }`}
                    >
                      {msg.sender === "user" ? (
                        <Icon
                          type="account"
                          size={18}
                          className="text-gray-500 dark:text-gray-400"
                        />
                      ) : (
                        <Sparkles
                          size={18}
                          className="text-green-100 dark:text-green-300"
                        />
                      )}
                    </View>
                    <View
                      className={`p-3.5 rounded-2xl shrink shadow-sm ${
                        msg.sender === "user"
                          ? "bg-green-100 rounded-br-none"
                          : "bg-gray-400 dark:bg-gray-100 rounded-bl-none"
                      }`}
                    >
                      <MarkdownDisplay
                        style={getMarkdownStyles(msg.sender)}
                        rules={markdownRules}
                      >
                        {msg.text}
                      </MarkdownDisplay>
                    </View>
                  </View>
                ))}
                {isLoading && (
                  <View className="flex-row items-end my-2.5 max-w-[85%] self-start">
                    <View className="w-8 h-8 rounded-full items-center justify-center mr-2">
                      <Sparkles
                        size={18}
                        className="text-green-100 dark:text-green-300"
                      />
                    </View>
                    <View className="p-4 rounded-2xl rounded-bl-none bg-gray-400 dark:bg-gray-100 shadow-sm">
                      <ActivityIndicator size="small" />
                    </View>
                  </View>
                )}
              </ScrollView>
            )}
          </View>

          <Surface
            className="flex-row items-center p-3 pb-6 bg-gray-50 dark:bg-dark-surface border-t border-gray-100 dark:border-gray-800"
            elevation={2}
          >
            <TextInput
              className="flex-1"
              mode="outlined"
              placeholder="Ask Graminate AI..."
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => handleSend()}
              editable={!isLoading}
              multiline
              outlineStyle={{ borderRadius: 24 }}
            />
            <IconButton
              icon={() => (
                <Icon
                  type="arrow-up-circle"
                  size={38}
                  className={
                    isLoading || input.trim() === ""
                      ? "text-gray-300 dark:text-gray-700"
                      : "text-green-100"
                  }
                />
              )}
              mode="contained"
              size={24}
              onPress={() => handleSend()}
              disabled={isLoading || input.trim() === ""}
              className="ml-2"
            />
          </Surface>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
};

export default ChatWindow;
