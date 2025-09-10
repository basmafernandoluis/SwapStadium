import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
// Temporairement, on évite storage et messaging qui peuvent causer des problèmes AsyncStorage
// import 'firebase/storage';
// import 'firebase/messaging';

// Configuration Firebase - À remplacer par vos vraies clés
const firebaseConfig = {
  apiKey: "AIzaSyDrHav53bbyqKGbv7T0heYK94DqyIoRCuM",
  authDomain: "swapstadium.firebaseapp.com",
  projectId: "swapstadium",
  storageBucket: "swapstadium.firebasestorage.app",
  messagingSenderId: "153220517197",
  appId: "1:153220517197:web:358133a81078adc2a87b04",
  measurementId: "G-HHHZFVYE0Z"
};

// Initialisation Firebase v8
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}

// Désactiver la persistance Firebase pour éviter AsyncStorage
// Cette ligne évite les erreurs AsyncStorage
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE)
  .then(() => {
    console.log('ℹ️ Firebase auth persistence disabled (no AsyncStorage)');
  })
  .catch((error: any) => {
    console.warn('Persistance déjà configurée:', error.message);
  });

// Services Firebase v8 simplifiés
export const auth = firebase.auth();
export const db = firebase.firestore();
// export const storage = firebase.storage(); // Temporairement désactivé

// Timestamp utility
export const timestamp = firebase.firestore.Timestamp;

console.log('✅ Firebase v8 initialized successfully (simplified)');

export default firebase;
