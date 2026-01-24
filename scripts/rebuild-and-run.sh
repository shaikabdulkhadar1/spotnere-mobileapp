#!/bin/bash

# Script to rebuild and run the app after prebuild

PLATFORM=${1:-android}

echo "🔧 Rebuilding and running app for $PLATFORM..."

if [ "$PLATFORM" = "android" ]; then
  echo "📱 Building Android app..."
  npx expo run:android --device
elif [ "$PLATFORM" = "ios" ]; then
  echo "🍎 Building iOS app..."
  npx expo run:ios
else
  echo "❌ Invalid platform. Use 'android' or 'ios'"
  exit 1
fi
