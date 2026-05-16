import { Icon } from "@/components/ui/Icon";
import Sparkles from "@/assets/icon/Sparkles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "@/lib/axiosInstance";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import MarkdownDisplay from "react-native-markdown-display";
import {
  ActivityIndicator,
  Appbar,
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
  const { plan, isSubTypesLoading } = useUserPreferences();
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

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

  const markdownRules = (sender: "user" | "bot") => ({
    body: (node: any, children: any) => <View key={node.key}>{children}</View>,
    paragraph: (node: any, children: any) => (
      <Text
        key={node.key}
        className={`${sender === "user" ? "text-white" : "text-gray-900 dark:text-gray-100"} text-base mb-1`}
      >
        {children}
      </Text>
    ),
    table: (node: any, children: any) => (
      <ScrollView
        horizontal
        key={node.key}
        showsHorizontalScrollIndicator={false}
      >
        <View className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-dark-surface my-2 overflow-hidden">
          {children}
        </View>
      </ScrollView>
    ),
    thead: (node: any, children: any) => (
      <View
        key={node.key}
        className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
      >
        {children}
      </View>
    ),
    th: (node: any, children: any) => (
      <View
        key={node.key}
        className="p-3 border-r border-gray-400 dark:border-gray-700 min-w-[100px]"
      >
        {children}
      </View>
    ),
    tr: (node: any, children: any) => (
      <View
        key={node.key}
        className="flex-row border-b border-gray-400 dark:border-gray-700"
      >
        {children}
      </View>
    ),
    td: (node: any, children: any) => (
      <View
        key={node.key}
        className="p-3 border-r border-gray-400 dark:border-gray-700 min-w-[100px]"
      >
        {children}
      </View>
    ),
    text: (node: any, children: any) => (
      <Text
        key={node.key}
        className={
          sender === "user" ? "text-white" : "text-gray-900 dark:text-gray-100"
        }
      >
        {children}
      </Text>
    ),
    strong: (node: any, children: any) => (
      <Text key={node.key} className="font-bold">
        {children}
      </Text>
    ),
    bullet_list: (node: any, children: any) => (
      <View key={node.key} className="ml-4 mb-2">
        {children}
      </View>
    ),
    list_item: (node: any, children: any) => (
      <View key={node.key} className="flex-row items-start mb-1">
        <Text className={sender === "user" ? "text-white" : "text-gray-900 dark:text-gray-100"}>• </Text>
        <View className="flex-1">{children}</View>
      </View>
    ),
  });
  
  const memoizedCloseIcon = useCallback(
    () => (
      <Icon
        type={"close"}
        size={24}
        className="text-gray-400 dark:text-gray-500"
      />
    ),
    []
  );

  if (isSubTypesLoading) {
    return (
      <Surface className="flex-1 bg-white dark:bg-dark">
        <Appbar.Header elevated className="bg-gray-50 dark:bg-dark-surface">
          <Appbar.Content
            title="Graminate AI"
            titleStyle={{ fontWeight: "bold" }}
          />
          <Appbar.Action icon={memoizedCloseIcon} onPress={onClose} />
        </Appbar.Header>
        <View className="flex-1 justify-center items-center bg-white dark:bg-dark">
          <ActivityIndicator size="large" className="text-green-100" />
        </View>
      </Surface>
    );
  }

  if (plan !== "PRO") {
    return (
      <Surface className="flex-1 bg-white dark:bg-dark">
        <Appbar.Header elevated className="bg-gray-50 dark:bg-dark-surface">
          <Appbar.Content
            title="Graminate AI"
            titleStyle={{ fontWeight: "bold" }}
          />
          <Appbar.Action icon={memoizedCloseIcon} onPress={onClose} />
        </Appbar.Header>
        <View className="flex-1 justify-center items-center p-6 bg-white dark:bg-dark">
          <Sparkles size={64} className="text-green-100" />
          <Text variant="headlineSmall" className="mt-5 font-bold text-center">
            Feature Locked
          </Text>
          <Text variant="bodyLarge" className="mt-3 text-center opacity-70 leading-5">
            Graminate AI is only available for Paid Users. Please upgrade your
            plan on the web dashboard to access this feature.
          </Text>
          <Button
            mode="contained"
            onPress={onClose}
            className="mt-8 px-4"
          >
            Got it
          </Button>
        </View>
      </Surface>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <Surface className="flex-1 bg-white dark:bg-dark">
        <Appbar.Header elevated className="bg-gray-50 dark:bg-dark-surface">
          <Appbar.Content
            title="Graminate AI"
            titleStyle={{ fontWeight: "bold" }}
          />
          {messages.length > 0 && (
            <Button
              mode="text"
              onPress={handleClearChat}
              textColor="#ef4444"
              icon={() => (
                <Icon
                  type={"trash-can"}
                  size={18}
                  className="text-red-500"
                />
              )}
            >
              Clear
            </Button>
          )}
          <Appbar.Action icon={memoizedCloseIcon} onPress={onClose} />
        </Appbar.Header>

        <View className="flex-1">
          {messages.length === 0 && !isLoading ? (
            <View className="flex-1 justify-center items-center p-6 pb-[100px]">
              <Sparkles size={48} className="text-gray-400 dark:text-gray-500" />
              <Text variant="headlineSmall" className="mt-4 mb-6 text-center">
                How can I help today?
              </Text>
              {suggestions.map((s, i) => (
                <Pressable key={i} className="w-full" onPress={() => handleSuggestionPress(s)}>
                  <Surface className="py-3 px-4 rounded-[20px] mb-3 w-full bg-gray-400 dark:bg-gray-600" elevation={1}>
                    <Text className="text-dark dark:text-light">{s}</Text>
                  </Surface>
                </Pressable>
              ))}
            </View>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              className="flex-1 px-4"
              contentContainerClassName="pb-4 pt-2"
            >
              {messages.map((msg, index) => (
                <View
                  key={index}
                  className={`flex-row items-start my-2 max-w-[90%] ${msg.sender === "user" ? "self-end" : "self-start"}`}
                >
                  {msg.sender === "bot" && (
                    <View className="w-8 h-8 rounded-full items-center justify-center mx-2 bg-gray-200 dark:bg-gray-700">
                      <Sparkles
                        size={18}
                        className="text-gray-400 dark:text-gray-500"
                      />
                    </View>
                  )}
                  <Surface
                    className={`p-3 rounded-2xl shrink ${msg.sender === "user" ? "bg-green-100" : "bg-gray-400 dark:bg-gray-600"}`}
                    elevation={1}
                  >
                    <MarkdownDisplay
                      rules={markdownRules(msg.sender)}
                    >
                      {msg.text}
                    </MarkdownDisplay>
                  </Surface>
                  {msg.sender === "user" && (
                    <View className="w-8 h-8 rounded-full items-center justify-center mx-2 bg-gray-200 dark:bg-gray-700">
                      <Icon
                        type={"account"}
                        size={18}
                        className="text-gray-400 dark:text-gray-500"
                      />
                    </View>
                  )}
                </View>
              ))}
              {isLoading && (
                <View className="flex-row items-start my-2 max-w-[90%] self-start">
                  <View className="w-8 h-8 rounded-full items-center justify-center mx-2 bg-gray-200 dark:bg-gray-700">
                    <Sparkles size={18} className="text-gray-400 dark:text-gray-500" />
                  </View>
                  <Surface
                    className="p-3 rounded-2xl shrink bg-gray-400 dark:bg-gray-600"
                    elevation={1}
                  >
                    <ActivityIndicator />
                  </Surface>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        <Surface className="flex-row items-center p-2 pt-3 bg-gray-50 dark:bg-dark-surface" elevation={2}>
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
                type={"arrow-up-circle"}
                size={38}
                className={isLoading || input.trim() === "" ? "text-gray-300 dark:text-gray-700" : "text-green-100"}
              />
            )}
            mode="contained"
            size={24}
            onPress={() => handleSend()}
            disabled={isLoading || input.trim() === ""}
            className="ml-2"
          />
        </Surface>
      </Surface>
    </KeyboardAvoidingView>
  );
};

export default ChatWindow;
