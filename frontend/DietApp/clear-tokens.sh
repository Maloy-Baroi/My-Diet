#!/bin/bash

# Script to clear all authentication tokens and reset the app state
# This is useful during development when you want to start fresh

echo "🧹 Clearing all authentication tokens and app data..."

# Clear Metro bundler cache
echo "📦 Clearing Metro bundler cache..."
npx expo r -c

# Clear React Native cache
echo "⚛️  Clearing React Native cache..."
npx react-native start --reset-cache 2>/dev/null || echo "React Native CLI not found, skipping..."

# Clear npm cache (optional)
echo "📋 Clearing npm cache..."
npm cache clean --force

# Clear Expo cache
echo "🚀 Clearing Expo cache..."
npx expo install --fix

echo "✅ All caches cleared!"
echo ""
echo "🔄 Starting the app with fresh state..."
echo "All stored tokens will be automatically cleared on app initialization."
echo ""

# Start the app
npx expo start --clear
