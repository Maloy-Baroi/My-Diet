const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure Metro looks for dependencies in the correct location
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

// Add additional platforms if needed
config.resolver.platforms = ['ios', 'android', 'web'];

module.exports = config;
