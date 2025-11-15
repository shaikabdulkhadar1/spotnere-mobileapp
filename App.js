import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "./config/supabase";

const { width, height } = Dimensions.get("window");

// PlaceCard Component
const PlaceCard = ({
  title,
  price,
  rating,
  imageUri,
  showBadge = true,
  isSmall = false,
}) => {
  return (
    <View style={[styles.placeCard, isSmall && styles.placeCardSmall]}>
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
    </View>
  );
};

// Bottom Navigation Bar Component with Liquid Glass Design
const BottomNavBar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "home", label: "Home", icon: "home" },
    { id: "explore", label: "Explore", icon: "compass" },
    { id: "reels", label: "Reels", icon: "play-circle" },
    { id: "profile", label: "Profile", icon: "person" },
  ];

  // Initialize animation values for the active background indicator
  const homeIndicator = useRef(new Animated.Value(1)).current;
  const exploreIndicator = useRef(new Animated.Value(0)).current;
  const reelsIndicator = useRef(new Animated.Value(0)).current;
  const profileIndicator = useRef(new Animated.Value(0)).current;

  const getIndicator = (tabId) => {
    switch (tabId) {
      case "home":
        return homeIndicator;
      case "explore":
        return exploreIndicator;
      case "reels":
        return reelsIndicator;
      case "profile":
        return profileIndicator;
      default:
        return homeIndicator;
    }
  };

  useEffect(() => {
    tabs.forEach((tab) => {
      const isActive = activeTab === tab.id;
      const indicator = getIndicator(tab.id);

      Animated.spring(indicator, {
        toValue: isActive ? 1 : 0,
        useNativeDriver: false, // Can't use native driver for layout props like width/height
        tension: 120,
        friction: 8,
      }).start();
    });
  }, [activeTab]);

  return (
    <View style={styles.navBarContainer}>
      <View style={styles.navBar}>
        <BlurView intensity={100} tint="light" style={styles.blurView}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const indicator = getIndicator(tab.id);

            // Interpolate the dimensions of the active background (rounded rectangle)
            const backgroundWidth = indicator.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 85], // Width of the rounded background
            });

            const backgroundHeight = indicator.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 55], // Height of the rounded background
            });

            // Center the background by translating by negative half of width/height
            const backgroundTranslateX = indicator.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -42.5], // Negative half of max width (85/2)
            });

            const backgroundTranslateY = indicator.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -27.5], // Negative half of max height (55/2)
            });

            const backgroundOpacity = indicator.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            });

            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.navItem}
                onPress={() => onTabChange(tab.id)}
                activeOpacity={0.7}
              >
                <View style={styles.navItemWrapper}>
                  <Animated.View
                    style={[
                      styles.activeTabBackground,
                      {
                        opacity: backgroundOpacity,
                        width: backgroundWidth,
                        height: backgroundHeight,
                        transform: [
                          { translateX: backgroundTranslateX },
                          { translateY: backgroundTranslateY },
                        ],
                      },
                    ]}
                  />
                  <View style={styles.navItemContent}>
                    <Ionicons
                      name={tab.icon}
                      size={22}
                      color={isActive ? "#000" : "#fff"}
                      style={styles.navIcon}
                    />
                    <Text
                      style={[
                        styles.navLabel,
                        { color: isActive ? "#000" : "#fff" },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
};

export default function App() {
  const username = "User"; // Replace with actual username
  const [city, setCity] = useState("Your City"); // Will be updated from location
  const [activeTab, setActiveTab] = useState("home");
  const [showUserMenu, setShowUserMenu] = useState(false);

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

      // Print location coordinates
      console.log("📍 Location Coordinates:");
      console.log("Latitude:", latitude);
      console.log("Longitude:", longitude);
      console.log("Full location object:", location);

      // Reverse geocode to get country
      let geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      // Print geocode results
      console.log("🌍 Geocode Results:");
      console.log("Full geocode data:", geocode);

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

        console.log(`📍 Places within 50km:`, places50km.length);
        places50km.forEach((place, index) => {
          const distance = calculateDistance(
            userLat,
            userLon,
            place.latitude ||
              place.lat ||
              place.location_latitude ||
              place.place_latitude,
            place.longitude ||
              place.lng ||
              place.location_longitude ||
              place.place_longitude
          );
          console.log(
            `  ${index + 1}. ${place.title || place.name} - ${distance.toFixed(
              2
            )}km away`
          );
        });
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
        console.log(`🏙️ Places in ${cityName}:`, placesCity.length);
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
      console.log(`🌍 Top places in ${country}:`, placesCountry.length);

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
        console.log(`🗺️ Top places in ${stateName}:`, placesState.length);
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
        price: place.price || `$${place.price_per_night || 0} for 2 nights`,
        rating:
          place.rating?.toString() || place.average_rating?.toString() || "0",
        imageUri: place.banner_image_link || place.image || place.photo_url,
        showBadge: index === 0, // Show badge on first card
        isSmall: false, // All cards same size
      }));

      const formattedCity = (placesCity || []).map((place, index) => ({
        id: place.id,
        title: place.title || place.name || place.place_name || "Place",
        price: place.price || `$${place.price_per_night || 0} for 2 nights`,
        rating:
          place.rating?.toString() || place.average_rating?.toString() || "0",
        imageUri: place.banner_image_link || place.image || place.photo_url,
        showBadge: index === 0, // Show badge on first card
        isSmall: false, // All cards same size
      }));

      const formattedCountry = (placesCountry || []).map((place, index) => ({
        id: place.id,
        title: place.title || place.name || place.place_name || "Place",
        price: place.price || `$${place.price_per_night || 0} for 2 nights`,
        rating:
          place.rating?.toString() || place.average_rating?.toString() || "0",
        imageUri: place.banner_image_link || place.image || place.photo_url,
        showBadge: index === 0, // Show badge on first card
        isSmall: false, // All cards same size
      }));

      const formattedState = (placesState || []).map((place, index) => ({
        id: place.id,
        title: place.title || place.name || place.place_name || "Place",
        price: place.price || `$${place.price_per_night || 0} for 2 nights`,
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

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

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

      {/* Top Bar Section - Avatar Only (Sticky) */}
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Content Section - 20% of screen height (Scrollable) */}
        <View style={styles.headerContentSection}>
          <Text style={styles.headerGreeting}>
            Hello user, what's on your mind today?
          </Text>
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
            {places50km.length > 0 ? (
              places50km.map((place, index) => (
                <PlaceCard
                  key={place.id || index}
                  title={place.title}
                  price={place.price}
                  rating={place.rating}
                  imageUri={place.imageUri}
                  showBadge={place.showBadge}
                  isSmall={place.isSmall}
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
            {placesCity.length > 0 ? (
              placesCity.map((place, index) => (
                <PlaceCard
                  key={place.id || index}
                  title={place.title}
                  price={place.price}
                  rating={place.rating}
                  imageUri={place.imageUri}
                  showBadge={place.showBadge}
                  isSmall={place.isSmall}
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
            {placesState.length > 0 ? (
              placesState.map((place, index) => (
                <PlaceCard
                  key={place.id || index}
                  title={place.title}
                  price={place.price}
                  rating={place.rating}
                  imageUri={place.imageUri}
                  showBadge={place.showBadge}
                  isSmall={place.isSmall}
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
            {placesCountry.length > 0 ? (
              placesCountry.map((place, index) => (
                <PlaceCard
                  key={place.id || index}
                  title={place.title}
                  price={place.price}
                  rating={place.rating}
                  imageUri={place.imageUri}
                  showBadge={place.showBadge}
                  isSmall={place.isSmall}
                />
              ))
            ) : (
              <Text style={styles.noDataText}>No places found</Text>
            )}
          </ScrollView>
        </View>
      </ScrollView>
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C8C8D8",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#C8C8D8",
  },

  scrollContent: {
    paddingBottom: 100, // Account for bottom navbar
    paddingTop: 0, // No padding between avatar and hello user section
  },
  topBar: {
    backgroundColor: "#1A1A2E",
    paddingTop: Platform.OS === "ios" ? 70 : 50, // Increased padding at top
    paddingBottom: 10, // No padding between avatar and hello user section
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerContentSection: {
    backgroundColor: "#1A1A2E",
    height: height * 0.2, // 20% of screen height
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: "center",
    marginTop: Platform.OS === "ios" ? 20 : 94, // Top bar height (70+44 on iOS, 50+44 on Android) - no gap
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerGreeting: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.3,
    lineHeight: 32,
  },
  userIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4A90E2",
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
    backgroundColor: "#4A90E2",
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
    color: "#333",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
    color: "#666",
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: "#333",
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
    color: "#333",
  },
  seeMoreText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  horizontalScroll: {
    marginHorizontal: 16,
  },
  horizontalScrollContent: {
    paddingRight: 16,
  },
  placeCard: {
    width: (width - 64) * 0.5, // Two large cards with spacing
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
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
    backgroundColor: "#e0e0e0",
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
    backgroundColor: "#fff",
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
    color: "#333",
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
    color: "#9C27B0", // Purple color
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
    color: "#333",
    marginBottom: 4,
  },
  cardTitleSmall: {
    fontSize: 13,
    marginBottom: 3,
  },
  cardPrice: {
    fontSize: 14,
    color: "#666",
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
    color: "#FFA500",
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  ratingTextSmall: {
    fontSize: 12,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    marginBottom: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  noDataText: {
    fontSize: 14,
    color: "#999",
    padding: 20,
    textAlign: "center",
  },
  navBarContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 20 : 10,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  navBar: {
    width: width - 32,
    height: 70,
    borderRadius: 35, // Half of height for fully rounded pill shape
    overflow: "hidden", // Required for borderRadius to work
    backgroundColor: "#1A1A2E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  blurView: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 35,
    overflow: "hidden",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
    position: "relative",
  },
  navItemWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: "100%",
    height: "100%",
  },
  activeTabBackground: {
    position: "absolute",
    top: "50%",
    left: "50%",
    backgroundColor: "rgba(240, 240, 240, 0.95)",
    borderRadius: 28,
    zIndex: 0,
  },
  navItemContent: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    position: "relative",
    width: "100%",
    height: "100%",
  },
  navIcon: {
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
});
