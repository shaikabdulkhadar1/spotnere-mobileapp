#!/bin/bash

# Script to fix CocoaPods installation issues caused by macOS resource forks

echo "🔧 Fixing CocoaPods installation issues..."

# Clean macOS resource fork files first
./scripts/clean-macos-files.sh

# Clean CocoaPods cache
cd ios
rm -rf Pods Podfile.lock
cd ..

# Clean derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null || true

echo "✅ Cleanup complete!"
echo ""
echo "Now run: cd ios && pod install"
