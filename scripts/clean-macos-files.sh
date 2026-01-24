#!/bin/bash

# Script to clean macOS resource fork files that interfere with builds

echo "🧹 Cleaning macOS resource fork files..."

# Remove all ._* files from node_modules
find node_modules -name "._*" -type f -delete 2>/dev/null || true

# Remove .DS_Store files
find . -name ".DS_Store" -type f -delete 2>/dev/null || true

# Remove resource forks from ios directory
find ios -name "._*" -type f -delete 2>/dev/null || true

# Remove resource forks from android directory
find android -name "._*" -type f -delete 2>/dev/null || true

# Remove resource forks from plugins directory
find plugins -name "._*" -type f -delete 2>/dev/null || true

echo "✅ Cleanup complete!"
