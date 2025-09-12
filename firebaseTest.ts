// Test minimal Firebase import pour diagnostiquer
console.warn('🔥 [METRO-FIREBASE-TEST] Starting Firebase test import...');

try {
  console.warn('🔥 [METRO-FIREBASE-TEST] Testing Firebase app import...');
  const { initializeApp } = require('firebase/app');
  console.warn('✅ [METRO-FIREBASE-TEST] Firebase app imported OK');
  
  console.warn('🔥 [METRO-FIREBASE-TEST] Testing Firebase auth import...');
  const { getAuth } = require('firebase/auth');
  console.warn('✅ [METRO-FIREBASE-TEST] Firebase auth imported OK');
  
  console.warn('🔥 [METRO-FIREBASE-TEST] Testing Firebase initialization...');
  const firebaseConfig = {
    apiKey: "AIzaSyDrHav53bbyqKGbv7T0heYK94DqyIoRCuM",
    authDomain: "swapstadium.firebaseapp.com",
    projectId: "swapstadium",
    storageBucket: "swapstadium.firebasestorage.app",
    messagingSenderId: "153220517197",
    appId: "1:153220517197:web:358133a81078adc2a87b04",
    measurementId: "G-HHHZFVYE0Z"
  };
  
  const app = initializeApp(firebaseConfig);
  console.warn('✅ [METRO-FIREBASE-TEST] Firebase app initialized OK');
  
  const auth = getAuth(app);
  console.warn('✅ [METRO-FIREBASE-TEST] Firebase auth initialized OK');
  
  console.warn('🎉 [METRO-FIREBASE-TEST] ALL FIREBASE TESTS PASSED!');
  
} catch (error: any) {
  console.warn('🚨 [METRO-FIREBASE-TEST] FIREBASE ERROR:', error);
  console.warn('🚨 [METRO-FIREBASE-TEST] Error message:', error?.message);
  console.warn('🚨 [METRO-FIREBASE-TEST] Error code:', error?.code);
  console.warn('🚨 [METRO-FIREBASE-TEST] Error stack:', error?.stack);
}

export const firebaseTestPassed = true;
