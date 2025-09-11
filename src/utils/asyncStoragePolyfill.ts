// Polyfill complet pour AsyncStorage et autres globaux
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration des polyfills globaux
if (typeof global !== 'undefined') {
  // AsyncStorage global pour Firebase et autres dépendances
  if (!(global as any).AsyncStorage) {
    (global as any).AsyncStorage = AsyncStorage;
    console.warn('✅ [POLYFILL] AsyncStorage installé globalement');
  }
  
  // Polyfills pour les fonctions de base64 (nécessaires pour Firebase)
  if (!global.btoa) {
    (global as any).btoa = (str: string) => {
      try {
        return Buffer.from(str, 'binary').toString('base64');
      } catch (e) {
        console.warn('⚠️ [POLYFILL] Erreur btoa:', e);
        return '';
      }
    };
    console.warn('✅ [POLYFILL] btoa installé globalement');
  }
  
  if (!global.atob) {
    (global as any).atob = (str: string) => {
      try {
        return Buffer.from(str, 'base64').toString('binary');
      } catch (e) {
        console.warn('⚠️ [POLYFILL] Erreur atob:', e);
        return '';
      }
    };
    console.warn('✅ [POLYFILL] atob installé globalement');
  }
  
  // Polyfill pour URL si nécessaire
  if (typeof global.URL === 'undefined') {
    try {
      (global as any).URL = require('react-native-url-polyfill/auto');
      console.warn('✅ [POLYFILL] URL polyfill installé');
    } catch (e) {
      console.warn('⚠️ [POLYFILL] URL polyfill non disponible:', e);
    }
  }
}

export default AsyncStorage;
