// Firebase v10 moderne - sans AsyncStorage
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, initializeAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

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

// Initialisation Firebase v10 avec vérification
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase v10 app initialized');
} else {
  app = getApp();
  console.log('✅ Firebase v10 app already exists');
}

// Firebase v10 moderne - sans AsyncStorage
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, initializeAuth, Auth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

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

// Initialisation Firebase v10 avec vérification
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase v10 app initialized');
} else {
  app = getApp();
  console.log('✅ Firebase v10 app already exists');
}

// Services Firebase v10 avec initialisation spécifique React Native
let auth: Auth;
let db: Firestore;

try {
  // Initialiser Auth spécifiquement pour React Native avec persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
  db = getFirestore(app);
  console.log('✅ Firebase v10 Auth initialized with React Native persistence');
} catch (error: any) {
  // Si l'auth est déjà initialisée, utiliser getAuth
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase v10 Auth already initialized, using getAuth');
  } else {
    console.error('❌ Error initializing Firebase Auth:', error);
    // Fallback vers getAuth basique
    try {
      auth = getAuth(app);
      db = getFirestore(app);
      console.log('✅ Firebase v10 services initialized with getAuth fallback');
    } catch (fallbackError) {
      console.error('❌ Failed to initialize Firebase services completely:', fallbackError);
      throw fallbackError;
    }
  }
}

export { auth, db };

// Types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Service d'authentification moderne
export class AuthService {
  static async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('🔥 AuthService v10 - Début connexion:', { email });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      console.log('✅ AuthService v10 - Connexion réussie:', firebaseUser.uid);
      
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
      };
      
      return { success: true, user };
    } catch (error: any) {
      console.error('❌ AuthService v10 - Erreur lors de la connexion:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }
  
  static async signUp(email: string, password: string, displayName?: string): Promise<AuthResult> {
    try {
      console.log('🔥 AuthService v10 - Début inscription:', { email, displayName });
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Mise à jour du profil si un nom est fourni
      if (displayName) {
        await updateProfile(firebaseUser, { displayName });
      }
      
      console.log('✅ AuthService v10 - Inscription réussie:', firebaseUser.uid);
      
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || displayName,
        photoURL: firebaseUser.photoURL || undefined,
      };
      
      return { success: true, user };
    } catch (error: any) {
      console.error('❌ AuthService v10 - Erreur lors de l\'inscription:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }
  
  static async signOut(): Promise<AuthResult> {
    try {
      await signOut(auth);
      console.log('✅ AuthService v10 - Déconnexion réussie');
      return { success: true };
    } catch (error: any) {
      console.error('❌ AuthService v10 - Erreur lors de la déconnexion:', error);
      return { 
        success: false, 
        error: 'Erreur lors de la déconnexion' 
      };
    }
  }
  
  static getCurrentUser(): User | null {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || undefined,
      photoURL: firebaseUser.photoURL || undefined,
    };
  }
  
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined,
        };
        callback(user);
      } else {
        callback(null);
      }
    });
  }
  
  // Messages d'erreur en français
  private static getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Aucun compte trouvé avec cet email';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect';
      case 'auth/email-already-in-use':
        return 'Un compte existe déjà avec cet email';
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères';
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/network-request-failed':
        return 'Erreur de connexion réseau';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Réessayez plus tard';
      default:
        return 'Erreur d\'authentification';
    }
  }
}

console.log('✅ Firebase v10 initialized successfully (no AsyncStorage!)');

export default app;
