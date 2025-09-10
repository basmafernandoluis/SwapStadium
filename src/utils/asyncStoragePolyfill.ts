// Polyfill pour AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ajouter AsyncStorage à l'objet global pour les dépendances qui l'attendent
if (typeof global !== 'undefined') {
  (global as any).AsyncStorage = AsyncStorage;
}

export default AsyncStorage;
