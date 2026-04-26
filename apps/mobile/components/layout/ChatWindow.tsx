import { Icon } from "@/components/ui/Icon";
import Sparkles from "@/assets/icon/Sparkles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance, { axios } from "@/lib/axiosInstance";
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
  useTheme,
} from "react-native-paper";
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
  const theme = useTheme();
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

  const markdownStyle = (sender: "user" | "bot") =>
    StyleSheet.create({
      body: {
        color:
          sender === "user" ? theme.colors.onPrimary : theme.colors.onSurface,
        fontSize: 16,
      },
      table: {
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.1)",
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
        marginVertical: 10,
        overflow: "hidden",
      },
      thead: {
        backgroundColor: theme.colors.elevation.level1,
      },
      th: {
        padding: 12,
        fontWeight: "bold",
        fontSize: 12,
        color: theme.colors.onSurface,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.1)",
        minWidth: 100,
      },
      tr: {
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)",
      },
      td: {
        padding: 12,
        fontSize: 14,
        color: theme.colors.onSurface,
        minWidth: 100,
      },
    });

  const markdownRules = {
    table: (node: any, children: any, parent: any, styles: any) => (
      <ScrollView horizontal key={node.key} showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>{children}</View>
      </ScrollView>
    ),
  };

  const styles = StyleSheet.create({
    flex: { flex: 1 },
    chatContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.elevation.level2,
    },
    headerTitle: { fontWeight: "bold" },
    contentArea: {
      flex: 1,
    },
    scrollView: { flex: 1, paddingHorizontal: 16 },
    scrollContent: { paddingBottom: 16, paddingTop: 8 },
    suggestionContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
      paddingBottom: 100,
    },
    suggestionTitle: {
      marginTop: 16,
      marginBottom: 24,
      textAlign: "center",
    },
    suggestionCard: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginBottom: 12,
      width: "100%",
      backgroundColor: theme.colors.elevation.level3,
    },
    suggestionText: {
      color: theme.colors.onSurface,
    },
    messageRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginVertical: 8,
      maxWidth: "90%",
    },
    userRow: { alignSelf: "flex-end" },
    botRow: { alignSelf: "flex-start" },
    avatarContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 8,
      backgroundColor: theme.colors.surfaceVariant,
    },
    messageBubble: { padding: 12, borderRadius: 16, flexShrink: 1 },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 8,
      paddingTop: 12,
      backgroundColor: theme.colors.elevation.level2,
    },
    textInput: { flex: 1 },
    textInputOutline: { borderRadius: 24 },
    sendButton: { marginLeft: 8 },
    lockedContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
      backgroundColor: theme.colors.background,
    },
    lockedTitle: {
      marginTop: 20,
      fontWeight: "bold",
      textAlign: "center",
    },
    lockedSubtitle: {
      marginTop: 12,
      textAlign: "center",
      opacity: 0.7,
      lineHeight: 22,
    },
    upgradeButton: {
      marginTop: 32,
      paddingHorizontal: 16,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
  });

  const memoizedCloseIcon = useCallback(
    () => (
      <Icon
        type={"close" as any}
        size={24}
        color={theme.colors.onSurfaceVariant}
      />
    ),
    [theme.colors.onSurfaceVariant]
  );

  if (isSubTypesLoading) {
    return (
      <Surface style={styles.chatContainer}>
        <Appbar.Header elevated style={styles.header}>
          <Appbar.Content
            title="Graminate AI"
            titleStyle={styles.headerTitle}
          />
          <Appbar.Action icon={memoizedCloseIcon} onPress={onClose} />
        </Appbar.Header>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </Surface>
    );
  }

  if (plan !== "PRO") {
    return (
      <Surface style={styles.chatContainer}>
        <Appbar.Header elevated style={styles.header}>
          <Appbar.Content
            title="Graminate AI"
            titleStyle={styles.headerTitle}
          />
          <Appbar.Action icon={memoizedCloseIcon} onPress={onClose} />
        </Appbar.Header>
        <View style={styles.lockedContainer}>
          <Sparkles size={64} color={theme.colors.primary} />
          <Text variant="headlineSmall" style={styles.lockedTitle}>
            Feature Locked
          </Text>
          <Text variant="bodyLarge" style={styles.lockedSubtitle}>
            Graminate AI is only available for Paid Users. Please upgrade your
            plan on the web dashboard to access this feature.
          </Text>
          <Button
            mode="contained"
            onPress={onClose}
            style={styles.upgradeButton}
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
      style={styles.flex}
    >
      <Surface style={styles.chatContainer}>
        <Appbar.Header elevated style={styles.header}>
          <Appbar.Content
            title="Graminate AI"
            titleStyle={styles.headerTitle}
          />
          {messages.length > 0 && (
            <Button
              mode="text"
              onPress={handleClearChat}
              textColor={theme.colors.error}
              icon={() => (
                <Icon
                  type={"trash-can" as any}
                  size={18}
                  color={theme.colors.error}
                />
              )}
            >
              Clear
            </Button>
          )}
          <Appbar.Action icon={memoizedCloseIcon} onPress={onClose} />
        </Appbar.Header>

        <View style={styles.contentArea}>
          {messages.length === 0 && !isLoading ? (
            <View style={styles.suggestionContainer}>
              <Sparkles size={48} color={theme.colors.onSurfaceVariant} />
              <Text variant="headlineSmall" style={styles.suggestionTitle}>
                How can I help today?
              </Text>
              {suggestions.map((s, i) => (
                <Pressable key={i} onPress={() => handleSuggestionPress(s)}>
                  <Surface style={styles.suggestionCard} elevation={1}>
                    <Text style={styles.suggestionText}>{s}</Text>
                  </Surface>
                </Pressable>
              ))}
            </View>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
            >
              {messages.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageRow,
                    msg.sender === "user" ? styles.userRow : styles.botRow,
                  ]}
                >
                  {msg.sender === "bot" && (
                    <View style={styles.avatarContainer}>
                      <Sparkles
                        size={18}
                        color={theme.colors.onSurfaceVariant}
                      />
                    </View>
                  )}
                  <Surface
                    style={[
                      styles.messageBubble,
                      msg.sender === "user"
                        ? { backgroundColor: theme.colors.primary }
                        : { backgroundColor: theme.colors.elevation.level3 },
                    ]}
                    elevation={1}
                  >
                    <MarkdownDisplay 
                      style={markdownStyle(msg.sender)}
                      rules={markdownRules}
                    >
                      {msg.text}
                    </MarkdownDisplay>
                  </Surface>
                  {msg.sender === "user" && (
                    <View style={styles.avatarContainer}>
                      <Icon
                        type={"account" as any}
                        size={18}
                        color={theme.colors.onSurfaceVariant}
                      />
                    </View>
                  )}
                </View>
              ))}
              {isLoading && (
                <View style={[styles.messageRow, styles.botRow]}>
                  <View style={styles.avatarContainer}>
                    <Sparkles size={18} color={theme.colors.onSurfaceVariant} />
                  </View>
                  <Surface
                    style={[
                      styles.messageBubble,
                      { backgroundColor: theme.colors.elevation.level3 },
                    ]}
                    elevation={1}
                  >
                    <ActivityIndicator />
                  </Surface>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        <Surface style={styles.inputContainer} elevation={2}>
          <TextInput
            style={styles.textInput}
            mode="outlined"
            placeholder="Ask Graminate AI..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
            editable={!isLoading}
            multiline
            outlineStyle={styles.textInputOutline}
          />
          <IconButton
            icon={() => (
              <Icon
                type={"arrow-up-circle" as any}
                size={38}
                color={
                  isLoading || input.trim() === ""
                    ? theme.colors.onSurfaceDisabled
                    : theme.colors.primary
                }
              />
            )}
            mode="contained"
            size={24}
            onPress={() => handleSend()}
            disabled={isLoading || input.trim() === ""}
            style={styles.sendButton}
          />
        </Surface>
      </Surface>
    </KeyboardAvoidingView>
  );
};

export default ChatWindow;
