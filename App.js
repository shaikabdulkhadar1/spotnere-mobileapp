import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "./config/supabase";
import ExploreScreen from "./components/ExploreScreen";
import HomeScreen from "./components/HomeScreen";
import BottomNavBar from "./components/BottomNavBar";
import PlaceDetailScreen from "./components/PlaceDetailScreen";
import ProfileScreen from "./components/ProfileScreen";
import { colors } from "./constants/colors";

const { width, height } = Dimensions.get("window");

export default function App() {
  const username = "User"; // Replace with actual username
  const [city, setCity] = useState("Your City"); // Will be updated from location
  const [activeTab, setActiveTab] = useState("home");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);

  const [places50km, setPlaces50km] = useState([]);
  const [placesCity, setPlacesCity] = useState([]);
  const [placesCountry, setPlacesCountry] = useState([]);
  const [placesState, setPlacesState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userCountry, setUserCountry] = useState(null);
  const [userState, setUserState] = useState(null);

  useEffect(() => {
    getLocationAndFetchPlaces();
  }, []);

  const getLocationAndFetchPlaces = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission",
          "Location permission is required to show nearby places. Please enable it in settings.",
          [{ text: "OK" }]
        );
        setError("Location permission denied");
        setLoading(false);
        return;
      }

      // Get device location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Reverse geocode to get country
      let geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode && geocode.length > 0) {
        const country = geocode[0].country;
        const cityName = geocode[0].city || geocode[0].subAdministrativeArea;
        const stateName =
          geocode[0].region ||
          geocode[0].administrativeArea ||
          geocode[0].subAdministrativeArea;
        const address = geocode[0];

        // Print extracted location info
        console.log("📍 Extracted Location Information:");
        console.log("Country:", country);
        console.log("State:", stateName);
        console.log("City:", cityName);
        console.log("Full address:", {
          street: address.street,
          city: address.city,
          region: address.region,
          administrativeArea: address.administrativeArea,
          postalCode: address.postalCode,
          country: address.country,
          subAdministrativeArea: address.subAdministrativeArea,
          subLocality: address.subLocality,
        });

        setUserCountry(country);
        setUserState(stateName);
        if (cityName) {
          setCity(cityName);
        }

        // Fetch places with country filter and location
        await fetchPlaces(country, latitude, longitude, cityName, stateName);
      } else {
        throw new Error("Could not determine location");
      }
    } catch (err) {
      console.error("Error getting location:", err);
      setError(err.message || "Failed to get location");
      setLoading(false);
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  // Returns distance in kilometers
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchPlaces = async (
    country,
    userLat,
    userLon,
    cityName,
    stateName
  ) => {
    try {
      if (!country) {
        throw new Error("Country is required to fetch places");
      }

      console.log("🔍 Fetching places for country:", country);
      if (userLat && userLon) {
        console.log("📍 User location for distance calculation:", {
          latitude: userLat,
          longitude: userLon,
        });
      }

      // Fetch all places in the country first
      // Adjust the table name and column names based on your database schema
      const { data: allPlaces, error: fetchError } = await supabase
        .from("places") // Replace 'places' with your table name
        .select("*")
        .eq("country", country); // Filter by country - adjust column name if different

      if (fetchError) {
        console.error("❌ Error fetching places:", fetchError);
        throw fetchError;
      }

      console.log(
        `📊 Total places found in ${country}:`,
        allPlaces?.length || 0
      );

      if (!allPlaces || allPlaces.length === 0) {
        console.warn("⚠️ No places found in the country");
        setPlaces50km([]);
        setPlacesCity([]);
        setPlacesCountry([]);
        setPlacesState([]);
        setLoading(false);
        return;
      }

      // Filter places within 50km of user location
      // Assumes places table has 'latitude' and 'longitude' columns
      // Adjust column names if different (e.g., 'lat', 'lng', 'location_lat', etc.)
      let places50km = [];
      if (userLat && userLon) {
        places50km = allPlaces
          .filter((place) => {
            const placeLat =
              place.latitude ||
              place.lat ||
              place.location_latitude ||
              place.place_latitude;
            const placeLon =
              place.longitude ||
              place.lng ||
              place.location_longitude ||
              place.place_longitude;

            if (!placeLat || !placeLon) {
              console.warn("⚠️ Place missing coordinates:", place.id);
              return false;
            }

            const distance = calculateDistance(
              userLat,
              userLon,
              placeLat,
              placeLon
            );
            return distance <= 50; // Within 50km
          })
          .sort((a, b) => {
            // Sort by distance (closest first)
            const distA = calculateDistance(
              userLat,
              userLon,
              a.latitude || a.lat || a.location_latitude || a.place_latitude,
              a.longitude || a.lng || a.location_longitude || a.place_longitude
            );
            const distB = calculateDistance(
              userLat,
              userLon,
              b.latitude || b.lat || b.location_latitude || b.place_latitude,
              b.longitude || b.lng || b.location_longitude || b.place_longitude
            );
            return distA - distB;
          })
          .slice(0, 10); // Limit to 10 places
      } else {
        // If no user location, just take first 10 places
        places50km = allPlaces.slice(0, 10);
        console.warn("⚠️ No user location provided, showing first 10 places");
      }

      // Filter places in the same city
      let placesCity = [];
      if (cityName) {
        placesCity = allPlaces
          .filter((place) => {
            const placeCity =
              place.city ||
              place.city_name ||
              place.location_city ||
              place.place_city;
            return (
              placeCity &&
              placeCity.toLowerCase().includes(cityName.toLowerCase())
            );
          })
          .slice(0, 10);
      } else {
        // If no city name, just take first 10 places
        placesCity = allPlaces.slice(0, 10);
        console.warn("⚠️ No city name, showing first 10 places");
      }

      // If we still don't have city places, use all places
      if (placesCity.length === 0) {
        placesCity = allPlaces.slice(0, 10);
      }

      // Filter places in the same country (top places in country)
      let placesCountry = [...allPlaces]
        .sort((a, b) => {
          // Sort by rating (highest first)
          const ratingA = parseFloat(a.rating || a.average_rating || 0) || 0;
          const ratingB = parseFloat(b.rating || b.average_rating || 0) || 0;
          return ratingB - ratingA;
        })
        .slice(0, 10);

      // Filter places in the same state
      let placesState = [];
      if (stateName) {
        placesState = allPlaces
          .filter((place) => {
            const placeState =
              place.state ||
              place.state_name ||
              place.region ||
              place.location_state ||
              place.place_state;
            return (
              placeState &&
              placeState.toLowerCase().includes(stateName.toLowerCase())
            );
          })
          .sort((a, b) => {
            // Sort by rating (highest first)
            const ratingA = parseFloat(a.rating || a.average_rating || 0) || 0;
            const ratingB = parseFloat(b.rating || b.average_rating || 0) || 0;
            return ratingB - ratingA;
          })
          .slice(0, 10);
      } else {
        // If no state name, just take top rated places
        placesState = [...allPlaces]
          .sort((a, b) => {
            const ratingA = parseFloat(a.rating || a.average_rating || 0) || 0;
            const ratingB = parseFloat(b.rating || b.average_rating || 0) || 0;
            return ratingB - ratingA;
          })
          .slice(0, 10);
        console.warn("⚠️ No state name, showing top rated places");
      }

      // If we still don't have state places, use all places
      if (placesState.length === 0) {
        placesState = allPlaces.slice(0, 10);
      }

      // Format the data to match PlaceCard props
      // Adjust these mappings based on your database schema
      const formatted50km = (places50km || []).map((place, index) => ({
        id: place.id,
        title: place.title || place.name || place.place_name || "Place",
        price: `$${place.avg_price || 0} per person`,
        rating:
          place.rating?.toString() || place.average_rating?.toString() || "0",
        imageUri: place.banner_image_link || place.image || place.photo_url,
        showBadge: index === 0, // Show badge on first card
        isSmall: false, // All cards same size
      }));

      const formattedCity = (placesCity || []).map((place, index) => ({
        id: place.id,
        title: place.title || place.name || place.place_name || "Place",
        price: `$${place.avg_price || 0} per person`,
        rating:
          place.rating?.toString() || place.average_rating?.toString() || "0",
        imageUri: place.banner_image_link || place.image || place.photo_url,
        showBadge: index === 0, // Show badge on first card
        isSmall: false, // All cards same size
      }));

      const formattedCountry = (placesCountry || []).map((place, index) => ({
        id: place.id,
        title: place.title || place.name || place.place_name || "Place",
        price: `$${place.avg_price || 0} per person`,
        rating:
          place.rating?.toString() || place.average_rating?.toString() || "0",
        imageUri: place.banner_image_link || place.image || place.photo_url,
        showBadge: index === 0, // Show badge on first card
        isSmall: false, // All cards same size
      }));

      const formattedState = (placesState || []).map((place, index) => ({
        id: place.id,
        title: place.title || place.name || place.place_name || "Place",
        price: `$${place.avg_price || 0} per person`,
        rating:
          place.rating?.toString() || place.average_rating?.toString() || "0",
        imageUri: place.banner_image_link || place.image || place.photo_url,
        showBadge: index === 0, // Show badge on first card
        isSmall: false, // All cards same size
      }));

      setPlaces50km(formatted50km);
      setPlacesCity(formattedCity);
      setPlacesCountry(formattedCountry);
      setPlacesState(formattedState);
    } catch (err) {
      console.error("Error fetching places:", err);
      setError(err.message || "Failed to fetch places");
    } finally {
      setLoading(false);
    }
  };

  // Don't show loading screen - let HomeScreen show skeleton loaders
  // if (loading) {
  //   return (
  //     <View style={[styles.container, styles.loadingContainer]}>
  //       <ActivityIndicator size="large" color="#007AFF" />
  //       <Text style={styles.loadingText}>Getting your location...</Text>
  //     </View>
  //   );
  // }

  if (error) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={getLocationAndFetchPlaces}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top Bar Section - Avatar Only (Sticky) - Hidden on PlaceDetailScreen */}
      {!selectedPlaceId && (
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.userIcon}
            onPress={() => setShowUserMenu(!showUserMenu)}
          >
            <View style={styles.avatarGradient}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <>
              <TouchableWithoutFeedback onPress={() => setShowUserMenu(false)}>
                <View style={styles.menuOverlay} />
              </TouchableWithoutFeedback>
              <View style={styles.userMenu}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowUserMenu(false);
                    // Add logout logic here
                    Alert.alert("Logout", "Are you sure you want to logout?", [
                      { text: "Cancel", style: "cancel" },
                      { text: "Logout", onPress: () => console.log("Logout") },
                    ]);
                  }}
                >
                  <Text style={styles.menuItemText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}

      {selectedPlaceId ? (
        <PlaceDetailScreen
          placeId={selectedPlaceId}
          onClose={() => setSelectedPlaceId(null)}
        />
      ) : (
        <>
          {activeTab === "explore" ? (
            <ExploreScreen
              userCountry={userCountry}
              onPlacePress={setSelectedPlaceId}
            />
          ) : activeTab === "profile" ? (
            <ProfileScreen />
          ) : (
            <HomeScreen
              places50km={loading ? [] : places50km}
              placesCity={loading ? [] : placesCity}
              placesState={loading ? [] : placesState}
              placesCountry={loading ? [] : placesCountry}
              city={city}
              userState={userState}
              userCountry={userCountry}
              onPlacePress={setSelectedPlaceId}
            />
          )}
          <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    backgroundColor: "transparent",
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  userIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  userMenu: {
    position: "absolute",
    top: Platform.OS === "ios" ? 66 : 46,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
    zIndex: 1000,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 16,
    textAlign: "center",
    paddingHorizontal: 20,
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
    fontWeight: "600",
  },
});
