// Shim global pour compatibilité AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Créer un shim pour l'ancien import de react-native
if (typeof global !== 'undefined') {
  (global as any).AsyncStorage = AsyncStorage;
}

// Shim pour les modules qui cherchent AsyncStorage dans react-native
const ReactNative = require('react-native');
if (ReactNative && !ReactNative.AsyncStorage) {
  ReactNative.AsyncStorage = AsyncStorage;
}

// Export par défaut
export default AsyncStorage;
