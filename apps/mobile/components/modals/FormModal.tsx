import { Icon } from "@/components/ui/Icon";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from "react-native-gesture-handler";
import {
  Appbar,
  Button,
  Modal,
  Portal,
  Surface,
  useTheme,
} from "@/components/ui";

type FormModalProps = {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitButtonText: string;
  onBackgroundPress?: () => void;
  onScrollBeginDrag?: () => void;
};

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const FormModal = ({
  isVisible,
  onClose,
  title,
  children,
  onSubmit,
  isSubmitting,
  submitButtonText,
  onBackgroundPress,
  onScrollBeginDrag,
}: FormModalProps) => {
  const theme = useTheme();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Slide in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, slideAnim, fadeAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Portal>
      <Modal
        visible={isVisible}
        onDismiss={handleClose}
        containerClassName="justify-end bg-transparent"
        className="w-full p-0 rounded-b-none"
      >
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onBackgroundPress || handleClose}
          />
        </Animated.View>
        
        <PanGestureHandler
          onGestureEvent={Animated.event(
            [{ nativeEvent: { translationY: slideAnim } }],
            { useNativeDriver: true }
          )}
          onHandlerStateChange={(event) => {
            if (event.nativeEvent.state === State.END) {
              if (event.nativeEvent.translationY > 100) {
                handleClose();
              } else {
                Animated.spring(slideAnim, {
                  toValue: 0,
                  useNativeDriver: true,
                  tension: 65,
                  friction: 11
                }).start();
              }
            }
          }}
        >
          <Animated.View
            style={[
              styles.animatedContent,
              {
                transform: [
                  { 
                    translateY: slideAnim.interpolate({
                      inputRange: [0, SCREEN_HEIGHT],
                      outputRange: [0, SCREEN_HEIGHT],
                      extrapolate: 'clamp'
                    }) 
                  }
                ],
              },
            ]}
          >
            <Surface
              style={[
                styles.contentSurface,
                { 
                  backgroundColor: theme.dark ? "#111827" : "#ffffff",
                  borderColor: theme.dark ? "#1f2937" : "#e5e7eb"
                },
              ]}
              elevation={0}
            >
              <View style={styles.handleContainer}>
                <View style={[styles.handle, { backgroundColor: theme.dark ? "#374151" : "#e5e7eb" }]} />
              </View>

              <Appbar.Header 
                elevated={false} 
                style={[
                  styles.header, 
                  { 
                    backgroundColor: theme.dark ? "#111827" : "#ffffff",
                    borderBottomWidth: 1,
                    borderBottomColor: theme.dark ? "#1f2937" : "#e5e7eb"
                  }
                ]}
              >
              <Appbar.Content 
                title={title} 
                titleStyle={[styles.title, { color: theme.colors.onSurface }]} 
              />
              <Appbar.Action
                icon="close"
                onPress={handleClose}
                color={theme.colors.onSurface}
              />
            </Appbar.Header>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onScrollBeginDrag={onScrollBeginDrag}
            >
              {children}
            </ScrollView>

            <View style={[
              styles.footer, 
              { 
                borderTopWidth: 1,
                borderTopColor: theme.dark ? "#1f2937" : "#e5e7eb",
                backgroundColor: theme.dark ? "#111827" : "#ffffff",
              }
            ]}>
              <Button
                mode="contained"
                onPress={onSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                labelStyle={styles.submitButtonLabel}
                icon={() => (
                  <Icon
                    type={"check" as any}
                    size={18}
                    color={"white"}
                  />
                )}
              >
                {submitButtonText}
              </Button>
            </View>
          </Surface>
        </Animated.View>
        </PanGestureHandler>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  animatedContent: {
    width: "100%",
  },
  contentSurface: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    overflow: 'hidden',
  },
  header: {
    height: 64,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  scrollView: {
    backgroundColor: 'transparent',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  submitButton: {
    paddingVertical: 6,
    borderRadius: 12,
    elevation: 0,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: 'white',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
});
