# Spotnere – Discover & Book

A React Native mobile application built with Expo that helps users discover and book amazing places around the world. Spotnere provides a seamless experience for exploring top-rated destinations, saving favorites, planning trips, and discovering places through video reels.

## 📱 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Color Scheme](#color-scheme)
- [Typography](#typography)
- [Screens](#screens)
- [Routing & Navigation](#routing--navigation)
- [Components](#components)
- [Utilities](#utilities)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Building & Deployment](#building--deployment)
- [Development Guidelines](#development-guidelines)

---

## 🎯 Overview

Spotnere is a location-based discovery platform that enables users to:
- **Discover** top-rated places filtered by location, category, and preferences
- **Save** favorite places for quick access
- **Plan** trips by organizing places they want to visit
- **Explore** places through immersive video reels
- **View** places on an interactive map
- **Manage** their profile and account settings

The app uses device location to show relevant places based on the user's country, ensuring a personalized experience.

---

## ✨ Features

### Core Features
- **Location-Based Discovery**: Automatically detects user location and filters places by country
- **Advanced Filtering**: Filter by category, sub-category, rating, and sort by distance, price, or rating
- **Favorites Management**: Save and manage favorite places with database persistence
- **Trip Planning**: Organize places into trips for future visits
- **Video Reels**: Discover places through engaging video content
- **Interactive Map**: View places on a map interface
- **User Authentication**: Secure registration and login with password hashing
- **Profile Management**: Update profile information and manage account settings
- **Caching**: Efficient data caching for improved performance

### User Experience Features
- **Skeleton Loading**: Smooth loading states with skeleton placeholders
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Responsive Design**: Optimized for various screen sizes
- **Smooth Animations**: Native animations for better UX
- **Offline Support**: Local caching for offline access to favorites and trips

---

## 🏗️ Architecture

### Application Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      App.js                             │
│  (Main Entry Point - State Management & Routing)        │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐   ┌────────▼────────┐
│   Screens      │   │   Components    │
│                │   │                 │
│ - HomeScreen   │   │ - PlaceCard     │
│ - FavoriteScreen│  │ - BottomNavBar │
│ - MapScreen    │   │ - LoginForm     │
│ - TripsScreen  │   │ - BookingModal  │
│ - ReelsScreen  │   │ - SkeletonCard  │
│ - ProfileScreen│   └─────────────────┘
│ - PlaceDetail  │
└───────┬────────┘
        │
┌───────▼────────┐
│    Utils       │
│                │
│ - auth.js      │
│ - favorites.js │
│ - trips.js     │
│ - reels.js     │
│ - placesCache  │
│ - favoritesCache│
└───────┬────────┘
        │
┌───────▼────────┐
│   Supabase     │
│   Database     │
└────────────────┘
```

### State Management
- **Local State**: React hooks (`useState`, `useEffect`) for component-level state
- **AsyncStorage**: Persistent local storage for user authentication and preferences
- **Supabase**: Backend database for user data, places, favorites, and reviews
- **In-Memory Cache**: Optimized caching layer for places and favorites data

### Data Flow
1. **App Initialization**: App.js loads fonts and requests location permissions
2. **Location Detection**: Device location is used to determine user country
3. **Data Fetching**: Places are fetched from Supabase filtered by country
4. **Caching**: Data is cached locally for performance
5. **User Interaction**: User actions trigger state updates and database operations
6. **UI Updates**: React re-renders components based on state changes

---

## 🛠️ Technology Stack

### Core Framework
- **React Native**: 0.81.5
- **React**: 19.1.0
- **Expo SDK**: ~54.0.32

### Key Libraries
- **@supabase/supabase-js**: Backend database and authentication
- **expo-location**: Location services and geocoding
- **expo-font**: Custom font loading
- **expo-image**: Optimized image loading
- **expo-blur**: Blur effects for UI components
- **expo-linear-gradient**: Gradient backgrounds
- **expo-crypto**: Password hashing and security
- **@react-native-async-storage/async-storage**: Local data persistence
- **@expo/vector-icons**: Icon library (Ionicons)
- **country-state-city**: Location data utilities

### Development Tools
- **Babel**: JavaScript transpilation
- **Metro**: React Native bundler
- **EAS Build**: Build and deployment service

---

## 📁 Project Structure

```
spotnere-mobileapp/
├── App.js                      # Main application entry point
├── index.js                    # Expo entry point
├── app.config.js              # Expo configuration
├── package.json               # Dependencies and scripts
├── babel.config.js            # Babel configuration
├── metro.config.js            # Metro bundler configuration
├── eas.json                   # EAS Build configuration
│
├── assets/                    # Static assets
│   ├── fonts/                 # Custom fonts (Parkinsans family)
│   ├── icons/                 # App icons and splash screens
│   └── categoryImages/       # Category icons
│
├── components/                # Reusable UI components
│   ├── BottomNavBar.js       # Bottom navigation bar
│   ├── PlaceCard.js          # Place card component
│   ├── SkeletonCard.js       # Loading skeleton component
│   ├── LoginForm.js          # Login/registration form
│   └── BookingModal.js       # Booking modal component
│
├── screens/                  # Screen components
│   ├── HomeScreen.js         # Main discovery screen
│   ├── FavoriteScreen.js    # Favorites list screen
│   ├── MapScreen.js         # Map view screen
│   ├── TripsScreen.js       # Trips planning screen
│   ├── ReelsScreen.js       # Video reels screen
│   ├── ProfileScreen.js     # User profile screen
│   ├── PlaceDetailScreen.js # Place details screen
│   ├── LoginScreen.js       # Login/registration screen
│   ├── ManageProfileScreen.js # Profile management screen
│   ├── PasswordSecurityScreen.js # Password change screen
│   ├── AboutUsScreen.js     # About us screen
│   └── HelpCenterScreen.js  # Help center screen
│
├── config/                   # Configuration files
│   └── supabase.js          # Supabase client configuration
│
├── constants/                # App constants
│   ├── colors.js            # Color palette definitions
│   └── fonts.js             # Font family definitions
│
├── utils/                    # Utility functions
│   ├── auth.js              # Authentication utilities
│   ├── favorites.js        # Favorites management
│   ├── favoritesCache.js   # Favorites caching
│   ├── trips.js            # Trips management
│   ├── reels.js            # Reels management
│   └── placesCache.js      # Places data caching
│
└── database/                # Database schemas
    └── users_table.sql     # Users table schema
```

---

## 🗄️ Database Schema

### Supabase Tables

#### 1. `users` Table
Stores user account information.

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(255),
  state VARCHAR(255),
  country VARCHAR(255),
  postal_code VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `idx_users_email` on `email` column for faster lookups

**Triggers:**
- `update_users_updated_at`: Automatically updates `updated_at` on row updates

#### 2. `places` Table
Stores information about places/venues.

**Expected Schema:**
- `id` (UUID): Primary key
- `name` (VARCHAR): Place name
- `description` (TEXT): Place description
- `category` (VARCHAR): Main category (Sports, Adventure, Parks, etc.)
- `sub_category` (VARCHAR): Sub-category
- `rating` (NUMERIC): Average rating
- `price` (VARCHAR): Price information
- `image_url` (VARCHAR): Image URL
- `latitude` (NUMERIC): Latitude coordinate
- `longitude` (NUMERIC): Longitude coordinate
- `country` (VARCHAR): Country code
- `city` (VARCHAR): City name
- `address` (TEXT): Full address
- Additional metadata fields

#### 3. `user_places` Table
Junction table for user favorites.

**Expected Schema:**
- `user_id` (UUID): Foreign key to `users.id`
- `fav_place_id` (UUID): Foreign key to `places.id`
- Unique constraint on `(user_id, fav_place_id)`

#### 4. `reviews` Table
Stores user reviews for places.

**Expected Schema:**
- `id` (UUID): Primary key
- `place_id` (UUID): Foreign key to `places.id`
- `user_id` (UUID): Foreign key to `users.id`
- `rating` (NUMERIC): Review rating
- `comment` (TEXT): Review comment
- `created_at` (TIMESTAMP): Review timestamp

### Database Relationships

```
users (1) ────< (many) user_places (many) >─── (1) places
places (1) ────< (many) reviews
users (1) ────< (many) reviews
```

---

## 🎨 Color Scheme

### Light Mode Palette: "Forest Highlands"

The app uses a sophisticated earthy color palette inspired by forest landscapes:

```javascript
{
  // Primary Colors
  primary: "#3E5C54",           // Deep Juniper - Main brand color
  secondary: "#D4A373",         // Warm Sand - Accent color
  accent: "#E9AD52",            // Muted Gold - Highlights and ratings
  
  // Background Colors
  background: "#F8F9F4",        // Bone - Main background
  surface: "#E3E9E2",          // Soft Moss - Secondary surfaces
  topsectionbackground: "#EEF2E6", // Top section background
  cardBackground: "#FFFFFF",    // White - Card backgrounds
  
  // Text Colors
  text: "#24302D",             // Dark Forest Charcoal - Primary text
  textSecondary: "#5F6D6A",    // Secondary text
  
  // UI Elements
  border: "#DDE3D9",           // Border color
  shadow: "rgba(36, 48, 45, 0.1)", // Shadow color
  badgeBackground: "#F4F4F5",  // Badge background
  
  // Status Colors
  success: "#5B8266",          // Success state
  error: "#A35248",            // Error state (Muted Clay Red)
  warning: "#D4A373",          // Warning state
  info: "#3E5C54",             // Info state
  
  // Special
  todayRow: "#BBD3BB",         // Highlight for today's row
}
```

### Dark Mode Palette: "Neutral Stone"

Dark mode uses a neutral stone-inspired palette:

```javascript
{
  primary: "#4F6F64",           // Muted Juniper
  secondary: "#9B7B52",         // Soft Sandstone
  accent: "#CFA24A",           // Antique Gold
  background: "#0E0F10",       // Deep Charcoal
  surface: "#161819",           // Dark Stone
  cardBackground: "#1C1F20",   // Card background
  text: "#E7E9EA",             // Clean off-white
  textSecondary: "#A0A5A8",     // Neutral gray
  border: "#2A2E30",           // Border color
  // ... (similar structure)
}
```

**Color Usage Guidelines:**
- **Primary**: Used for main actions, navigation, and brand elements
- **Secondary**: Used for secondary actions and accents
- **Accent**: Used for ratings, highlights, and "Guest Favorite" badges
- **Background**: Main app background
- **Surface**: Elevated surfaces like modals and cards
- **Text**: Primary text content
- **TextSecondary**: Secondary text, labels, and hints

---

## 📝 Typography

### Font Family: Parkinsans

The app uses a custom font family called "Parkinsans" with multiple weights:

```javascript
{
  light: "Parkinsans-Light",        // 300
  regular: "Parkinsans-Regular",   // 400
  medium: "Parkinsans-Medium",     // 500
  semiBold: "Parkinsans-SemiBold", // 600
  bold: "Parkinsans-Bold",         // 700
  extraBold: "Parkinsans-ExtraBold" // 800
}
```

**Font Files Location:** `assets/fonts/`

**Usage Guidelines:**
- **Light**: Subtle text, captions
- **Regular**: Body text, default font
- **Medium**: Emphasized text
- **SemiBold**: Headings, labels
- **Bold**: Strong emphasis, titles
- **ExtraBold**: Large headings, hero text

---

## 📱 Screens

### 1. HomeScreen (`screens/HomeScreen.js`)
**Purpose**: Main discovery screen showing places filtered by location and preferences.

**Features:**
- Displays top 50 places by default (configurable)
- Load more functionality (20 places at a time)
- Category filtering (All, Sports, Adventure, Parks, Staycation, Tickets, Exclusive)
- Sub-category filtering
- Rating filtering (0-5 stars)
- Sorting options (Distance, Price, Rating)
- Skeleton loading states
- Place cards with images, ratings, prices

**Props:**
- `userCountry`: User's country for filtering
- `activeCategory`: Currently selected category
- `onPlacePress`: Callback when place is pressed
- `filters`: Applied filter object

### 2. FavoriteScreen (`screens/FavoriteScreen.js`)
**Purpose**: Displays user's favorite places.

**Features:**
- Fetches favorites from `user_places` table
- Shows favorite places in card format
- Empty state when no favorites
- Skeleton loading states
- Syncs with database

**Props:**
- `userCountry`: User's country for filtering
- `onPlacePress`: Callback when place is pressed
- `onBack`: Callback to return to home

### 3. MapScreen (`screens/MapScreen.js`)
**Purpose**: Interactive map view of places.

**Features:**
- Map interface showing places
- Location-based filtering
- Place markers on map
- Navigation to place details

**Props:**
- `userCountry`: User's country for filtering
- `onPlacePress`: Callback when place is pressed
- `onBack`: Callback to return to home

### 4. TripsScreen (`screens/TripsScreen.js`)
**Purpose**: Trip planning and management.

**Features:**
- View saved trips
- Add places to trips
- Organize places for future visits
- Empty state for new users

**Props:**
- `userCountry`: User's country for filtering
- `onPlacePress`: Callback when place is pressed
- `onBack`: Callback to return to home

### 5. ReelsScreen (`screens/ReelsScreen.js`)
**Purpose**: Video reels for discovering places.

**Features:**
- Video-based place discovery
- Swipeable reel interface
- Place information overlay
- Navigation to place details

**Props:**
- `userCountry`: User's country for filtering
- `onPlacePress`: Callback when place is pressed
- `onBack`: Callback to return to home

### 6. ProfileScreen (`screens/ProfileScreen.js`)
**Purpose**: User profile and account management.

**Features:**
- User information display
- Login/registration integration
- Navigation to profile management
- Account settings access
- Logout functionality

**Props:**
- `onLoginSuccess`: Callback when login succeeds
- `onBack`: Callback to return to home

### 7. PlaceDetailScreen (`screens/PlaceDetailScreen.js`)
**Purpose**: Detailed view of a specific place.

**Features:**
- Full place information
- Image gallery
- Reviews and ratings
- Favorite toggle
- Booking functionality
- Share options

**Props:**
- `placeId`: ID of the place to display
- `onClose`: Callback to close detail screen

### 8. LoginScreen (`screens/LoginScreen.js`)
**Purpose**: User authentication.

**Features:**
- Email/password login
- User registration
- Form validation
- Error handling
- Navigation to profile on success

### 9. ManageProfileScreen (`screens/ManageProfileScreen.js`)
**Purpose**: Edit user profile information.

**Features:**
- Update personal information
- Change address details
- Save changes to database
- Form validation

### 10. PasswordSecurityScreen (`screens/PasswordSecurityScreen.js`)
**Purpose**: Change user password.

**Features:**
- Password change form
- Current password verification
- New password validation
- Secure password update

### 11. AboutUsScreen (`screens/AboutUsScreen.js`)
**Purpose**: App information and about section.

**Features:**
- App description
- Features overview
- Company information

### 12. HelpCenterScreen (`screens/HelpCenterScreen.js`)
**Purpose**: Help and support information.

**Features:**
- FAQ section
- Support contact
- Help articles

---

## 🧭 Routing & Navigation

### Navigation Structure

The app uses a **tab-based navigation** system with conditional screen rendering:

```
App.js (Root)
│
├── Home Tab (default)
│   └── HomeScreen
│
├── Favorite Tab
│   └── FavoriteScreen
│
├── Map Tab
│   └── MapScreen
│
├── Trips Tab
│   └── TripsScreen
│
├── Reels Tab
│   └── ReelsScreen
│
├── Profile Tab
│   └── ProfileScreen
│       ├── LoginScreen (if not logged in)
│       ├── ManageProfileScreen
│       ├── PasswordSecurityScreen
│       ├── AboutUsScreen
│       └── HelpCenterScreen
│
└── PlaceDetailScreen (Modal overlay)
    └── Shows when placeId is selected
```

### Navigation Flow

1. **App Initialization**:
   - App.js loads fonts
   - Requests location permissions
   - Determines user country
   - Sets default tab to "home"

2. **Tab Navigation**:
   - Bottom navigation bar (`BottomNavBar`) controls active tab
   - State managed in App.js via `activeTab` state
   - Tab changes trigger screen rendering

3. **Place Detail Navigation**:
   - When a place is selected, `selectedPlaceId` is set
   - `PlaceDetailScreen` overlays current screen
   - Back button or `onClose` returns to previous screen

4. **Profile Navigation**:
   - Profile screen contains nested navigation
   - Login screen shown if user not authenticated
   - Profile management screens accessible from profile

### State Management for Navigation

```javascript
// In App.js
const [activeTab, setActiveTab] = useState("home");
const [selectedPlaceId, setSelectedPlaceId] = useState(null);
```

**Tab IDs:**
- `"home"`: HomeScreen
- `"favorite"`: FavoriteScreen
- `"map"`: MapScreen
- `"trips"`: TripsScreen
- `"reels"`: ReelsScreen
- `"profile"`: ProfileScreen

### Conditional Rendering Logic

```javascript
{selectedPlaceId ? (
  <PlaceDetailScreen
    placeId={selectedPlaceId}
    onClose={() => setSelectedPlaceId(null)}
  />
) : (
  <>
    {activeTab === "favorite" ? (
      <FavoriteScreen ... />
    ) : activeTab === "map" ? (
      <MapScreen ... />
    ) : activeTab === "trips" ? (
      <TripsScreen ... />
    ) : activeTab === "reels" ? (
      <ReelsScreen ... />
    ) : activeTab === "profile" ? (
      <ProfileScreen ... />
    ) : (
      <HomeScreen ... />
    )}
    <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
  </>
)}
```

---

## 🧩 Components

### 1. BottomNavBar (`components/BottomNavBar.js`)
**Purpose**: Bottom navigation bar with tab switching.

**Features:**
- 6 tabs: Home, Favorite, Map, Trips, Reels, Profile
- Animated active tab indicator
- Blur effect on iOS
- Smooth transitions

**Props:**
- `activeTab`: Currently active tab ID
- `onTabChange`: Callback when tab changes

### 2. PlaceCard (`components/PlaceCard.js`)
**Purpose**: Reusable card component for displaying places.

**Features:**
- Place image with lazy loading
- Title, price, and rating display
- Favorite button (heart icon)
- "Guest Favorite" badge for top-rated places
- Tap to navigate to details
- Animated interactions

**Props:**
- `title`: Place name
- `price`: Price information
- `rating`: Rating value
- `imageUri`: Image URL
- `placeId`: Unique place identifier
- `showBadge`: Whether to show "Guest Favorite" badge
- `isSmall`: Smaller card variant
- `onPress`: Callback when card is pressed

### 3. SkeletonCard (`components/SkeletonCard.js`)
**Purpose**: Loading placeholder for place cards.

**Features:**
- Animated skeleton loading
- Matches PlaceCard layout
- Shimmer effect

### 4. LoginForm (`components/LoginForm.js`)
**Purpose**: Reusable login/registration form.

**Features:**
- Email and password inputs
- Form validation
- Login and registration modes
- Error display
- Submit handling

**Props:**
- `onLogin`: Login callback
- `onRegister`: Registration callback
- `mode`: "login" or "register"

### 5. BookingModal (`components/BookingModal.js`)
**Purpose**: Modal for booking a place.

**Features:**
- Date selection
- Guest count selection
- Booking confirmation
- Price calculation

---

## 🔧 Utilities

### Authentication (`utils/auth.js`)
**Purpose**: User authentication and account management.

**Functions:**
- `registerUser(formData)`: Register new user
- `loginUser(email, password)`: Login with credentials
- `logout()`: Logout current user
- `getCurrentUser()`: Get logged-in user data
- `isLoggedIn()`: Check authentication status
- `updateUserData(userData)`: Update user information
- `hashPassword(password)`: Hash password securely
- `verifyPassword(password, hash)`: Verify password

**Security:**
- Uses SHA-256 hashing with salt
- 10,000 iterations for password hashing
- Secure password storage in database

### Favorites (`utils/favorites.js`)
**Purpose**: Manage user favorites.

**Functions:**
- `getFavorites()`: Get all favorite place IDs
- `isFavorite(placeId)`: Check if place is favorited
- `addFavorite(placeId)`: Add place to favorites
- `removeFavorite(placeId)`: Remove place from favorites
- `toggleFavorite(placeId)`: Toggle favorite status
- `saveFavoriteToDatabase(userId, placeId)`: Save to database
- `removeFavoriteFromDatabase(userId, placeId)`: Remove from database
- `isFavoriteInDatabase(userId, placeId)`: Check database status

**Storage:**
- AsyncStorage for local persistence
- Supabase `user_places` table for database sync
- In-memory cache for performance

### Favorites Cache (`utils/favoritesCache.js`)
**Purpose**: Cache favorite places data.

**Functions:**
- `getCachedFavorites(userId, country)`: Get cached favorites
- `setCachedFavorites(places, userId, country)`: Set cache
- `clearFavoritesCache(userId)`: Clear cache

**Cache Strategy:**
- 5-minute cache expiration
- Per-user caching
- Country-specific caching

### Places Cache (`utils/placesCache.js`)
**Purpose**: Cache places data for performance.

**Functions:**
- `getCachedPlaces(country)`: Get cached places
- `setCachedPlaces(places, country)`: Set cache
- `clearPlacesCache()`: Clear cache

**Cache Strategy:**
- 5-minute cache expiration
- Country-specific caching
- Prevents unnecessary API calls

### Trips (`utils/trips.js`)
**Purpose**: Manage user trips.

**Functions:**
- `getTrips()`: Get all trip place IDs
- `isInTrips(placeId)`: Check if place is in trips
- `addTrip(placeId)`: Add place to trips
- `removeTrip(placeId)`: Remove place from trips
- `toggleTrip(placeId)`: Toggle trip status

**Storage:**
- AsyncStorage for local persistence
- In-memory cache

### Reels (`utils/reels.js`)
**Purpose**: Manage reel places.

**Functions:**
- `getReels()`: Get all reel place IDs
- `isInReels(placeId)`: Check if place is in reels
- `addReel(placeId)`: Add place to reels
- `removeReel(placeId)`: Remove place from reels

**Storage:**
- AsyncStorage for local persistence
- In-memory cache

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js**: v18 or higher
- **npm** or **yarn**: Package manager
- **Expo CLI**: `npm install -g expo-cli`
- **iOS Simulator** (for iOS development) or **Android Studio** (for Android development)
- **Supabase Account**: For backend database

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spotnere-mobileapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   COUNTRY_STATE_CITY_API=your_api_key
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL script from `database/users_table.sql` to create the users table
   - Create `places`, `user_places`, and `reviews` tables as needed
   - Configure Row Level Security (RLS) policies if required

5. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

6. **Run on device/simulator**
   - **iOS**: Press `i` in the terminal or scan QR code with Expo Go app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal

### Development Scripts

```bash
npm start          # Start Expo development server
npm run android    # Start Android emulator
npm run ios        # Start iOS simulator
npm run web        # Start web version
```

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `COUNTRY_STATE_CITY_API` | API key for location services | `xxxxx` |

### Environment Variable Priority

The app checks for environment variables in this order:
1. `Constants.expoConfig.extra` (from `app.config.js` - EAS secrets)
2. `process.env.EXPO_PUBLIC_*` (public environment variables)
3. `process.env.*` (fallback)

### Setting Up EAS Secrets (for production builds)

```bash
# Set Supabase URL
eas secret:create --scope project --name SUPABASE_URL --value your_url

# Set Supabase Anon Key
eas secret:create --scope project --name SUPABASE_ANON_KEY --value your_key

# Set Country State City API key
eas secret:create --scope project --name COUNTRY_STATE_CITY_API --value your_api_key
```

---

## 📦 Building & Deployment

### EAS Build Configuration

The app uses Expo Application Services (EAS) for building and deployment.

**Configuration File**: `eas.json`

### Build Profiles

- **Development**: For testing on physical devices
- **Preview**: For internal testing and distribution
- **Production**: For app store releases

### Building for iOS

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build iOS app
eas build --platform ios --profile production
```

### Building for Android

```bash
# Build Android app
eas build --platform android --profile production
```

### App Store Deployment

1. **iOS App Store**:
   - Build with EAS
   - Submit via App Store Connect
   - Bundle ID: `com.spotnere.mobileapp`

2. **Google Play Store**:
   - Build with EAS
   - Submit via Google Play Console
   - Package: `com.spotnere.mobileapp`

### App Configuration

**App Name**: Spotnere – Discover & Book  
**Version**: 1.0.0  
**Bundle ID (iOS)**: `com.spotnere.mobileapp`  
**Package (Android)**: `com.spotnere.mobileapp`  
**Orientation**: Portrait  
**Owner**: shaikabdulkhadar571

---

## 💻 Development Guidelines

### Code Style

- Use **functional components** with hooks
- Follow **React Native** best practices
- Use **ES6+** JavaScript features
- Implement **error boundaries** for error handling
- Use **TypeScript**-style JSDoc comments for documentation

### Component Structure

```javascript
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { colors } from "../constants/colors";
import { fonts } from "../constants/fonts";

const ComponentName = ({ prop1, prop2, onAction }) => {
  // State
  const [state, setState] = useState(initialValue);
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // Handlers
  const handleAction = () => {
    // Handler logic
  };
  
  // Render
  return (
    <View style={styles.container}>
      {/* Component JSX */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Styles
  },
});

export default ComponentName;
```

### Best Practices

1. **Performance**:
   - Use `React.memo` for expensive components
   - Implement lazy loading for images
   - Cache data appropriately
   - Use efficient algorithms (e.g., top-K selection)

2. **Error Handling**:
   - Wrap components in error boundaries
   - Handle async errors gracefully
   - Show user-friendly error messages
   - Log errors for debugging

3. **State Management**:
   - Keep state as local as possible
   - Use AsyncStorage for persistence
   - Sync with database when needed
   - Clear cache on logout

4. **UI/UX**:
   - Show loading states (skeletons)
   - Provide empty states
   - Use consistent spacing and colors
   - Implement smooth animations

5. **Security**:
   - Hash passwords before storage
   - Validate user inputs
   - Use secure API keys
   - Implement proper authentication

### Testing

- Test on both iOS and Android devices
- Test with different screen sizes
- Test offline functionality
- Test error scenarios
- Test authentication flows

### Debugging

- Use React Native Debugger
- Check console logs
- Use Expo DevTools
- Monitor network requests
- Check Supabase logs

---

## 📄 License

0BSD License - See LICENSE file for details

---

## 👥 Contributors

- **Owner**: shaikabdulkhadar571

---

## 📞 Support

For support, please contact the development team or visit the Help Center within the app.

---

## 🔄 Version History

- **v1.0.0** (Current)
  - Initial release
  - Core features implemented
  - Location-based discovery
  - User authentication
  - Favorites and trips management
  - Video reels
  - Map integration

---

**Last Updated**: January 2026
