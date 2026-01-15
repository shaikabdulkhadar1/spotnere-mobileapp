import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { fonts } from "../constants/fonts";
import LoginForm from "./LoginForm";
import LoginScreen from "./LoginScreen";
import { getCurrentUser, logout } from "../utils/auth";

const { width } = Dimensions.get("window");

const ProfileScreen = ({ onLoginSuccess }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const user = await getCurrentUser();
    if (user) {
      setIsLoggedIn(true);
      setUserData(user);
    } else {
      setIsLoggedIn(false);
      setUserData(null);
    }
  };

  const handleLogin = async (userData) => {
    // User data is already stored in auth utility by loginUser function
    setIsLoggedIn(true);
    setUserData(userData);
    setShowLoginForm(false);
    if (onLoginSuccess) {
      onLoginSuccess(userData);
    }
  };

  const handleRegister = async (userData) => {
    // User data is already stored in auth utility by registerUser function
    setIsLoggedIn(true);
    setUserData(userData);
    setShowRegisterForm(false);
    if (onLoginSuccess) {
      onLoginSuccess(userData);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false);
    setUserData(null);
    setShowLoginForm(false);
    setShowRegisterForm(false);
  };

  // Generate initials from first name and last name
  const getInitials = (firstName, lastName) => {
    const firstInitial =
      firstName && firstName.length > 0
        ? firstName.charAt(0).toUpperCase()
        : "";
    const lastInitial =
      lastName && lastName.length > 0 ? lastName.charAt(0).toUpperCase() : "";
    return `${firstInitial}${lastInitial}` || "U"; // Default to "U" if no name
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

  // Show registration form
  if (showRegisterForm) {
    return (
      <LoginScreen
        onLoginSuccess={handleRegister}
        onBack={() => setShowRegisterForm(false)}
      />
    );
  }

  // Show login form
  if (showLoginForm) {
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowLoginForm(false)}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <LoginForm
          onLoginSuccess={handleLogin}
          onSwitchToRegister={() => {
            setShowLoginForm(false);
            setShowRegisterForm(true);
          }}
        />
      </ScrollView>
    );
  }

  // Show logged out state
  if (!isLoggedIn) {
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentCentered}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.loggedOutContainer}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="person-circle-outline"
              size={80}
              color={colors.textSecondary}
            />
          </View>
          <Text style={styles.loggedOutTitle}>Welcome to Spotnere</Text>
          <Text style={styles.loggedOutSubtitle}>
            Sign in to access your profile, favorites, and trips
          </Text>

          <View style={styles.authButtonsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setShowLoginForm(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setShowRegisterForm(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Show logged in state - original profile design
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
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(
                  userData?.firstName || "",
                  userData?.lastName || ""
                )}
              </Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{userData?.name || "User"}</Text>
            <Text style={styles.userEmail}>{userData?.email || ""}</Text>
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

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color={colors.error}
            style={styles.menuIcon}
          />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
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
  scrollContentCentered: {
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: 100,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
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
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.cardBackground,
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
  loggedOutContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  loggedOutTitle: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  loggedOutSubtitle: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  authButtonsContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: "#FFFFFF",
  },
  secondaryButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutButtonText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.error,
    marginLeft: 8,
  },
});

export default ProfileScreen;
