// Service Firebase hybride : v8 pour mobile, v10 pour web
import { Platform } from 'react-native';

console.warn('🔄 [FIREBASE-HYBRID] Starting Firebase service...');
console.warn('🔄 [FIREBASE-HYBRID] Platform detected:', Platform.OS);

// Firebase v8 pour mobile (compatible avec Expo Go)
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDrHav53bbyqKGbv7T0heYK94DqyIoRCuM",
  authDomain: "swapstadium-c04d4.firebaseapp.com",
  projectId: "swapstadium-c04d4",
  storageBucket: "swapstadium-c04d4.firebasestorage.app",
  messagingSenderId: "1038183074069",
  appId: "1:1038183074069:web:3cc0e5b30fbc1b58cc27b9"
};

class FirebaseHybridService {
  private app: any = null;
  private auth: any = null;
  private firestore: any = null;
  private isInitialized = false;

  async initialize() {
    try {
      console.warn('🔄 [FIREBASE-HYBRID] Initializing for platform:', Platform.OS);

      if (Platform.OS === 'web') {
        console.warn('🌐 [FIREBASE-HYBRID] Using Firebase v10 for web...');
        // Import dynamique pour éviter les erreurs sur mobile
        const { initializeApp } = await import('firebase/app');
        const { getAuth } = await import('firebase/auth');
        const { getFirestore } = await import('firebase/firestore');

        this.app = initializeApp(firebaseConfig);
        this.auth = getAuth(this.app);
        this.firestore = getFirestore(this.app);
      } else {
        console.warn('📱 [FIREBASE-HYBRID] Using Firebase v8 for mobile...');
        // Firebase v8 pour mobile
        if (!firebase.apps.length) {
          this.app = firebase.initializeApp(firebaseConfig);
        } else {
          this.app = firebase.app();
        }
        this.auth = firebase.auth();
        this.firestore = firebase.firestore();
      }

      this.isInitialized = true;
      console.warn('✅ [FIREBASE-HYBRID] Firebase initialized successfully!');
      return { success: true };
    } catch (error) {
      console.warn('💥 [FIREBASE-HYBRID] Firebase initialization failed:', error);
      return { success: false, error };
    }
  }

  async signIn(email: string, password: string) {
    try {
      console.warn('🔐 [FIREBASE-HYBRID] Sign in attempt for:', email);
      
      if (!this.isInitialized) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          throw new Error('Firebase initialization failed');
        }
      }

      let userCredential;
      
      if (Platform.OS === 'web') {
        console.warn('🌐 [FIREBASE-HYBRID] Web sign in...');
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      } else {
        console.warn('📱 [FIREBASE-HYBRID] Mobile sign in...');
        userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      }

      console.warn('✅ [FIREBASE-HYBRID] Sign in successful!');
      return {
        success: true,
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName
        }
      };
    } catch (error: any) {
      console.warn('💥 [FIREBASE-HYBRID] Sign in failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async signUp(email: string, password: string, displayName?: string) {
    try {
      console.warn('📝 [FIREBASE-HYBRID] Sign up attempt for:', email);
      
      if (!this.isInitialized) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          throw new Error('Firebase initialization failed');
        }
      }

      let userCredential;
      
      if (Platform.OS === 'web') {
        console.warn('🌐 [FIREBASE-HYBRID] Web sign up...');
        const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
        userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
        
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
      } else {
        console.warn('📱 [FIREBASE-HYBRID] Mobile sign up...');
        userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
        
        if (displayName) {
          await userCredential.user.updateProfile({ displayName });
        }
      }

      console.warn('✅ [FIREBASE-HYBRID] Sign up successful!');
      return {
        success: true,
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || displayName
        }
      };
    } catch (error: any) {
      console.warn('💥 [FIREBASE-HYBRID] Sign up failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      console.warn('🚪 [FIREBASE-HYBRID] Sign out attempt...');
      
      if (Platform.OS === 'web') {
        const { signOut } = await import('firebase/auth');
        await signOut(this.auth);
      } else {
        await this.auth.signOut();
      }

      console.warn('✅ [FIREBASE-HYBRID] Sign out successful!');
      return { success: true };
    } catch (error: any) {
      console.warn('💥 [FIREBASE-HYBRID] Sign out failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  getCurrentUser() {
    try {
      const user = this.auth?.currentUser;
      if (user) {
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        };
      }
      return null;
    } catch (error) {
      console.warn('💥 [FIREBASE-HYBRID] Get current user failed:', error);
      return null;
    }
  }

  onAuthStateChanged(callback: (user: any) => void) {
    try {
      if (this.auth) {
        return this.auth.onAuthStateChanged((user: any) => {
          if (user) {
            callback({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName
            });
          } else {
            callback(null);
          }
        });
      }
      return () => {};
    } catch (error) {
      console.warn('💥 [FIREBASE-HYBRID] Auth state listener failed:', error);
      return () => {};
    }
  }
}

export default new FirebaseHybridService();
