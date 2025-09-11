// Polyfill React Native pour Firebase - remplace AsyncStorage
const ReactNative = require('react-native');
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

// Créer une copie de React Native avec AsyncStorage remplacé
const ReactNativeWithAsyncStorage = {
  ...ReactNative,
  AsyncStorage,
};

module.exports = ReactNativeWithAsyncStorage;
