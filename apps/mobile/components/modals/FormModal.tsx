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
              className="rounded-t-[24px] overflow-hidden bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-gray-800"
              elevation={0}
            >
              <View className="items-center py-3 bg-transparent">
                <View className="w-10 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700" />
              </View>

              <Appbar.Header 
                elevated={false} 
                className="h-16 px-2 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-800"
              >
              <Appbar.Content 
                title={title} 
                titleStyle={{ fontSize: 20, fontWeight: "700" }} 
              />
              <Appbar.Action
                icon="close"
                onPress={handleClose}
              />
            </Appbar.Header>

            <ScrollView
              className="bg-transparent"
              contentContainerClassName="p-6 pb-10"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onScrollBeginDrag={onScrollBeginDrag}
            >
              {children}
            </ScrollView>

            <View className={`p-6 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-gray-800 ${Platform.OS === 'ios' ? 'pb-10' : 'pb-6'}`}>
              <Button
                mode="contained"
                onPress={onSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                className="py-1.5 rounded-xl elevation-none"
                labelStyle={{ fontSize: 16, fontWeight: "600", color: 'white' }}
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  animatedContent: {
    width: "100%",
  },
});
