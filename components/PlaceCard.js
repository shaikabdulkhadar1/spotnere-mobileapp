import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Animated,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Dimensions } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { fonts } from "../constants/fonts";
import { getCurrentUser } from "../utils/auth";
import {
  saveFavoriteToDatabase,
  removeFavoriteFromDatabase,
  isFavoriteInDatabase,
} from "../utils/favorites";

const { width } = Dimensions.get("window");

const PlaceCard = ({
  title,
  price,
  rating,
  imageUri,
  showBadge = true,
  isSmall = false,
  containerStyle,
  placeId,
  onPress,
  onImageLoad,
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Check favorite status on mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (placeId) {
        const user = await getCurrentUser();
        if (user && user.id) {
          const favorited = await isFavoriteInDatabase(user.id, placeId);
          setIsFavorited(favorited);
        }
      }
    };
    checkFavoriteStatus();
  }, [placeId]);

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
  return (
    <TouchableOpacity
      style={[
        styles.placeCard,
        isSmall && styles.placeCardSmall,
        containerStyle,
      ]}
      onPress={() => onPress && placeId && onPress(placeId)}
      activeOpacity={0.8}
    >
      {/* Image Container */}
      <View
        style={[
          styles.cardImageContainer,
          isSmall && styles.cardImageContainerSmall,
          Platform.OS === "ios" && styles.cardImageContainerIOS,
        ]}
      >
        <ExpoImage
          source={
            imageUri
              ? { uri: imageUri }
              : {
                  uri: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
                }
          }
          style={styles.cardImage}
          contentFit="cover"
          placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
          onLoad={() => {
            if (onImageLoad) {
              onImageLoad();
            }
          }}
        />

        {/* Guest Favorite Badge */}
        {showBadge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Guest favorite</Text>
          </View>
        )}

        {/* Heart Icon */}
        <TouchableOpacity
          style={styles.heartButton}
          activeOpacity={0.7}
          onPress={handleFavoritePress}
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
                size={14}
                color={isFavorited ? "#FF3B30" : "#000000"}
              />
            </Animated.View>
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* Card Content */}
      <View
        style={[
          styles.cardContent,
          isSmall && styles.cardContentSmall,
          Platform.OS === "ios" && styles.cardContentIOS,
        ]}
      >
        <Text
          style={[styles.cardTitle, isSmall && styles.cardTitleSmall]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text style={[styles.cardPrice, isSmall && styles.cardPriceSmall]}>
          {price}
        </Text>
        <View style={styles.cardRating}>
          <Text style={styles.starIcon}>★</Text>
          <Text style={[styles.ratingText, isSmall && styles.ratingTextSmall]}>
            {rating}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  placeCard: {
    width: (width - 64) * 0.5, // Two large cards with spacing
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
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
  placeCardSmall: {
    width: (width - 64) * 0.35, // Smaller width for third card
  },
  cardImageContainer: {
    width: "100%",
    height: (width - 64) * 0.4,
    position: "relative",
    backgroundColor: colors.surface,
    // On Android, overflow hidden is handled by parent
    // On iOS, we need overflow hidden here to clip image corners
    ...(Platform.OS === "ios" && {
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      overflow: "hidden",
    }),
  },
  cardImageContainerIOS: {
    // Additional iOS-specific styling if needed
  },
  cardImageContainerSmall: {
    height: (width - 64) * 0.35, // Slightly smaller image for small card but proportional
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: colors.badgeBackground,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.text,
    fontFamily: fonts.regular,
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  heartBlurContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.badgeBackground,
    overflow: "hidden",
  },
  cardContent: {
    padding: 12,
    flex: 1,
    // On iOS, ensure content respects border radius
    ...(Platform.OS === "ios" && {
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      overflow: "hidden",
    }),
  },
  cardContentIOS: {
    // Additional iOS-specific styling if needed
  },
  cardContentSmall: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 4,
    fontFamily: fonts.semiBold,
  },
  cardTitleSmall: {
    fontSize: 10,
    marginBottom: 3,
    fontFamily: fonts.semiBold,
  },
  cardPrice: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    fontFamily: fonts.regular,
  },
  cardPriceSmall: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: fonts.regular,
  },
  cardRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    fontSize: 14,
    color: colors.warning,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    fontFamily: fonts.regular,
  },
  ratingTextSmall: {
    fontSize: 12,
    fontFamily: fonts.regular,
  },
});

export default PlaceCard;
