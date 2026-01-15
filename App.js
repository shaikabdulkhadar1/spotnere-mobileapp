import React from "react";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
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
  StatusBar,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useFonts } from "expo-font";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "./config/supabase";
import HomeScreen from "./components/HomeScreen";
import FavoriteScreen from "./components/FavoriteScreen";
import TripsScreen from "./components/TripsScreen";
import ReelsScreen from "./components/ReelsScreen";
import BottomNavBar from "./components/BottomNavBar";
import PlaceDetailScreen from "./components/PlaceDetailScreen";
import ProfileScreen from "./components/ProfileScreen";
import { colors } from "./constants/colors";
import { fonts } from "./constants/fonts";
import { getCachedPlaces, setCachedPlaces } from "./utils/placesCache";

// Error Boundary Styles (defined before ErrorBoundary component)
const errorBoundaryStyles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 16,
    textAlign: "center",
    paddingHorizontal: 20,
    fontFamily: fonts.regular,
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
    fontFamily: fonts.regular,
  },
});

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorBoundaryStyles.errorContainer}>
          <Text style={errorBoundaryStyles.errorText}>
            Something went wrong: {this.state.error?.message || "Unknown error"}
          </Text>
          <TouchableOpacity
            style={errorBoundaryStyles.retryButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={errorBoundaryStyles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const { width, height } = Dimensions.get("window");

export default function App() {
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    "Parkinsans-Light": require("./assets/fonts/Parkinsans-Light.ttf"),
    "Parkinsans-Regular": require("./assets/fonts/Parkinsans-Regular.ttf"),
    "Parkinsans-Medium": require("./assets/fonts/Parkinsans-Medium.ttf"),
    "Parkinsans-SemiBold": require("./assets/fonts/Parkinsans-SemiBold.ttf"),
    "Parkinsans-Bold": require("./assets/fonts/Parkinsans-Bold.ttf"),
    "Parkinsans-ExtraBold": require("./assets/fonts/Parkinsans-ExtraBold.ttf"),
  });

  const username = "User"; // Replace with actual username
  const [city, setCity] = useState("Your City"); // Will be updated from location
  const [activeTab, setActiveTab] = useState("home");
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  // Category navigation data
  const categories = [
    {
      id: "All",
      label: "All",
      image: require("./assets/categoryImages/allImg.png"),
      iconSize: 38,
      isActive: true,
    },
    {
      id: "Sports",
      label: "Sports",
      image: require("./assets/categoryImages/sportsImg.png"),
      iconSize: 50,
      isActive: false,
    },
    {
      id: "Adventure",
      label: "Adventure",
      image: require("./assets/categoryImages/adventureImg.png"),
      iconSize: 50,
      isActive: false,
    },
    {
      id: "Parks",
      label: "Parks",
      image: require("./assets/categoryImages/parkImg.png"),
      iconSize: 50,
      isActive: false,
    },
    {
      id: "Staycation",
      label: "Staycation",
      image: require("./assets/categoryImages/staycationImg.png"),
      iconSize: 50,
      isActive: false,
    },
    {
      id: "Tickets",
      label: "Tickets",
      image: require("./assets/categoryImages/ticketImg.png"),
      iconSize: 50,
      isActive: false,
    },
    {
      id: "Exclusive",
      label: "Exclusive",
      image: require("./assets/categoryImages/exclusiveImg.png"),
      iconSize: 50,
      isActive: false,
    },
  ];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userCountry, setUserCountry] = useState(null);

  // Track if initial fetch has been completed
  const hasInitialFetchCompleted = useRef(false);

  useEffect(() => {
    // Only fetch once on initial app load
    if (hasInitialFetchCompleted.current) {
      console.log("📦 App already initialized, skipping fetch");
      return;
    }

    // Delay initialization slightly to ensure app is mounted
    const initTimer = setTimeout(() => {
      // Get location to determine country for filtering
      getLocationAndSetCountry().catch((err) => {
        console.error("Error getting location:", err);
        setError(err.message || "Failed to get location");
        setLoading(false);
      });
    }, 100);

    return () => clearTimeout(initTimer);
  }, []);

  // Function to get location and set country for filtering
  const getLocationAndSetCountry = async () => {
    // Prevent multiple fetches - only fetch once on initial load
    if (hasInitialFetchCompleted.current) {
      console.log("📦 Initial fetch already completed, will not fetch again");
      return;
    }

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

      // Get device location with timeout
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000, // 10 second timeout
      });

      if (!location || !location.coords) {
        throw new Error("Could not get location coordinates");
      }

      const { latitude, longitude } = location.coords;

      if (!latitude || !longitude) {
        throw new Error("Invalid location coordinates");
      }

      // Reverse geocode to get country
      let geocode;
      try {
        geocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
      } catch (geocodeError) {
        console.warn("Reverse geocoding failed:", geocodeError);
        setLoading(false);
        return;
      }

      if (geocode && geocode.length > 0) {
        const country = geocode[0].country;
        const cityName = geocode[0].city || geocode[0].subAdministrativeArea;

        console.log("📍 Extracted Location Information:");
        console.log("Country:", country);
        console.log("City:", cityName);

        setUserCountry(country);
        if (cityName) {
          setCity(cityName);
        }
      } else {
        throw new Error("Could not determine location");
      }
    } catch (err) {
      console.error("Error getting location:", err);
      setError(err.message || "Failed to get location");
    } finally {
      setLoading(false);
      hasInitialFetchCompleted.current = true;
    }
  };

  // Show loading indicator while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary || "#007AFF"} />
      </View>
    );
  }

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
          onPress={getLocationAndSetCountry}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <ExpoStatusBar style="light" />

        {/* Top Section - Search Bar and Categories - Hidden on PlaceDetailScreen and shown only on Home tab */}
        {!selectedPlaceId && activeTab === "home" && (
          <View style={styles.topSection}>
            {/* Search Bar */}
            <View style={styles.searchBarWrapper}>
              <View style={styles.searchBarContainer}>
                <Ionicons
                  name="search"
                  size={20}
                  color="#717171"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchBarInput}
                  placeholder="Start typing to search"
                  placeholderTextColor="#717171"
                  editable={false}
                />
              </View>
            </View>

            {/* Category Navigation */}
            <View style={styles.categoryContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScrollContent}
              >
                {categories.map((category) => {
                  const isActive = activeCategory === category.id;
                  return (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryItem,
                        isActive && styles.categoryItemActive,
                      ]}
                      onPress={() => setActiveCategory(category.id)}
                    >
                      <View style={styles.categoryIconContainer}>
                        {category.image ? (
                          <Image
                            source={category.image}
                            style={[
                              styles.categoryImage,
                              {
                                width: category.iconSize,
                                height: category.iconSize,
                              },
                            ]}
                            resizeMode="contain"
                          />
                        ) : (
                          <Ionicons
                            name={category.icon}
                            size={category.iconSize}
                            color="#222"
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.categoryLabel,
                          isActive && styles.categoryLabelActive,
                        ]}
                      >
                        {category.label}
                      </Text>
                      {isActive && <View style={styles.activeIndicator} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}

        {selectedPlaceId ? (
          <PlaceDetailScreen
            placeId={selectedPlaceId}
            onClose={() => setSelectedPlaceId(null)}
          />
        ) : (
          <>
            {activeTab === "favorite" ? (
              <FavoriteScreen
                userCountry={userCountry}
                onPlacePress={setSelectedPlaceId}
              />
            ) : activeTab === "trips" ? (
              <TripsScreen
                userCountry={userCountry}
                onPlacePress={setSelectedPlaceId}
              />
            ) : activeTab === "reels" ? (
              <ReelsScreen
                userCountry={userCountry}
                onPlacePress={setSelectedPlaceId}
              />
            ) : activeTab === "profile" ? (
              <ProfileScreen onLoginSuccess={(userData) => {
                // Handle successful login - user data is stored in auth utility
                console.log("User logged in:", userData);
              }} />
            ) : (
              <HomeScreen
                userCountry={userCountry}
                activeCategory={activeCategory}
                onPlacePress={setSelectedPlaceId}
              />
            )}
            <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
          </>
        )}
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topSection: {
    backgroundColor: colors.topsectionbackground,
    paddingTop:
      Platform.OS === "ios" ? 60 : (StatusBar.currentHeight || 0) + 10,
    paddingHorizontal: 0,
    zIndex: 100,
  },
  searchBarWrapper: {
    paddingTop: 30,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 40, // More rounded, pill-shaped like Airbnb
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 16,
    color: "#222",
  },
  categoryContainer: {
    paddingBottom: 0,
    padding: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.topsectionbackground,
    overflow: "hidden", // Clip any shadows that might appear on top
    // Shadow only at the bottom - iOS
    ...(Platform.OS === "ios" && {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 6, // Only downward shadow
      },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    }),
    // Android: Use borderBottom for shadow effect, no elevation to avoid top shadow
    ...(Platform.OS === "android" && {
      elevation: 0, // Remove elevation to prevent shadows on all sides
    }),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
    borderTopWidth: 0, // Explicitly remove top border
    borderLeftWidth: 0, // Explicitly remove side borders
    borderRightWidth: 0,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    paddingRight: 16,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 32,
    position: "relative",
    paddingBottom: 8, // Add padding to accommodate the indicator
    minHeight: 60, // Ensure enough height
  },
  categoryItemActive: {
    // Active state styling
  },
  categoryIconContainer: {
    marginBottom: 8,
    width: 32,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryImage: {
    width: 32,
    height: 32,
  },
  categoryLabel: {
    fontSize: 12,
    color: "#717171",
    fontFamily: fonts.regular,
  },
  categoryLabelActive: {
    color: "#222",
    fontFamily: fonts.semiBold,
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0, // Position at the bottom of the category item
    left: "45%",
    transform: [{ translateX: -22 }], // Center the indicator (half of width 40)
    width: 50,
    height: 3,
    backgroundColor: "#000",
    borderRadius: 2,
    zIndex: 10, // Ensure it's above other elements
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 16,
    textAlign: "center",
    paddingHorizontal: 20,
    fontFamily: fonts.regular,
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
    fontFamily: fonts.regular,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    fontFamily: fonts.regular,
  },
});
