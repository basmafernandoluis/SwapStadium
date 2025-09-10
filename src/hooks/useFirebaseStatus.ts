import { useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { AuthService } from '../services/authService';

interface FirebaseStatus {
  auth: boolean;
  firestore: boolean;
  config: boolean;
  errors: string[];
}

export const useFirebaseStatus = () => {
  const [status, setStatus] = useState<FirebaseStatus>({
    auth: false,
    firestore: false,
    config: false,
    errors: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFirebaseStatus = async () => {
      const errors: string[] = [];
      let authStatus = false;
      let firestoreStatus = false;
      let configStatus = false;

      try {
        // Vérifier la configuration
        if (auth && db) {
          configStatus = true;
        } else {
          errors.push('Configuration Firebase manquante');
        }

        // Tester l'authentification
        try {
          await auth.signOut(); // Test simple de l'auth
          authStatus = true;
        } catch (error: any) {
          errors.push(`Auth Error: ${error.message}`);
        }

        // Tester Firestore
        try {
          // Test simple de lecture Firebase v8
          const testCollection = db.collection('test');
          await testCollection.limit(1).get();
          firestoreStatus = true;
        } catch (error: any) {
          if (error.code === 'permission-denied') {
            // C'est normal si les règles de sécurité sont configurées
            firestoreStatus = true;
          } else {
            errors.push(`Firestore Error: ${error.message}`);
          }
        }

      } catch (error: any) {
        errors.push(`Firebase Error: ${error.message}`);
      }

      setStatus({
        auth: authStatus,
        firestore: firestoreStatus,
        config: configStatus,
        errors
      });
      setLoading(false);
    };

    checkFirebaseStatus();
  }, []);

  const testRegistration = async (email: string, password: string, displayName: string) => {
    try {
      await AuthService.signUp(email, password, displayName);
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const testLogin = async (email: string, password: string) => {
    try {
      await AuthService.signIn(email, password);
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    status,
    loading,
    testRegistration,
    testLogin
  };
};
