import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import { supabase } from "../config/supabase";
import PlaceCard from "../components/PlaceCard";
import SkeletonCard from "../components/SkeletonCard";
import { colors } from "../constants/colors";
import { fonts } from "../constants/fonts";
import { getTrips } from "../utils/trips";

const { width, height } = Dimensions.get("window");

const TripsScreen = ({ userCountry, onPlacePress }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrips();
  }, [userCountry]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get trip place IDs from local storage
      const tripIds = await getTrips();

      if (!tripIds || tripIds.length === 0) {
        console.log("✈️ No trips found");
        setTrips([]);
        setLoading(false);
        return;
      }

      // Check if supabase is available
      if (!supabase) {
        throw new Error("Supabase client is not initialized");
      }

      // Fetch trip places from database
      let query = supabase.from("places").select("*").in("id", tripIds);

      // Optionally filter by country
      if (userCountry) {
        query = query.eq("country", userCountry);
      }

      const { data: places, error: fetchError } = await query;

      if (fetchError) {
        console.error("❌ Error fetching trips:", fetchError);
        throw new Error(`Failed to fetch trips: ${fetchError.message}`);
      }

      console.log(`✈️ Found ${places?.length || 0} trips`);

      if (!places || places.length === 0) {
        setTrips([]);
        setLoading(false);
        return;
      }

      // Format places data
      const formatted = places.map((place) => ({
        id: place.id,
        title: place.title || place.name || place.place_name || "Place",
        price: `$${place.avg_price || 0} per person`,
        rating: parseFloat(place.rating || place.average_rating || 0) || 0,
        ratingString:
          place.rating?.toString() || place.average_rating?.toString() || "0",
        imageUri: place.banner_image_link || place.image || place.photo_url,
        isSmall: false,
      }));

      setTrips(formatted);
    } catch (err) {
      console.error("Error fetching trips:", err);
      setError(err.message || "Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.allPlacesContainer}>
          <View style={styles.gridContainer}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={`skeleton-${index}`} style={styles.gridCard}>
                <SkeletonCard />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={fetchTrips} style={styles.retryButton}>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={
        trips.length === 0 ? styles.scrollContentCentered : styles.scrollContent
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.allPlacesContainer}>
        {trips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Image
                source={require("../assets/categoryImages/tripImg.png")}
                style={styles.emptyIconImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptyText}>
              Start planning your next adventure and your trips will appear here
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Trips</Text>
              <Text style={styles.placeCount}>
                {trips.length} {trips.length === 1 ? "trip" : "trips"}
              </Text>
            </View>
            <View style={styles.gridContainer}>
              {trips.map((trip, index) => (
                <View key={trip.id || index} style={styles.gridCard}>
                  <PlaceCard
                    title={trip.title}
                    price={trip.price}
                    rating={trip.ratingString}
                    imageUri={trip.imageUri}
                    showBadge={false}
                    isSmall={false}
                    placeId={trip.id}
                    onPress={onPlacePress}
                  />
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 70, // Extra padding to ensure content is visible above bottom nav
  },
  scrollContentCentered: {
    flexGrow: 1,
    justifyContent: "center",
    minHeight: height - 200, // Account for top bar and bottom nav
  },
  allPlacesContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    fontFamily: fonts.regular,
  },
  placeCount: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "400",
    fontFamily: fonts.regular,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
  },
  gridCard: {
    width: (width - 48) / 2, // Two columns: (screen width - 32px padding - 16px gap) / 2
    marginBottom: 16,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconImage: {
    width: 74,
    height: 74,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
    textAlign: "center",
    fontFamily: fonts.regular,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    fontFamily: fonts.regular,
  },
  errorText: {
    fontSize: 16,
    color: colors.error || "#FF3B30",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: fonts.regular,
  },
  retryButton: {
    padding: 12,
  },
  retryText: {
    fontSize: 14,
    color: colors.primary,
    textDecorationLine: "underline",
    fontFamily: fonts.regular,
  },
});

export default TripsScreen;
