import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { fonts } from "../constants/fonts";

const { width } = Dimensions.get("window");

const ProfileScreen = () => {
  // Mock user data - replace with actual user data from auth/database
  const userData = {
    name: "Ronald Richards",
    email: "ronaldrichards@gmail.com",
    profileImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
  };

  const accountItems = [
    {
      id: "manage-profile",
      label: "Manage Profile",
      icon: "person-circle-outline",
    },
    {
      id: "password-security",
      label: "Password & Security",
      icon: "lock-closed-outline",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: "notifications-outline",
    },
    {
      id: "language",
      label: "Language",
      icon: "language-outline",
      value: "English",
    },
  ];

  const preferencesItems = [
    {
      id: "about-us",
      label: "About Us",
      icon: "document-text-outline",
    },
    {
      id: "theme",
      label: "Theme",
      icon: "color-palette-outline",
      value: "Light",
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: "calendar-outline",
    },
  ];

  const supportItems = [
    {
      id: "help-center",
      label: "Help Center",
      icon: "help-circle-outline",
    },
  ];

  const renderMenuItem = (item, index, total) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, index === total - 1 && styles.menuItemLast]}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons
          name={item.icon}
          size={22}
          color={colors.text}
          style={styles.menuIcon}
        />
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemLabel}>{item.label}</Text>
          {item.value && <Text style={styles.menuItemValue}>{item.value}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Profile Summary Section */}
      <View style={styles.profileCard}>
        <View style={styles.profileCardContent}>
          <View style={styles.avatarContainer}>
            <ExpoImage
              source={
                userData.profileImage
                  ? { uri: userData.profileImage }
                  : {
                      uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
                    }
              }
              style={styles.avatar}
              contentFit="cover"
              placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
            />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
          </View>
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuCard}>
          {accountItems.map((item, index) =>
            renderMenuItem(item, index, accountItems.length)
          )}
        </View>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.menuCard}>
          {preferencesItems.map((item, index) =>
            renderMenuItem(item, index, preferencesItems.length)
          )}
        </View>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.menuCard}>
          {supportItems.map((item, index) =>
            renderMenuItem(item, index, supportItems.length)
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: 100,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    fontFamily: fonts.regular,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 24,
    padding: 16,
  },
  profileCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
    fontFamily: fonts.regular,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.text,
    fontFamily: fonts.regular,
  },
  menuItemValue: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
    fontFamily: fonts.regular,
  },
});

export default ProfileScreen;
