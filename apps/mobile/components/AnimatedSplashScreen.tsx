import React, { useEffect, useState } from "react";
import { StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import * as SplashScreen from "expo-splash-screen";

const { width } = Dimensions.get("window");

type AnimatedSplashScreenProps = {
  isAppReady: boolean;
  onAnimationComplete: () => void;
};

export function AnimatedSplashScreen({
  isAppReady,
  onAnimationComplete,
}: AnimatedSplashScreenProps) {
  const { darkMode } = useUserPreferences();
  
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);
  
  const [animationStartedExit, setAnimationStartedExit] = useState(false);

  useEffect(() => {
    // Hide native splash immediately so the custom animation takes over
    SplashScreen.hideAsync().catch(() => {});

    // Entrance sequence: fade in and spring scale up
    opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    
    scale.value = withSpring(1, { damping: 12, stiffness: 90 }, (finished) => {
      if (finished && !animationStartedExit) {
        // Gently pulse if still waiting for the app to become ready
        scale.value = withRepeat(
          withTiming(1.08, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
          -1,
          true
        );
      }
    });
  }, []);

  useEffect(() => {
    if (isAppReady && !animationStartedExit) {
      // Enforce a minimum viewing time of 1200ms so it's not jarring if loading is instant
      const timer = setTimeout(() => {
        triggerExitAnimation();
      }, 1200);
      
      return () => clearTimeout(timer);
    }
  }, [isAppReady, animationStartedExit]);

  const triggerExitAnimation = () => {
    setAnimationStartedExit(true);

    // Blast scale and fade out container smoothly
    scale.value = withTiming(2.8, { 
      duration: 500, 
      easing: Easing.bezier(0.25, 1, 0.5, 1) 
    });
    
    opacity.value = withTiming(0, { 
      duration: 350, 
      easing: Easing.out(Easing.quad) 
    });
    
    containerOpacity.value = withTiming(0, { 
      duration: 500, 
      easing: Easing.out(Easing.quad) 
    }, (finished) => {
      if (finished) {
        runOnJS(onAnimationComplete)();
      }
    });
  };

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { 
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999999,
          backgroundColor: darkMode ? "#0a0a0a" : "#ffffff" 
        },
        animatedContainerStyle,
      ]}
    >
      <Animated.Image
        source={require("@/assets/images/logo.png")}
        style={[styles.image, animatedImageStyle]}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: width * 0.45,
    height: width * 0.45,
    maxWidth: 220,
    maxHeight: 220,
  },
});
