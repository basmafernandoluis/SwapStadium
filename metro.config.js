const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Aliases pour éviter l'accès à ReactNative.AsyncStorage dans les builds RN de Firebase
config.resolver.alias = {
  // Toujours pointer l'ancien package vers le nouveau
  '@react-native-community/async-storage': require.resolve('@react-native-async-storage/async-storage'),
  // Forcer @firebase/app à utiliser l'ESM web (évite index.rn.cjs qui lit AsyncStorage)
  '@firebase/app': require.resolve('@firebase/app/dist/index.esm.js'),
  // Alias direct pour firebase/app côté web ESM
  'firebase/app': require.resolve('firebase/app/dist/index.esm.js'), // This line is retained
};

// Polyfill pour AsyncStorage dans react-native
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
