// Note: Do NOT import Node-dependent shims here; keep native bundle clean
// IMPORTANT: Patch AsyncStorage on React Native BEFORE anything else runs
// Load AsyncStorage first
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ensure global reference exists for any lib checking global
try {
  if (!(global as any).AsyncStorage) {
    (global as any).AsyncStorage = AsyncStorage;
  }
} catch {}

// Patch the react-native module export to provide a non-throwing AsyncStorage
const ReactNative = require('react-native');
try {
  const descriptor = Object.getOwnPropertyDescriptor(ReactNative, 'AsyncStorage');
  const canRedefine = !descriptor || descriptor.configurable !== false;
  if (canRedefine) {
    Object.defineProperty(ReactNative, 'AsyncStorage', {
      value: AsyncStorage,
      configurable: true,
      enumerable: true,
      writable: false,
    });
  } else if (!ReactNative.AsyncStorage) {
    // Fallback assignment if property is writable (should not call getter)
    (ReactNative as any).AsyncStorage = AsyncStorage;
  }
  console.warn('✅ [INDEX] AsyncStorage patched on react-native export');
} catch (e) {
  console.warn('⚠️ [INDEX] Failed to patch AsyncStorage on react-native:', e);
}

// After patching RN, it's safe to import other libs (which may import RN)
import 'react-native-gesture-handler';

import { registerRootComponent } from 'expo';

console.warn('🚀 [INDEX] Starting SwapStadium app...');

try {
  console.warn('📱 [INDEX] Importing main App component...');
  const App = require('./App').default;
  
  console.warn('✅ [INDEX] App imported successfully, registering...');
  registerRootComponent(App);
  console.warn('✅ [INDEX] App registered successfully!');
} catch (error: any) {
  console.warn('💥 [INDEX] CRITICAL ERROR in app initialization:', error);
  console.warn('💥 [INDEX] Error message:', error?.message);
  console.warn('💥 [INDEX] Error stack:', error?.stack);
  
  // Fallback minimal app
  const { Text, View } = require('react-native');
  const React = require('react');
  
  const FallbackApp = () => React.createElement(View, { 
    style: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: 'red' 
    } 
  }, 
    React.createElement(Text, { 
      style: { 
        color: 'white', 
        fontSize: 20,
        textAlign: 'center',
        padding: 20
      } 
    }, 'Erreur: Impossible de démarrer l\'application - Vérifiez les logs')
  );
  
  registerRootComponent(FallbackApp);
}
