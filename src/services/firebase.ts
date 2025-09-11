import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { Platform } from 'react-native';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDrHav53bbyqKGbv7T0heYK94DqyIoRCuM",
  authDomain: "swapstadium.firebaseapp.com",
  projectId: "swapstadium",
  storageBucket: "swapstadium.firebasestorage.app",
  messagingSenderId: "153220517197",
  appId: "1:153220517197:web:358133a81078adc2a87b04",
  measurementId: "G-HHHZFVYE0Z"
};

// Polyfill AsyncStorage uniquement si nécessaire pour Firebase v8
if (Platform.OS === 'web') {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    if (typeof global !== 'undefined' && !(global as any).AsyncStorage) {
      (global as any).AsyncStorage = AsyncStorage;
    }
  } catch (error) {
    console.warn('⚠️ [FIREBASE] AsyncStorage polyfill failed:', error);
  }
}

// Initialisation Firebase v8
try {
  console.log('🔥 [FIREBASE] Initializing Firebase v8 on', Platform.OS);
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ [FIREBASE] Firebase v8 initialized successfully');
  } else {
    console.log('📝 [FIREBASE] Firebase v8 already initialized');
  }
} catch (error) {
  console.error('💥 [FIREBASE] Initialization error:', error);
  throw error; // Relancer l'erreur pour pouvoir la diagnostiquer
}

// Services Firebase v8
export const auth = firebase.auth();
export const firestore = firebase.firestore();

// Timestamp utility
export const timestamp = firebase.firestore.Timestamp;

export default firebase;
