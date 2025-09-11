import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { Platform } from 'react-native';

// Polyfill AsyncStorage pour Firebase v8
import AsyncStorage from '@react-native-async-storage/async-storage';

// Définir AsyncStorage pour Firebase
if (typeof global !== 'undefined') {
  (global as any).AsyncStorage = AsyncStorage;
}

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDrHav53bbyqKGbv7T0heYK94DqyIoRCuM",
  authDomain: "swapstadium.firebaseapp.com",
  projectId: "swapstadium",
  storageBucket: "swapstadium.appspot.com", // corrected standard bucket domain
  messagingSenderId: "153220517197",
  appId: "1:153220517197:web:358133a81078adc2a87b04",
  measurementId: "G-HHHZFVYE0Z"
};

// Initialisation Firebase v8
try {
  console.log('🔥 [FIREBASE] Initializing Firebase v8...');
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ [FIREBASE] Firebase v8 initialized successfully');
  } else {
    console.log('📝 [FIREBASE] Firebase v8 already initialized');
  }
} catch (error) {
  console.error('💥 [FIREBASE] Initialization error:', error);
}

// Services Firebase v8
export const auth = firebase.auth();
const firestoreInstance = firebase.firestore();

// Apply RN connectivity-friendly settings BEFORE any heavy usage
try {
  if (Platform.OS !== 'web') {
    // Force fallback transport (long polling) to avoid WebChannel timeouts on some Android networks
    // and disable fetch streaming which can be problematic in RN.
    // Only call settings() if not already initialized with settings.
    // settings() must be called before any other Firestore usage.
    firestoreInstance.settings({
      experimentalForceLongPolling: true,
      useFetchStreams: false,
    } as any);
    console.log('🛜 [FIRESTORE] Long polling settings applied for React Native');
  }
} catch (e) {
  console.warn('⚠️ [FIRESTORE] Could not apply long polling settings:', e);
}

export const firestore = firestoreInstance;

// Timestamp utility
export const timestamp = firebase.firestore.Timestamp;

export default firebase;
