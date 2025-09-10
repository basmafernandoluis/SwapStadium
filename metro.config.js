const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuration complète pour AsyncStorage
config.resolver.alias = {
  '@react-native-community/async-storage': '@react-native-async-storage/async-storage',
  // Redirection directe pour les imports depuis react-native
  'react-native/AsyncStorage': '@react-native-async-storage/async-storage',
  'react-native/Libraries/Storage/AsyncStorage': '@react-native-async-storage/async-storage',
};

// Polyfill pour AsyncStorage dans le module react-native
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
