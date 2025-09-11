// Firebase v10 moderne - sans AsyncStorage
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

// Initialisation Firebase v10
const app = initializeApp(firebaseConfig);

// Services Firebase v10
export const auth = getAuth(app);
export const db = getFirestore(app);

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
