import firebase from 'firebase/app';
import { auth, db } from './firebase';
import { User } from '../types';

export class AuthService {
  static async signUp(email: string, password: string, displayName: string): Promise<User> {
    try {
      console.log('🔥 AuthService - Début inscription:', { email, displayName });
      
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;
      
      if (!firebaseUser) {
        throw new Error('Erreur lors de la création de l\'utilisateur');
      }
      
      console.log('✅ AuthService - Utilisateur Firebase créé:', firebaseUser.uid);
      
      // Mise à jour du profil Firebase
      await firebaseUser.updateProfile({ displayName });
      console.log('✅ AuthService - Profil Firebase mis à jour');
      
      // Création du document utilisateur dans Firestore
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName,
        verified: false,
        rating: 0,
        totalExchanges: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('users').doc(firebaseUser.uid).set(userData);
      console.log('✅ AuthService - Document Firestore créé:', userData);
      
      return userData;
    } catch (error) {
      console.error('❌ AuthService - Erreur lors de l\'inscription:', error);
      throw error;
    }
  }
  
  static async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;
      
      if (!firebaseUser) {
        throw new Error('Erreur lors de la connexion');
      }
      
      // Récupération des données utilisateur depuis Firestore
      const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
      
      if (userDoc.exists) {
        return userDoc.data() as User;
      } else {
        throw new Error('Données utilisateur non trouvées');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  }
  
  static async signOut(): Promise<void> {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  }
  
  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      await db.collection('users').doc(userId).update({
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }
  
  static async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    
    try {
      const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
      return userDoc.exists ? userDoc.data() as User : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }
  
  static onAuthStateChanged(callback: (user: firebase.User | null) => void) {
    return auth.onAuthStateChanged(callback);
  }
}
