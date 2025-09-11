import firebase from 'firebase/app';
import { auth } from './firebase';

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

export class AuthService {
  static async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('🔥 AuthService - Début connexion:', { email });
      
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;
      
      if (!firebaseUser) {
        return { success: false, error: 'Erreur lors de la connexion' };
      }
      
      console.log('✅ AuthService - Connexion réussie:', firebaseUser.uid);
      
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
      };
      
      return { success: true, user };
    } catch (error: any) {
      console.error('❌ AuthService - Erreur lors de la connexion:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }
  
  static async signUp(email: string, password: string, displayName?: string): Promise<AuthResult> {
    try {
      console.log('🔥 AuthService - Début inscription:', { email, displayName });
      
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;
      
      if (!firebaseUser) {
        return { success: false, error: 'Erreur lors de la création du compte' };
      }
      
      // Mise à jour du profil si un nom est fourni
      if (displayName) {
        await firebaseUser.updateProfile({ displayName });
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
      await auth.signOut();
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
    return auth.onAuthStateChanged((firebaseUser) => {
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
