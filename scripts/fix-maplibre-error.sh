#!/bin/bash

# Script to fix MapLibre "EventTypes of null" error by rebuilding the app

echo "🔧 Fixing MapLibre native module error..."
echo ""
echo "This error occurs because the app binary needs to be rebuilt after adding MapLibre."
echo ""

# Clean macOS files
echo "1️⃣ Cleaning macOS resource fork files..."
npm run clean:macos

# Clean native projects
echo "2️⃣ Cleaning native projects..."
rm -rf ios android

# Reinstall dependencies
echo "3️⃣ Reinstalling dependencies..."
npm install

# Rebuild native projects
echo "4️⃣ Rebuilding native projects with MapLibre..."
npx expo prebuild --clean

# For iOS, install pods
if [ -d "ios" ]; then
  echo "5️⃣ Installing iOS pods..."
  cd ios
  pod install
  cd ..
fi

echo ""
echo "✅ Prebuild complete!"
echo ""
echo "⚠️  IMPORTANT: You must now rebuild the app binary:"
echo ""
echo "   For Android:"
echo "   npx expo run:android --device"
echo ""
echo "   For iOS:"
echo "   npx expo run:ios"
echo ""
echo "After rebuilding, the MapLibre native module will be properly registered."
