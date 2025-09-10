import 'react-native-gesture-handler';
console.warn('🚀 [METRO-INDEX] Starting app...');

import { registerRootComponent } from 'expo';
console.warn('🚀 [METRO-INDEX] Expo imported');

// TEST Firebase en premier
console.warn('🚀 [METRO-INDEX] Testing Firebase before app import...');
import './firebaseTest';
console.warn('🚀 [METRO-INDEX] Firebase test completed');

// SAFE IMPORT - Tester Firebase isolément
try {
  console.warn('🚀 [METRO-INDEX] About to import AppUniversal...');
  // Utiliser Firebase v10 Universal (Web + Mobile compatible)
  const App = require('./AppUniversal').default;
  console.warn('✅ [METRO-INDEX] AppUniversal imported successfully!');
  
  // registerRootComponent calls AppRegistry.registerComponent('main', () => App);
  // It also ensures that whether you load the app in Expo Go or in a native build,
  // the environment is set up appropriately
  registerRootComponent(App);
  console.warn('✅ [METRO-INDEX] App registered successfully!');
} catch (error: any) {
  console.warn('🚨 [METRO-INDEX] CRITICAL IMPORT ERROR:', error);
  console.warn('🚨 [METRO-INDEX] Error message:', error?.message);
  console.warn('🚨 [METRO-INDEX] Error stack:', error?.stack);
  console.warn('� [METRO-INDEX] This is likely a Firebase import issue');
  
  // Rethrow pour que l'erreur soit visible
  throw error;
}
