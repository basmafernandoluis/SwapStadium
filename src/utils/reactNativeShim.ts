// Shim pour React Native qui inclut AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Intercepter et patcher React Native avant que Firebase ne l'importe
const originalReactNative = require('react-native');

// Créer une version patchée de React Native avec AsyncStorage
const PatchedReactNative = {
  ...originalReactNative,
  AsyncStorage: AsyncStorage,
};

// Remplacer le module react-native dans le cache de require
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id: string) {
  if (id === 'react-native') {
    return PatchedReactNative;
  }
  // @ts-ignore - preserve original 'this'
  return originalRequire.apply(this, arguments as any);
};

export default PatchedReactNative;
