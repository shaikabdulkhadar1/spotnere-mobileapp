import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
  Platform,
  StatusBar,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { supabase } from "../config/supabase";
import { colors } from "../constants/colors";
import { fonts } from "../constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window");

const MapScreen = ({ userCountry, onPlacePress, onBack }) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [tracksViewChanges, setTracksViewChanges] = useState(
    Platform.OS === "android",
  );
  const mapRef = useRef(null);

  useEffect(() => {
    requestLocationPermission();
    fetchPlaces();
  }, [userCountry]);

  useEffect(() => {
    // Disable tracksViewChanges after initial render for better performance
    if (Platform.OS === "android" && places.length > 0 && tracksViewChanges) {
      const timer = setTimeout(() => {
        setTracksViewChanges(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [places.length, tracksViewChanges]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (err) {
      console.warn("Location permission error:", err);
    }
  };

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error("Supabase client is not initialized");
      }

      let query = supabase.from("places").select("*");

      if (userCountry) {
        query = query.eq("country", userCountry);
      }

      const { data: allPlaces, error: fetchError } = await query;

      if (fetchError) {
        console.error("❌ Error fetching places:", fetchError);
        throw new Error(`Failed to fetch places: ${fetchError.message}`);
      }

      if (!allPlaces || allPlaces.length === 0) {
        setPlaces([]);
        setLoading(false);
        return;
      }

      // Format places data
      const formatted = allPlaces
        .filter((place) => {
          // Only include places with valid coordinates
          return (
            place.latitude &&
            place.longitude &&
            !isNaN(parseFloat(place.latitude)) &&
            !isNaN(parseFloat(place.longitude))
          );
        })
        .map((place) => ({
          id: place.id,
          title: place.title || place.name || place.place_name || "Place",
          price: `$${place.avg_price || 0} per person`,
          priceValue:
            place.avg_price || place.price_per_night || place.price || 0,
          rating: parseFloat(place.rating || place.average_rating || 0) || 0,
          ratingString:
            place.rating?.toString() || place.average_rating?.toString() || "0",
          imageUri: place.banner_image_link || place.image || place.photo_url,
          latitude: parseFloat(place.latitude),
          longitude: parseFloat(place.longitude),
          city: place.city || place.location || "",
          country: place.country || "",
          description: place.description || "",
          isSmall: false,
        }));

      setPlaces(formatted);
      // Reset tracksViewChanges when places update on Android
      if (Platform.OS === "android") {
        setTracksViewChanges(true);
      }
    } catch (err) {
      console.error("Error fetching places:", err);
      setError(err.message || "Failed to load places");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelect = (place) => {
    setSelectedPlaceId(place.id);
    setSelectedPlace(place);
    // Re-enable tracksViewChanges briefly when selecting to ensure update
    if (Platform.OS === "android" && !tracksViewChanges) {
      setTracksViewChanges(true);
      setTimeout(() => setTracksViewChanges(false), 500);
    }
    if (mapRef.current && place.latitude && place.longitude) {
      mapRef.current.animateToRegion(
        {
          latitude: place.latitude,
          longitude: place.longitude,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        },
        500,
      );
    }
  };

  const handleCloseModal = () => {
    setSelectedPlace(null);
    setSelectedPlaceId(null);
  };

  const handleViewDetails = () => {
    if (selectedPlace && onPlacePress) {
      onPlacePress(selectedPlace.id);
    }
    handleCloseModal();
  };

  const getInitialRegion = () => {
    if (places.length > 0) {
      const firstPlace = places[0];
      return {
        latitude: firstPlace.latitude,
        longitude: firstPlace.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };
    }
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };
    }
    // Default to a central location (you can change this)
    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.5,
      longitudeDelta: 0.5,
    };
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find places Nearby</Text>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Ionicons name="home" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Map Area - Full remaining space */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.mapLoadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <MapView
            provider={PROVIDER_GOOGLE}
            ref={mapRef}
            style={styles.map}
            initialRegion={getInitialRegion()}
            showsUserLocation={!!userLocation}
            showsMyLocationButton={true}
          >
            {places.map((place) => {
              const isSelected = selectedPlaceId === place.id;
              const priceText = `$${Math.round(place.priceValue)}`;
              return (
                <Marker
                  key={`marker-${place.id}`}
                  coordinate={{
                    latitude: place.latitude,
                    longitude: place.longitude,
                  }}
                  onPress={() => handlePlaceSelect(place)}
                  anchor={{ x: 0.5, y: 1 }}
                  tracksViewChanges={tracksViewChanges}
                >
                  <View
                    style={[
                      styles.pricePill,
                      isSelected && styles.pricePillSelected,
                    ]}
                    collapsable={false}
                    pointerEvents="none"
                  >
                    <Text
                      style={[
                        styles.pricePillText,
                        isSelected && styles.pricePillTextSelected,
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                      minimumFontScale={0.8}
                    >
                      {priceText}
                    </Text>
                  </View>
                </Marker>
              );
            })}
          </MapView>
        )}
      </View>

      {/* Place Details Modal */}
      <Modal
        visible={!!selectedPlace}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCloseModal}
          />
          <View style={styles.modalContainer}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>

            {/* Place Details */}
            {selectedPlace && (
              <ScrollView
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.placeTitle}>{selectedPlace.title}</Text>

                {/* Rating and Price */}
                <View style={styles.placeMeta}>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color={colors.accent} />
                    <Text style={[styles.ratingText, { marginLeft: 4 }]}>
                      {selectedPlace.ratingString}
                    </Text>
                  </View>
                  <Text style={styles.priceText}>{selectedPlace.price}</Text>
                </View>

                {/* Location */}
                {(selectedPlace.city || selectedPlace.country) && (
                  <View style={styles.locationContainer}>
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.locationText, { marginLeft: 6 }]}>
                      {[selectedPlace.city, selectedPlace.country]
                        .filter(Boolean)
                        .join(", ")}
                    </Text>
                  </View>
                )}

                {/* Description */}
                {selectedPlace.description && (
                  <Text style={styles.description} numberOfLines={3}>
                    {selectedPlace.description}
                  </Text>
                )}

                {/* View Details Button */}
                <TouchableOpacity
                  style={styles.viewDetailsButton}
                  onPress={handleViewDetails}
                  activeOpacity={0.8}
                >
                  <Text style={styles.viewDetailsButtonText}>View Details</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop:
      Platform.OS === "ios" ? 80 : (StatusBar.currentHeight || 0) + 50,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 4,
    zIndex: 1,
  },
  homeButton: {
    padding: 4,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: fonts.bold,
    color: colors.text,
    flex: 1,
    textAlign: "center",
  },
  mapContainer: {
    flex: 1,
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  map: {
    flex: 1,
    borderRadius: 30,
  },
  mapLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.error,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    height: height * 0.3,
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 10,
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
  placeTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 12,
    paddingRight: 40,
  },
  placeMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  priceText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  viewDetailsButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  viewDetailsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: fonts.bold,
  },
  pricePill: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#000",
    minHeight: 28,
  },
  pricePillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pricePillText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: fonts.bold,
    color: "#000",
  },
  pricePillTextSelected: {
    color: "#fff",
  },
});

export default MapScreen;
