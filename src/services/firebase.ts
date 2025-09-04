import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/messaging';

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

// Configuration de la persistance pour l'authentification
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE)
  .then(() => {
    console.log('ℹ️ Firebase auth persistence set to NONE');
  })
  .catch((error: any) => {
    console.error('Erreur de configuration de la persistance:', error);
  });

// Services Firebase v8
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();

// Timestamp utility
export const timestamp = firebase.firestore.Timestamp;

console.log('✅ Firebase v8 initialized successfully');

export default firebase;
