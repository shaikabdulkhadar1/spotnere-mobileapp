import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Dimensions } from "react-native";
import { colors } from "../constants/colors";

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
        <TouchableOpacity style={styles.heartButton}>
          <Text style={styles.heartIcon}>♡</Text>
        </TouchableOpacity>
      </View>

      {/* Card Content */}
      <View style={[styles.cardContent, isSmall && styles.cardContentSmall]}>
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
  placeCardSmall: {
    width: (width - 64) * 0.35, // Smaller width for third card
  },
  cardImageContainer: {
    width: "100%",
    height: (width - 64) * 0.4,
    position: "relative",
    backgroundColor: colors.surface,
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
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
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
    fontSize: 11,
    fontWeight: "600",
    color: colors.text,
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  heartIcon: {
    fontSize: 20,
    color: colors.secondary,
  },
  cardContent: {
    padding: 12,
    flex: 1,
  },
  cardContentSmall: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 4,
  },
  cardTitleSmall: {
    fontSize: 13,
    marginBottom: 3,
  },
  cardPrice: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  cardPriceSmall: {
    fontSize: 12,
    marginBottom: 4,
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
  },
  ratingTextSmall: {
    fontSize: 12,
  },
});

export default PlaceCard;
