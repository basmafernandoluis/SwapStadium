// Polyfill global pour AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Polyfill pour react-native AsyncStorage (pour Firebase et autres modules legacy)
if (typeof global !== 'undefined') {
  // Créer un mock pour react-native AsyncStorage
  global.AsyncStorage = AsyncStorage;
  
  // Polyfill pour les modules qui importent depuis react-native
  if (!global.reactNative) {
    global.reactNative = {};
  }
  global.reactNative.AsyncStorage = AsyncStorage;
}

// Export par défaut pour compatibilité
export default AsyncStorage;
