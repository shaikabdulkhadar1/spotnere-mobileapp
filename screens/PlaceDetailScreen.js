import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
  Linking,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { supabase } from "../config/supabase";
import { colors } from "../constants/colors";
import { fonts } from "../constants/fonts";
import { getCurrentUser } from "../utils/auth";
import {
  saveFavoriteToDatabase,
  removeFavoriteFromDatabase,
  isFavoriteInDatabase,
} from "../utils/favorites";

const { width, height } = Dimensions.get("window");

const PlaceDetailScreen = ({ placeId, onClose }) => {
  const [placeDetails, setPlaceDetails] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (placeId) {
      fetchPlaceDetails();
      fetchReviews();
      checkFavoriteStatus();
    }
  }, [placeId]);

  // Check favorite status on mount
  const checkFavoriteStatus = async () => {
    if (placeId) {
      const user = await getCurrentUser();
      if (user && user.id) {
        const favorited = await isFavoriteInDatabase(user.id, placeId);
        setIsFavorited(favorited);
      }
    }
  };

  const handleFavoritePress = async () => {
    if (!placeId) {
      console.warn("Place ID is required to favorite");
      return;
    }

    const user = await getCurrentUser();
    if (!user || !user.id) {
      console.warn("User must be logged in to favorite places");
      return;
    }

    const newFavoriteState = !isFavorited;
    setIsFavorited(newFavoriteState);

    // Heart pop animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.3,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Save or remove from database
    if (newFavoriteState) {
      const result = await saveFavoriteToDatabase(user.id, placeId);
      if (!result.success) {
        // Revert state if save failed
        setIsFavorited(false);
        console.error("Failed to save favorite:", result.error);
      }
    } else {
      const result = await removeFavoriteFromDatabase(user.id, placeId);
      if (!result.success) {
        // Revert state if remove failed
        setIsFavorited(true);
        console.error("Failed to remove favorite:", result.error);
      }
    }
  };

  const fetchPlaceDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("places")
        .select("*")
        .eq("id", placeId)
        .single();

      if (fetchError) {
        console.error("❌ Error fetching place details:", fetchError);
        throw fetchError;
      }

      setPlaceDetails(data);
    } catch (err) {
      console.error("Error fetching place details:", err);
      setError(err.message || "Failed to fetch place details");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      // Try to fetch reviews from a reviews table, or use placeholder data
      const { data, error: fetchError } = await supabase
        .from("reviews")
        .select("*")
        .eq("place_id", placeId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (fetchError) {
        console.warn("⚠️ No reviews table or error:", fetchError);
        // Use placeholder reviews if table doesn't exist
        setReviews([
          {
            id: 1,
            text: "Absolutely loved the ambiance at this place! The live music created the perfect vibe.",
            user_name: "Emma R.",
            rating: 4.5,
            user_avatar:
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
          },
          {
            id: 2,
            text: "A hidden gem! The food was hearty, and the experience was memorable.",
            user_name: "James T.",
            rating: 4.0,
            user_avatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
          },
        ]);
      } else {
        setReviews(data || []);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading place details...</Text>
        </View>
      </View>
    );
  }

  if (error || !placeDetails) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || "Place not found"}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchPlaceDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const rating = parseFloat(
    placeDetails.rating || placeDetails.average_rating || 0
  );
  const likes = placeDetails.likes || placeDetails.favorites || 1300;
  const imageUri =
    placeDetails.banner_image_link ||
    placeDetails.image ||
    placeDetails.photo_url;

  // Utility function to capitalize first letter
  const capitalizeFirst = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  // Utility function to format amenities: capitalize first letter and replace dashes with spaces
  const formatAmenity = (amenity) => {
    if (!amenity) return "";
    return amenity
      .replace(/-/g, " ") // Replace all dashes with spaces
      .split(" ")
      .map((word) => capitalizeFirst(word)) // Capitalize first letter of each word
      .join(" ");
  };

  // Render opening hours
  const renderOpeningHours = (place) => {
    let hours = null;

    // Try different possible field names for opening hours
    if (place.opening_hours_json) {
      try {
        hours =
          typeof place.opening_hours_json === "string"
            ? JSON.parse(place.opening_hours_json)
            : place.opening_hours_json;
      } catch (e) {
        console.error("Error parsing opening_hours_json:", e);
      }
    } else if (place.opening_hours) {
      hours =
        typeof place.opening_hours === "string"
          ? JSON.parse(place.opening_hours)
          : place.opening_hours;
    } else if (place.hours) {
      hours =
        typeof place.hours === "string" ? JSON.parse(place.hours) : place.hours;
    }

    // Default hours if not available
    if (!hours) {
      const defaultHours = {
        Monday: "9:00 AM - 10:00 PM",
        Tuesday: "9:00 AM - 10:00 PM",
        Wednesday: "9:00 AM - 10:00 PM",
        Thursday: "9:00 AM - 10:00 PM",
        Friday: "9:00 AM - 11:00 PM",
        Saturday: "10:00 AM - 11:00 PM",
        Sunday: "10:00 AM - 9:00 PM",
      };
      hours = defaultHours;
    }

    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    return days.map((day, index) => {
      let dayHoursRaw =
        hours[day] || hours[day.toLowerCase()] || hours[index] || null;

      // Handle different formats: object with {day, open, close}, string, or array
      let dayHours = "Closed";

      if (dayHoursRaw) {
        if (typeof dayHoursRaw === "string") {
          dayHours = dayHoursRaw;
        } else if (typeof dayHoursRaw === "object") {
          // Handle object format: {day, open, close} or {open, close}
          if (dayHoursRaw.open && dayHoursRaw.close) {
            dayHours = `${dayHoursRaw.open} - ${dayHoursRaw.close}`;
          } else if (
            dayHoursRaw.close === null ||
            dayHoursRaw.close === false
          ) {
            dayHours = "Closed";
          } else {
            dayHours = JSON.stringify(dayHoursRaw); // Fallback
          }
        } else if (Array.isArray(dayHoursRaw)) {
          // Handle array format: ["9:00 AM", "10:00 PM"]
          if (dayHoursRaw.length >= 2) {
            dayHours = `${dayHoursRaw[0]} - ${dayHoursRaw[1]}`;
          } else if (dayHoursRaw.length === 1) {
            dayHours = dayHoursRaw[0];
          }
        }
      }

      const isToday =
        new Date().toLocaleDateString("en-US", { weekday: "long" }) === day;
      const isLast = index === days.length - 1;

      return (
        <View
          key={day}
          style={[
            styles.settingsRow,
            isToday && styles.settingsRowToday,
            isLast && styles.settingsRowLast,
          ]}
        >
          <Text
            style={[
              styles.settingsRowLabel,
              isToday && styles.settingsRowLabelToday,
            ]}
          >
            {day}
          </Text>
          <Text
            style={[
              styles.settingsRowValue,
              isToday && styles.settingsRowValueToday,
            ]}
          >
            {dayHours}
          </Text>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image with Title Overlay */}
        <View style={styles.heroImageContainer}>
          <ExpoImage
            source={
              imageUri
                ? { uri: imageUri }
                : {
                    uri: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
                  }
            }
            style={styles.heroImage}
            contentFit="cover"
            placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
          />

          {/* White Gradient Overlay at Bottom - Blends into image */}
          <LinearGradient
            colors={[
              "transparent",
              "rgba(220, 226, 229, 0.1)",
              "rgba(220, 226, 229, 0.65)",
              "#fff",
            ]}
            locations={[0, 0.3, 0.7, 1]}
            style={styles.imageGradientOverlay}
          />

          {/* Header with Back Button and Heart */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleFavoritePress}
              activeOpacity={0.7}
            >
              <BlurView
                intensity={18}
                tint="light"
                style={styles.heartBlurContainer}
              >
                <Animated.View
                  style={[
                    styles.heartIconContainer,
                    {
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                >
                  <Ionicons
                    name={isFavorited ? "heart" : "heart-outline"}
                    size={18}
                    color={isFavorited ? "#FF3B30" : "#000000"}
                  />
                </Animated.View>
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Title and Info Overlay on Image */}
          <View style={styles.titleOverlay}>
            <Text style={styles.title}>
              {placeDetails.title ||
                placeDetails.name ||
                placeDetails.place_name ||
                "Place"}
            </Text>
          </View>
        </View>

        {/* Main Content - Light Theme */}
        <View style={styles.content}>
          {/* Pub Badge */}
          <TouchableOpacity style={styles.badgeButton}>
            <Ionicons name="shield-checkmark" size={16} />
            <Text style={styles.badgeText}>
              {capitalizeFirst(placeDetails.category || "Category")}
            </Text>
          </TouchableOpacity>

          <View style={styles.locationInfoRow}>
            <Ionicons name="location" size={16} color="#90EE90" />
            <Text style={styles.location}>
              {placeDetails.city || placeDetails.location || "Location"}
              {placeDetails.state && `, ${placeDetails.state}`}
            </Text>
            <View style={styles.ratingLikesRow}>
              <Ionicons name="star" size={16} color="#90EE90" />
              <Text style={styles.ratingText}>{rating.toFixed(1)} Rate</Text>
              <Ionicons
                name="heart"
                size={16}
                color="#90EE90"
                style={{ marginLeft: 12 }}
              />
              <Text style={styles.likesText}>
                {(likes / 1000).toFixed(1)} K
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.description}>
              {placeDetails.description ||
                "A Scottish-themed pub in London offering whiskeys, craft beers, and traditional dishes, with rustic decor and live folk music. A favorite among locals and tourists."}
            </Text>
          </View>

          {/* Place Details Section */}
          <View style={styles.settingsCard}>
            <Text style={styles.settingsCardTitle}>Details</Text>
            <View style={styles.settingsCardContent}>
              {(() => {
                const rows = [];

                // Average Price
                if (
                  placeDetails.avg_price ||
                  placeDetails.price_per_night ||
                  placeDetails.price
                ) {
                  rows.push({
                    key: "price",
                    element: (
                      <View key="price" style={styles.settingsRow}>
                        <Text style={styles.settingsRowLabel}>
                          Average Price
                        </Text>
                        <Text style={styles.settingsRowValue}>
                          $
                          {placeDetails.avg_price ||
                            placeDetails.price_per_night ||
                            placeDetails.price}{" "}
                          {placeDetails.price_unit || "per person"}
                        </Text>
                      </View>
                    ),
                  });
                }

                // Amenities
                if (placeDetails.amenities) {
                  rows.push({
                    key: "amenities",
                    element: (
                      <View key="amenities" style={styles.settingsRow}>
                        <Text style={styles.settingsRowLabel}>Amenities</Text>
                        <View style={styles.settingsRowValueContainer}>
                          {Array.isArray(placeDetails.amenities) ? (
                            <View style={styles.amenitiesList}>
                              {placeDetails.amenities
                                .slice(0, 3)
                                .map((amenity, index) => (
                                  <Text key={index} style={styles.amenityChip}>
                                    {formatAmenity(amenity)}
                                  </Text>
                                ))}
                              {placeDetails.amenities.length > 3 && (
                                <Text style={styles.amenityChip}>
                                  +{placeDetails.amenities.length - 3}
                                </Text>
                              )}
                            </View>
                          ) : (
                            <Text
                              style={styles.settingsRowValue}
                              numberOfLines={1}
                            >
                              {formatAmenity(placeDetails.amenities)}
                            </Text>
                          )}
                        </View>
                      </View>
                    ),
                  });
                }

                // Phone Number
                if (
                  placeDetails.phone ||
                  placeDetails.phone_number ||
                  placeDetails.contact_phone
                ) {
                  rows.push({
                    key: "phone",
                    element: (
                      <TouchableOpacity
                        key="phone"
                        style={styles.settingsRow}
                        onPress={() => {
                          const phone =
                            placeDetails.phone ||
                            placeDetails.phone_number ||
                            placeDetails.contact_phone;
                          Linking.openURL(`tel:${phone}`);
                        }}
                      >
                        <Text style={styles.settingsRowLabel}>Phone</Text>
                        <View style={styles.settingsRowRight}>
                          <Text style={styles.settingsRowValue}>
                            {placeDetails.phone ||
                              placeDetails.phone_number ||
                              placeDetails.contact_phone}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ),
                  });
                }

                // Website
                if (
                  placeDetails.website ||
                  placeDetails.website_url ||
                  placeDetails.url
                ) {
                  rows.push({
                    key: "website",
                    element: (
                      <TouchableOpacity
                        key="website"
                        style={styles.settingsRow}
                        onPress={() => {
                          let url =
                            placeDetails.website ||
                            placeDetails.website_url ||
                            placeDetails.url;
                          if (
                            !url.startsWith("http://") &&
                            !url.startsWith("https://")
                          ) {
                            url = `https://${url}`;
                          }
                          Linking.openURL(url);
                        }}
                      >
                        <Text style={styles.settingsRowLabel}>Website</Text>
                        <View style={styles.settingsRowRight}>
                          <Text
                            style={[
                              styles.settingsRowValue,
                              styles.websiteText,
                            ]}
                            numberOfLines={1}
                          >
                            {placeDetails.website ||
                              placeDetails.website_url ||
                              placeDetails.url}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ),
                  });
                }

                return rows.map((row, index) => {
                  const isLast = index === rows.length - 1;
                  return (
                    <View
                      key={row.key}
                      style={isLast && styles.settingsRowLast}
                    >
                      {row.element}
                    </View>
                  );
                });
              })()}
            </View>
          </View>

          {/* Opening Hours Section */}
          <View style={styles.settingsCard}>
            <Text style={styles.settingsCardTitle}>Opening Hours</Text>
            <View style={styles.settingsCardContent}>
              {renderOpeningHours(placeDetails)}
            </View>
          </View>

          {/* Reviews Section Header */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.reviewsTitle}>Reviews</Text>
            <TouchableOpacity style={styles.discoverButton}>
              <Text style={styles.discoverButtonText}>Add a review</Text>
            </TouchableOpacity>
          </View>

          {/* Reviews List */}
          <View style={styles.reviewsList}>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <Text style={styles.reviewText}>
                    {review.text || review.review_text || review.comment}
                  </Text>
                  <View style={styles.reviewFooter}>
                    <View style={styles.reviewUser}>
                      <ExpoImage
                        source={{
                          uri:
                            review.user_avatar ||
                            review.avatar ||
                            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
                        }}
                        style={styles.reviewAvatar}
                        contentFit="cover"
                      />
                      <Text style={styles.reviewUserName}>
                        {review.user_name || review.name || `User ${review.id}`}
                      </Text>
                    </View>
                    <View style={styles.reviewRating}>
                      <Ionicons name="star-outline" size={16} color="#333" />
                      <Text style={styles.reviewRatingText}>
                        {(review.rating || 4.0).toFixed(1)} Rate
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noReviewsText}>No reviews yet</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.bookNowButton}>
          <Text style={styles.bookNowButtonText}>Book now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroImageContainer: {
    width: "100%",
    height: height * 0.4,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  imageGradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 300, // Increased height for better gradient blend
  },
  header: {
    position: "absolute",
    top: Platform.OS === "ios" ? 70 : 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.badgeBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  heartBlurContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.badgeBackground,
    overflow: "hidden",
  },
  heartIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  titleOverlay: {
    position: "absolute",
    bottom: 0, // Positioned at the bottom
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 40, // More space from image
    paddingBottom: 0,
    zIndex: 5,
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.regular,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 0,
  },
  locationInfoRow: {
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  location: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
    marginLeft: 6,
    marginRight: 16,
  },
  ratingLikesRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
    marginLeft: 4,
    fontWeight: "500",
  },
  likesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  likesText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
    marginLeft: 4,
    fontWeight: "500",
  },
  content: {
    padding: 20,
    backgroundColor: colors.background,
  },
  badgeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 6,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
    lineHeight: 24,
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 20,
    // Only apply overflow hidden on Android to maintain rounded corners
    // On iOS, we need overflow visible for shadows to show
    ...(Platform.OS === "android" && {
      overflow: "hidden",
    }),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsCardTitle: {
    fontSize: 18,
    fontFamily: fonts.regular,
    fontFamily: fonts.semiBold,
    color: colors.text,
    padding: 20,
    paddingBottom: 3,
  },
  settingsCardContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  settingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsRowLast: {
    borderBottomWidth: 0,
  },
  settingsRowToday: {
    backgroundColor: colors.todayRow,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: -12,
    borderBottomWidth: 0,
  },
  settingsRowLabel: {
    fontSize: 16,
    fontFamily: fonts.regular,
    fontWeight: "500",
    color: colors.text,
    flex: 1,
  },
  settingsRowLabelToday: {
    fontFamily: fonts.semiBold,
  },
  settingsRowValue: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontWeight: "400",
    textAlign: "right",
  },
  settingsRowValueToday: {
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  settingsRowRight: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  chevron: {
    marginLeft: 8,
  },
  websiteText: {
    maxWidth: 200,
  },
  settingsRowValueContainer: {
    // flex: 1,
    // alignItems: "flex-end",
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  reviewsTitle: {
    fontSize: 20,
    fontFamily: fonts.regular,
    fontWeight: "700",
    color: colors.text,
  },
  discoverButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  discoverButtonText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    fontWeight: "600",
    color: "#fff",
  },
  reviewsList: {
    marginBottom: 20,
  },
  reviewCard: {
    backgroundColor: "#2A2A3E", // Dark gray
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: "#fff",
    lineHeight: 22,
    marginBottom: 12,
    opacity: 0.9,
  },
  reviewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewUser: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  reviewUserName: {
    fontSize: 14,
    fontFamily: fonts.regular,
    fontWeight: "600",
    color: "#fff",
  },
  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewRatingText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
    marginLeft: 4,
    fontWeight: "500",
  },
  noReviewsText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: "center",
    paddingVertical: 20,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    backgroundColor: colors.cardBackground,
  },
  bookNowButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bookNowButtonText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    fontWeight: "600",
    color: "#fff",
  },
  amenitiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    maxWidth: 200,
  },
  amenityChip: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#666",
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 6,
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.error,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: fonts.regular,
    fontWeight: "600",
  },
});

export default PlaceDetailScreen;
