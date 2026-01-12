import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Platform,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../config/supabase";
import PlaceCard from "./PlaceCard";
import SkeletonCard from "./SkeletonCard";
import { colors } from "../constants/colors";
import { getCachedPlaces, setCachedPlaces } from "../utils/placesCache";

const { width } = Dimensions.get("window");

const ExploreScreen = ({ userCountry, onPlacePress }) => {
  const [allPlaces, setAllPlaces] = useState([]); // Original unfiltered places
  const [explorePlaces, setExplorePlaces] = useState([]); // Filtered places to display
  const [exploreLoading, setExploreLoading] = useState(false);
  const [filtering, setFiltering] = useState(false); // Loading state when applying filters
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filterHeight] = useState(new Animated.Value(0));

  // Filter states
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState(null);

  useEffect(() => {
    if (userCountry) {
      fetchExplorePlaces();
    }
  }, [userCountry]);

  useEffect(() => {
    Animated.timing(filterHeight, {
      toValue: filtersExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [filtersExpanded]);

  // Apply filters function
  const applyFilters = async () => {
    setFiltering(true);
    setFiltersExpanded(false); // Collapse filters immediately

    // Generate random delay between 3-5 seconds
    const delay = Math.random() * 2000 + 3000; // 3000ms to 5000ms

    // Simulate filtering delay
    await new Promise((resolve) => setTimeout(resolve, delay));

    let filtered = [...allPlaces];

    // Filter by price range
    if (selectedPriceRange) {
      const [min, max] = selectedPriceRange
        .split("-")
        .map((p) => parseInt(p.replace("$", "")));
      filtered = filtered.filter((place) => {
        const price = place.avgPrice || 0;
        return price >= min && price <= max;
      });
    }

    // Filter by rating
    if (selectedRating) {
      const minRating = parseFloat(selectedRating.replace("+", ""));
      filtered = filtered.filter((place) => place.rating >= minRating);
    }

    // Filter by property type
    if (selectedPropertyType) {
      filtered = filtered.filter((place) => {
        const type = (place.propertyType || "").toLowerCase();
        return type.includes(selectedPropertyType.toLowerCase());
      });
    }

    setExplorePlaces(filtered);
    setFiltering(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedPriceRange(null);
    setSelectedRating(null);
    setSelectedPropertyType(null);
    setExplorePlaces(allPlaces); // Show all places
  };

  const fetchExplorePlaces = async () => {
    try {
      setExploreLoading(true);

      // Check cache first
      const cachedPlaces = getCachedPlaces(userCountry);
      if (cachedPlaces) {
        console.log("📦 Using cached places for explore, skipping API call");
        // Format cached data for explore screen
        const formatted = cachedPlaces.map((place, index) => ({
          id: place.id,
          title: place.title || place.name || place.place_name || "Place",
          price: `$${place.avg_price || 0} per person`,
          avgPrice: place.avg_price || 0, // Keep numeric price for filtering
          rating: parseFloat(place.rating || place.average_rating || 0),
          ratingString:
            place.rating?.toString() || place.average_rating?.toString() || "0",
          imageUri: place.banner_image_link || place.image || place.photo_url,
          propertyType: place.property_type || place.type || "", // For property type filter
          showBadge: index < 3, // Show badge on first 3 cards
          isSmall: false,
        }));

        setAllPlaces(formatted);
        setExplorePlaces(formatted); // Initially show all places
        setExploreLoading(false);
        return;
      }

      // Fetch all places in the country for explore page
      const { data: allPlaces, error: fetchError } = await supabase
        .from("places")
        .select("*")
        .eq("country", userCountry)
        .limit(50); // Get more places for explore page

      if (fetchError) {
        console.error("❌ Error fetching explore places:", fetchError);
        throw fetchError;
      }

      console.log(`🔍 Explore places found:`, allPlaces?.length || 0);

      // Cache the raw places data (if not already cached)
      if (allPlaces && allPlaces.length > 0) {
        setCachedPlaces(allPlaces, userCountry);
      }

      // Format the data - keep original data for filtering
      const formatted = (allPlaces || []).map((place, index) => ({
        id: place.id,
        title: place.title || place.name || place.place_name || "Place",
        price: `$${place.avg_price || 0} per person`,
        avgPrice: place.avg_price || 0, // Keep numeric price for filtering
        rating: parseFloat(place.rating || place.average_rating || 0),
        ratingString:
          place.rating?.toString() || place.average_rating?.toString() || "0",
        imageUri: place.banner_image_link || place.image || place.photo_url,
        propertyType: place.property_type || place.type || "", // For property type filter
        showBadge: index < 3, // Show badge on first 3 cards
        isSmall: false,
      }));

      setAllPlaces(formatted);
      setExplorePlaces(formatted); // Initially show all places
    } catch (err) {
      console.error("Error fetching explore places:", err);
    } finally {
      setExploreLoading(false);
    }
  };

  // Check if places are loaded (not loading and has data)
  const hasPlacesLoaded =
    !exploreLoading && explorePlaces && explorePlaces.length > 0;

  return (
    <ScrollView
      style={styles.exploreScrollView}
      contentContainerStyle={styles.exploreScrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.exploreHeader}>
        <Text style={styles.exploreTitle}>Explore Places</Text>
        <Text style={styles.exploreSubtitle}>
          Discover amazing places around you
        </Text>
      </View>

      {/* Filters Section */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={styles.filtersHeader}
          onPress={() => setFiltersExpanded(!filtersExpanded)}
          activeOpacity={0.7}
        >
          <Text style={styles.filtersHeaderText}>Filters</Text>
          <Animated.View
            style={{
              transform: [
                {
                  rotate: filterHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "180deg"],
                  }),
                },
              ],
            }}
          >
            <Ionicons
              name="chevron-down"
              size={20}
              color="#000"
              style={styles.filterIcon}
            />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.filtersContent,
            {
              height: filterHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 300],
              }),
              opacity: filterHeight,
            },
          ]}
          pointerEvents={filtersExpanded ? "auto" : "none"}
        >
          <ScrollView
            style={styles.filterScrollView}
            contentContainerStyle={styles.filterOptions}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            scrollEnabled={filtersExpanded}
          >
            {/* Price Range Filter */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Price Range (per person)</Text>
              <View style={styles.filterChips}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedPriceRange === "$10-$50" &&
                      styles.filterChipSelected,
                  ]}
                  onPress={() =>
                    setSelectedPriceRange(
                      selectedPriceRange === "$10-$50" ? null : "$10-$50"
                    )
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedPriceRange === "$10-$50" &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    $10-$50
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedPriceRange === "$50-$100" &&
                      styles.filterChipSelected,
                  ]}
                  onPress={() =>
                    setSelectedPriceRange(
                      selectedPriceRange === "$50-$100" ? null : "$50-$100"
                    )
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedPriceRange === "$50-$100" &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    $50-$100
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedPriceRange === "$100-$200" &&
                      styles.filterChipSelected,
                  ]}
                  onPress={() =>
                    setSelectedPriceRange(
                      selectedPriceRange === "$100-$200" ? null : "$100-$200"
                    )
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedPriceRange === "$100-$200" &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    $100-$200
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedPriceRange === "$200-$500" &&
                      styles.filterChipSelected,
                  ]}
                  onPress={() =>
                    setSelectedPriceRange(
                      selectedPriceRange === "$200-$500" ? null : "$200-$500"
                    )
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedPriceRange === "$200-$500" &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    $200-$500
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Rating Filter */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Minimum Rating</Text>
              <View style={styles.filterChips}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedRating === "4.0+" && styles.filterChipSelected,
                  ]}
                  onPress={() =>
                    setSelectedRating(selectedRating === "4.0+" ? null : "4.0+")
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedRating === "4.0+" &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    4.0+
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedRating === "4.5+" && styles.filterChipSelected,
                  ]}
                  onPress={() =>
                    setSelectedRating(selectedRating === "4.5+" ? null : "4.5+")
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedRating === "4.5+" &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    4.5+
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedRating === "5.0" && styles.filterChipSelected,
                  ]}
                  onPress={() =>
                    setSelectedRating(selectedRating === "5.0" ? null : "5.0")
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedRating === "5.0" && styles.filterChipTextSelected,
                    ]}
                  >
                    5.0
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Property Type Filter */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Property Type</Text>
              <View style={styles.filterChips}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedPropertyType === "Apartment" &&
                      styles.filterChipSelected,
                  ]}
                  onPress={() =>
                    setSelectedPropertyType(
                      selectedPropertyType === "Apartment" ? null : "Apartment"
                    )
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedPropertyType === "Apartment" &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    Apartment
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedPropertyType === "House" &&
                      styles.filterChipSelected,
                  ]}
                  onPress={() =>
                    setSelectedPropertyType(
                      selectedPropertyType === "House" ? null : "House"
                    )
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedPropertyType === "House" &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    House
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedPropertyType === "Villa" &&
                      styles.filterChipSelected,
                  ]}
                  onPress={() =>
                    setSelectedPropertyType(
                      selectedPropertyType === "Villa" ? null : "Villa"
                    )
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedPropertyType === "Villa" &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    Villa
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedPropertyType === "Condo" &&
                      styles.filterChipSelected,
                  ]}
                  onPress={() =>
                    setSelectedPropertyType(
                      selectedPropertyType === "Condo" ? null : "Condo"
                    )
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedPropertyType === "Condo" &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    Condo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.filterActions}>
              <TouchableOpacity
                style={[styles.filterButton, styles.clearButton]}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, styles.applyButton]}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>

      <View style={styles.exploreGrid}>
        {filtering || !hasPlacesLoaded ? (
          // Show skeleton loaders while filtering or loading
          Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))
        ) : explorePlaces.length > 0 ? (
          explorePlaces.map((place, index) => (
            <PlaceCard
              key={place.id || index}
              title={place.title}
              price={place.price}
              rating={place.ratingString}
              imageUri={place.imageUri}
              showBadge={place.showBadge}
              isSmall={false}
              containerStyle={styles.exploreCard}
              placeId={place.id}
              onPress={onPlacePress}
            />
          ))
        ) : (
          <View style={styles.exploreEmpty}>
            <Text style={styles.noDataText}>No places found</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  exploreScrollView: {
    flex: 1,
  },
  exploreScrollContent: {
    paddingTop: Platform.OS === "ios" ? 120 : 110, // Top bar height
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  exploreHeader: {
    paddingTop: 0,
    marginBottom: 24,
  },
  exploreTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  exploreSubtitle: {
    fontSize: 16,
    color: colors.text,
  },
  filtersContainer: {
    marginBottom: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
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
  filtersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.surface,
  },
  filtersHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  filterIcon: {
    marginLeft: 8,
  },
  filtersContent: {
    overflow: "hidden",
  },
  filterScrollView: {
    flex: 1,
    backgroundColor: colors.cardBackground,
  },
  filterOptions: {
    padding: 16,
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 12,
  },
  filterChips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  filterChipTextSelected: {
    color: "#fff",
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  applyButton: {
    backgroundColor: colors.primary,
    marginLeft: 6,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  exploreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  exploreCard: {
    width: (width - 48) / 2, // Two columns with 16px padding on each side and 16px gap
    marginBottom: 16,
    marginRight: 0, // Remove horizontal margin for grid
  },
  exploreEmpty: {
    width: "100%",
    paddingVertical: 40,
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
});

export default ExploreScreen;
