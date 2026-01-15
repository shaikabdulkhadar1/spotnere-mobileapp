/**
 * Expo App Configuration
 * This file allows us to use environment variables from .env file
 */

export default {
  expo: {
    name: "spotnere-mobileapp",
    slug: "spotnere-mobileapp",
    version: "1.0.0",
    sdkVersion: "54.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "This app needs access to your location to show nearby places.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "This app needs access to your location to show nearby places.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_KEY,
      countryStateCityApi: process.env.COUNTRY_STATE_CITY_API,
    },
  },
};
