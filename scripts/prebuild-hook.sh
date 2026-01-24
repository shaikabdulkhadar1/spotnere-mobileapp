#!/bin/bash

# Prebuild hook to clean macOS files before Expo prebuild
# This prevents CocoaPods from failing due to resource fork files

echo "🧹 Cleaning macOS resource fork files before prebuild..."

# Remove all ._* files from node_modules (especially in expo packages)
find node_modules -name "._*" -type f -delete 2>/dev/null || true

# Remove .DS_Store files
find . -name ".DS_Store" -type f -not -path "./node_modules/*" -delete 2>/dev/null || true

# Remove resource forks from ios directory if it exists
if [ -d "ios" ]; then
  find ios -name "._*" -type f -delete 2>/dev/null || true
fi

# Remove resource forks from android directory if it exists
if [ -d "android" ]; then
  find android -name "._*" -type f -delete 2>/dev/null || true
fi

# Remove resource forks from plugins directory
if [ -d "plugins" ]; then
  find plugins -name "._*" -type f -delete 2>/dev/null || true
fi

echo "✅ Cleanup complete!"
