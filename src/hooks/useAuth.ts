import React, { useState, useEffect, createContext, useContext } from 'react';
import { AuthService } from '../services/authService';

// Harmoniser le type d'utilisateur sur celui d'AuthService (avec uid)
type AuthUser = import('../services/authService').User;

interface AuthContextType {
  user: AuthUser | null;
  // firebaseUser legacy: on garde any pour compatibilité d'API mais on y met le même objet
  firebaseUser: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((u) => {
      // u est déjà de type AuthUser (ou null) via AuthService
      setUser(u);
      setFirebaseUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await AuthService.signIn(email, password);
      if (!res.success || !res.user) {
        throw new Error(res.error || 'Connexion échouée');
      }
      setUser(res.user);
      setFirebaseUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      const res = await AuthService.signUp(email, password, displayName);
      if (!res.success || !res.user) {
        throw new Error(res.error || 'Inscription échouée');
      }
      setUser(res.user);
      setFirebaseUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await AuthService.signOut();
    setUser(null);
    setFirebaseUser(null);
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};
