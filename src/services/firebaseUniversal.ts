// Firebase v10 - Configuration universelle Web + Mobile avec DEBUG LOGS
console.log('🚀 [DEBUG] Starting Firebase Universal import...');
// METRO LOG pour mobile
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  console.warn('🔥 [METRO] Firebase Universal import started for mobile');
}

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
console.log('🚀 [DEBUG] Firebase app imports loaded');

import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile, 
  Auth
} from 'firebase/auth';
console.log('🚀 [DEBUG] Firebase auth imports loaded');

import { getFirestore, Firestore } from 'firebase/firestore';
console.log('🚀 [DEBUG] Firebase firestore imports loaded');

import { Platform } from 'react-native';
console.log('🚀 [DEBUG] Platform imported, current platform:', Platform.OS);
// METRO LOG pour mobile
if (Platform.OS !== 'web') {
  console.warn(`🔥 [METRO] Running on ${Platform.OS} platform`);
}

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
console.log('🚀 [DEBUG] Firebase config created for platform:', Platform.OS);

// Initialisation Firebase avec protection
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

console.log('🚀 [DEBUG] Starting Firebase initialization...');

try {
  console.log('🚀 [DEBUG] Checking existing apps...');
  const existingApps = getApps();
  console.log('🚀 [DEBUG] Existing apps count:', existingApps.length);
  
  // Vérifier si Firebase est déjà initialisé
  if (existingApps.length === 0) {
    console.log('🚀 [DEBUG] No existing apps, initializing new Firebase app...');
    app = initializeApp(firebaseConfig);
    console.log('✅ [DEBUG] Firebase v10 app initialized for', Platform.OS);
  } else {
    console.log('🚀 [DEBUG] Using existing Firebase app...');
    app = getApp();
    console.log('✅ [DEBUG] Firebase v10 app already exists');
  }

  console.log('🚀 [DEBUG] Firebase app ready, initializing services...');

  // Initialiser Auth avec gestion d'erreur
  console.log('🚀 [DEBUG] Initializing Auth service...');
  auth = getAuth(app);
  console.log('✅ [DEBUG] Auth service initialized successfully');
  
  console.log('🚀 [DEBUG] Initializing Firestore service...');
  db = getFirestore(app);
  console.log('✅ [DEBUG] Firestore service initialized successfully');
  
  console.log('✅ [DEBUG] ALL Firebase services initialized successfully for', Platform.OS);
  // METRO LOG pour mobile
  if (Platform.OS !== 'web') {
    console.warn(`✅ [METRO] Firebase services ready on ${Platform.OS}`);
  }
} catch (error: any) {
  console.error('❌ [DEBUG] Firebase initialization error:', error);
  console.error('❌ [DEBUG] Error details:', {
    name: error?.name,
    message: error?.message,
    code: error?.code,
    stack: error?.stack
  });
  // METRO LOG pour mobile - ERREUR CRITIQUE
  if (Platform.OS !== 'web') {
    console.warn(`🚨 [METRO] FIREBASE INIT ERROR on ${Platform.OS}:`, error?.message || error);
    console.warn(`🚨 [METRO] Error code:`, error?.code);
  }
  throw error;
}

// Export sécurisé
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

// Service d'authentification avec retry
export class AuthService {
  // Retry wrapper pour les opérations auth
  private static async withRetry<T>(operation: () => Promise<T>, retries = 3): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error: any) {
        console.log(`Attempt ${i + 1} failed:`, error?.code || error);
        if (i === retries - 1 || error?.code === 'auth/network-request-failed') {
          throw error;
        }
        // Attendre avant le retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('Max retries exceeded');
  }

  static async signIn(email: string, password: string): Promise<AuthResult> {
    console.log('� [DEBUG] AuthService.signIn called with:', { email, platform: Platform.OS });
    
    try {
      console.log('🔐 [DEBUG] Starting signIn process...');
      console.log('🔐 [DEBUG] Auth object available:', !!auth);
      console.log('🔐 [DEBUG] Auth object type:', typeof auth);
      
      console.log('🔐 [DEBUG] Calling withRetry for signInWithEmailAndPassword...');
      
      const userCredential = await this.withRetry(() => {
        console.log('🔐 [DEBUG] Executing signInWithEmailAndPassword...');
        return signInWithEmailAndPassword(auth, email, password);
      });
      
      console.log('🔐 [DEBUG] signInWithEmailAndPassword completed');
      const firebaseUser = userCredential.user;
      console.log('✅ [DEBUG] AuthService - Connexion réussie:', firebaseUser.uid);
      
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
      };
      
      console.log('✅ [DEBUG] User object created:', user);
      return { success: true, user };
    } catch (error: any) {
      console.error('❌ [DEBUG] AuthService - Erreur lors de la connexion:', error);
      console.error('❌ [DEBUG] Error code:', error?.code);
      console.error('❌ [DEBUG] Error message:', error?.message);
      console.error('❌ [DEBUG] Full error object:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }
  
  static async signUp(email: string, password: string, displayName?: string): Promise<AuthResult> {
    try {
      console.log('🔥 AuthService - Début inscription:', { email, displayName, platform: Platform.OS });
      
      const userCredential = await this.withRetry(() => 
        createUserWithEmailAndPassword(auth, email, password)
      );
      
      const firebaseUser = userCredential.user;
      
      // Mise à jour du profil si un nom est fourni
      if (displayName) {
        await updateProfile(firebaseUser, { displayName });
      }
      
      console.log('✅ AuthService - Inscription réussie:', firebaseUser.uid);
      
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || displayName,
        photoURL: firebaseUser.photoURL || undefined,
      };
      
      return { success: true, user };
    } catch (error: any) {
      console.error('❌ AuthService - Erreur lors de l\'inscription:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }
  
  static async signOut(): Promise<AuthResult> {
    try {
      await signOut(auth);
      console.log('✅ AuthService - Déconnexion réussie');
      return { success: true };
    } catch (error: any) {
      console.error('❌ AuthService - Erreur lors de la déconnexion:', error);
      return { 
        success: false, 
        error: 'Erreur lors de la déconnexion' 
      };
    }
  }
  
  static getCurrentUser(): User | null {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;
      
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
      };
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  }
  
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, (firebaseUser) => {
      try {
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
      } catch (error) {
        console.error('❌ Error in auth state change:', error);
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
        return 'Erreur de connexion réseau. Vérifiez votre connexion internet';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Réessayez plus tard';
      case 'auth/invalid-credential':
        return 'Email ou mot de passe incorrect';
      default:
        console.log('Unknown auth error:', errorCode);
        return 'Erreur d\'authentification';
    }
  }
}

console.log(`✅ Firebase v10 initialized successfully for ${Platform.OS}`);

export default app;
