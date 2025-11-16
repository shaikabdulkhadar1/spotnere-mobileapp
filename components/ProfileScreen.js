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

const { width } = Dimensions.get("window");

const ProfileScreen = () => {
  // Mock user data - replace with actual user data from auth/database
  const userData = {
    name: "Terry Melton",
    email: "melton89@gmail.com",
    phone: "+1 201 555-0123",
    address: "70 Rainey Street, Apartment 146, Austin TX 78701",
    profileImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
  };

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

      {/* Profile Picture Section */}
      <View style={styles.profilePictureSection}>
        <View style={styles.profilePictureContainer}>
          <ExpoImage
            source={
              userData.profileImage
                ? { uri: userData.profileImage }
                : {
                    uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
                  }
            }
            style={styles.profilePicture}
            contentFit="cover"
            placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
          />
          <TouchableOpacity style={styles.editPictureButton}>
            <Ionicons name="pencil" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Personal Info Section */}
      <View style={styles.settingsCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.settingsCardTitle}>Personal info</Text>
          <TouchableOpacity>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.settingsCardContent}>
          {/* Name */}
          <View style={styles.settingsRow}>
            <Ionicons
              name="person-outline"
              size={20}
              color={colors.textSecondary}
              style={styles.rowIcon}
            />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Name</Text>
              <Text style={styles.rowValue}>{userData.name}</Text>
            </View>
          </View>

          {/* Email */}
          <View style={styles.settingsRow}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={colors.textSecondary}
              style={styles.rowIcon}
            />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>E-mail</Text>
              <Text style={styles.rowValue}>{userData.email}</Text>
            </View>
          </View>

          {/* Phone */}
          <View style={styles.settingsRow}>
            <Ionicons
              name="call-outline"
              size={20}
              color={colors.textSecondary}
              style={styles.rowIcon}
            />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Phone number</Text>
              <Text style={styles.rowValue}>{userData.phone}</Text>
            </View>
          </View>

          {/* Address */}
          <View style={[styles.settingsRow, styles.settingsRowLast]}>
            <Ionicons
              name="home-outline"
              size={20}
              color={colors.textSecondary}
              style={styles.rowIcon}
            />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Home address</Text>
              <Text style={styles.rowValue}>{userData.address}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Account Info Section */}
      <View style={styles.settingsCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.settingsCardTitle}>Account info</Text>
        </View>
        <View style={styles.settingsCardContent}>
          {/* Placeholder - can add account-related fields here */}
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
    paddingTop: Platform.OS === "ios" ? 120 : 110, // Top bar height
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
  },
  profilePictureSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  profilePictureContainer: {
    position: "relative",
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
  },
  editPictureButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.cardBackground,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 12,
  },
  settingsCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.secondary,
  },
  settingsCardContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsRowLast: {
    borderBottomWidth: 0,
  },
  rowIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: 4,
  },
  rowValue: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.text,
    lineHeight: 22,
  },
});

export default ProfileScreen;

