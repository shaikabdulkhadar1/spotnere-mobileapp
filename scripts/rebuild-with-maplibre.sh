#!/bin/bash

# Script to rebuild the app with MapLibre native module properly registered

echo "🔧 Rebuilding app with MapLibre native module..."

# Clean macOS files
echo "1️⃣ Cleaning macOS resource fork files..."
npm run clean:macos

# Clean native projects
echo "2️⃣ Cleaning native projects..."
rm -rf ios android

# Clean node_modules and reinstall
echo "3️⃣ Reinstalling dependencies..."
rm -rf node_modules
npm install

# Rebuild native projects
echo "4️⃣ Rebuilding native projects..."
npx expo prebuild --clean

# For iOS, install pods
if [ -d "ios" ]; then
  echo "5️⃣ Installing iOS pods..."
  cd ios
  pod install
  cd ..
fi

echo "✅ Rebuild complete!"
echo ""
echo "Now run:"
echo "  - iOS: npx expo run:ios"
echo "  - Android: npx expo run:android --device"
