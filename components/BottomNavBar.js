import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";

const { width } = Dimensions.get("window");

const BottomNavBar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "home", label: "Home", icon: "home" },
    { id: "explore", label: "Explore", icon: "compass" },
    { id: "reels", label: "Reels", icon: "play-circle" },
    { id: "profile", label: "Profile", icon: "person" },
  ];

  // Initialize animation values for the active background indicator
  const homeIndicator = useRef(new Animated.Value(1)).current;
  const exploreIndicator = useRef(new Animated.Value(0)).current;
  const reelsIndicator = useRef(new Animated.Value(0)).current;
  const profileIndicator = useRef(new Animated.Value(0)).current;

  const getIndicator = (tabId) => {
    switch (tabId) {
      case "home":
        return homeIndicator;
      case "explore":
        return exploreIndicator;
      case "reels":
        return reelsIndicator;
      case "profile":
        return profileIndicator;
      default:
        return homeIndicator;
    }
  };

  useEffect(() => {
    tabs.forEach((tab) => {
      const isActive = activeTab === tab.id;
      const indicator = getIndicator(tab.id);

      Animated.spring(indicator, {
        toValue: isActive ? 1 : 0,
        useNativeDriver: false, // Can't use native driver for layout props like width/height
        tension: 120,
        friction: 8,
      }).start();
    });
  }, [activeTab]);

  return (
    <View style={styles.navBarContainer}>
      <View style={styles.navBar}>
        <BlurView intensity={100} tint="light" style={styles.blurView}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const indicator = getIndicator(tab.id);

            // Interpolate the dimensions of the active background (rounded rectangle)
            const backgroundWidth = indicator.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 85], // Width of the rounded background
            });

            const backgroundHeight = indicator.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 55], // Height of the rounded background
            });

            // Center the background by translating by negative half of width/height
            const backgroundTranslateX = indicator.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -42.5], // Negative half of max width (85/2)
            });

            const backgroundTranslateY = indicator.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -27.5], // Negative half of max height (55/2)
            });

            const backgroundOpacity = indicator.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            });

            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.navItem}
                onPress={() => onTabChange(tab.id)}
                activeOpacity={0.7}
              >
                <View style={styles.navItemWrapper}>
                  <Animated.View
                    style={[
                      styles.activeTabBackground,
                      {
                        opacity: backgroundOpacity,
                        width: backgroundWidth,
                        height: backgroundHeight,
                        transform: [
                          { translateX: backgroundTranslateX },
                          { translateY: backgroundTranslateY },
                        ],
                      },
                    ]}
                  />
                  <View style={styles.navItemContent}>
                    <Ionicons
                      name={tab.icon}
                      size={22}
                      color={isActive ? "#000" : "#fff"}
                      style={styles.navIcon}
                    />
                    <Text
                      style={[
                        styles.navLabel,
                        { color: isActive ? "#000" : "#fff" },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navBarContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 20 : 10,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  navBar: {
    width: width - 32,
    height: 70,
    borderRadius: 35, // Half of height for fully rounded pill shape
    overflow: "hidden", // Required for borderRadius to work
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  blurView: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 35,
    overflow: "hidden",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
    position: "relative",
  },
  navItemWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: "100%",
    height: "100%",
  },
  activeTabBackground: {
    position: "absolute",
    top: "50%",
    left: "50%",
    backgroundColor: "rgba(240, 240, 240, 0.95)",
    borderRadius: 28,
    zIndex: 0,
  },
  navItemContent: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    position: "relative",
    width: "100%",
    height: "100%",
  },
  navIcon: {
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
});

export default BottomNavBar;

