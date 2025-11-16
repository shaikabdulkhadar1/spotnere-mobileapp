import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import PlaceCard from "./PlaceCard";
import SkeletonCard from "./SkeletonCard";
import { colors } from "../constants/colors";

const { width, height } = Dimensions.get("window");

const HomeScreen = ({
  places50km,
  placesCity,
  placesState,
  placesCountry,
  city,
  userState,
  userCountry,
  onPlacePress,
}) => {
  // Check if places are loaded (not empty arrays)
  const hasPlacesLoaded = (places) => {
    return places && places.length > 0;
  };

  // Ensure skeletons show for at least 3 seconds on initial load
  const [showSkeletons, setShowSkeletons] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowSkeletons(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Content Section - 20% of screen height (Scrollable) */}
      <View style={styles.headerContentSection}>
        <Text style={styles.headerGreeting}>Hello user,</Text>
        <Text style={styles.headerSubtitle}>what's on your mind today?</Text>
      </View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBarContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchBar}
            placeholder="Search"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Top places in 50km Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top places in 50km</Text>
          <TouchableOpacity>
            <Text style={styles.seeMoreText}>See more...</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {showSkeletons || !hasPlacesLoaded(places50km) ? (
            Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard key={`skeleton-50km-${index}`} />
            ))
          ) : places50km.length > 0 ? (
            places50km.map((place, index) => (
              <PlaceCard
                key={place.id || index}
                title={place.title}
                price={place.price}
                rating={place.rating}
                imageUri={place.imageUri}
                showBadge={place.showBadge}
                isSmall={place.isSmall}
                placeId={place.id}
                onPress={onPlacePress}
              />
            ))
          ) : (
            <Text style={styles.noDataText}>No places found</Text>
          )}
        </ScrollView>
      </View>

      {/* Top places in city Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top places in {city}</Text>
          <TouchableOpacity>
            <Text style={styles.seeMoreText}>See more...</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {showSkeletons || !hasPlacesLoaded(placesCity) ? (
            Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard key={`skeleton-city-${index}`} />
            ))
          ) : placesCity.length > 0 ? (
            placesCity.map((place, index) => (
              <PlaceCard
                key={place.id || index}
                title={place.title}
                price={place.price}
                rating={place.rating}
                imageUri={place.imageUri}
                showBadge={place.showBadge}
                isSmall={place.isSmall}
                placeId={place.id}
                onPress={onPlacePress}
              />
            ))
          ) : (
            <Text style={styles.noDataText}>No places found</Text>
          )}
        </ScrollView>
      </View>

      {/* Top places in state Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Top places in {userState || "state"}
          </Text>
          <TouchableOpacity>
            <Text style={styles.seeMoreText}>See more...</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {showSkeletons || !hasPlacesLoaded(placesState) ? (
            Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard key={`skeleton-state-${index}`} />
            ))
          ) : placesState.length > 0 ? (
            placesState.map((place, index) => (
              <PlaceCard
                key={place.id || index}
                title={place.title}
                price={place.price}
                rating={place.rating}
                imageUri={place.imageUri}
                showBadge={place.showBadge}
                isSmall={place.isSmall}
                placeId={place.id}
                onPress={onPlacePress}
              />
            ))
          ) : (
            <Text style={styles.noDataText}>No places found</Text>
          )}
        </ScrollView>
      </View>

      {/* Top places in country Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Top places in {userCountry || "country"}
          </Text>
          <TouchableOpacity>
            <Text style={styles.seeMoreText}>See more...</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {showSkeletons || !hasPlacesLoaded(placesCountry) ? (
            Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard key={`skeleton-country-${index}`} />
            ))
          ) : placesCountry.length > 0 ? (
            placesCountry.map((place, index) => (
              <PlaceCard
                key={place.id || index}
                title={place.title}
                price={place.price}
                rating={place.rating}
                imageUri={place.imageUri}
                showBadge={place.showBadge}
                isSmall={place.isSmall}
                placeId={place.id}
                onPress={onPlacePress}
              />
            ))
          ) : (
            <Text style={styles.noDataText}>No places found</Text>
          )}
        </ScrollView>
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
    paddingBottom: 0, // Account for bottom navbar
    paddingTop: 0, // No padding between avatar and hello user section
  },
  headerContentSection: {
    backgroundColor: colors.background,
    height: 100, // 20% of screen height
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: "center",
    marginTop: Platform.OS === "ios" ? 40 : 20, // Top bar height (paddingTop + paddingBottom + avatar)
    marginHorizontal: 0,
    elevation: 8,
  },
  headerGreeting: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 10,
    color: colors.text,
    letterSpacing: 0.3,
    lineHeight: 32,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.text,
    letterSpacing: 0.3,
    lineHeight: 24,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
    color: colors.textSecondary,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  section: {
    marginTop: 8,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  seeMoreText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: "500",
  },
  horizontalScroll: {
    marginHorizontal: 16,
  },
  horizontalScrollContent: {
    paddingRight: 16,
  },
  noDataText: {
    fontSize: 14,
    color: colors.textSecondary,
    padding: 20,
    textAlign: "center",
  },
});

export default HomeScreen;
