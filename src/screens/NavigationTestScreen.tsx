import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useGlobalToast } from '../contexts/ToastContext';
import { auth } from '../services/firebase';

const NavigationTestScreen = () => {
  const { signIn, signUp, signOut, user } = useAuth();
  const { showSuccess, showError } = useGlobalToast();

  // Génère un email unique pour éviter les conflits
  const generateTestEmail = () => {
    const timestamp = Date.now();
    return `test${timestamp}@test.com`;
  };

  const testSignUp = async () => {
    try {
      const testEmail = generateTestEmail();
      showSuccess('🔄 Test de création de compte...');
      await signUp(testEmail, 'password123', 'Test User');
      showSuccess(`✅ Compte créé avec succès ! (${testEmail})`);
    } catch (error: any) {
      showError(`❌ Erreur création: ${error.message}`);
    }
  };

  const testSignIn = async () => {
    try {
      const testEmail = generateTestEmail();
      showSuccess('🔄 Test de connexion...');
      // D'abord créer le compte, puis se connecter
      await signUp(testEmail, 'password123', 'Test User Login');
      await signIn(testEmail, 'password123');
      showSuccess(`✅ Connexion réussie ! (${testEmail})`);
    } catch (error: any) {
      showError(`❌ Erreur connexion: ${error.message}`);
    }
  };

  const testSignOut = async () => {
    try {
      showSuccess('🔄 Test de déconnexion...');
      await signOut();
      showSuccess('✅ Déconnexion réussie !');
    } catch (error: any) {
      showError(`❌ Erreur déconnexion: ${error.message}`);
    }
  };

  const quickLogin = async () => {
    try {
      showSuccess('🔄 Création d\'un nouveau compte...');
      // Génère toujours un nouveau compte unique
      const timestamp = Date.now();
      const testEmail = `test${timestamp}@swapstadium.com`;
      const testPassword = 'TestPassword123!';
      
      // Crée directement un nouveau compte (plus fiable)
      await signUp(testEmail, testPassword, `Test User ${timestamp}`);
      showSuccess(`✅ Compte créé et connecté ! (${testEmail})`);
      
    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      showError(`❌ Erreur: ${error.code || error.message}`);
      
      // Si c'est un problème de réseau, suggérer de vérifier la connexion
      if (error.code === 'auth/network-request-failed') {
        showError('🌐 Vérifiez votre connexion internet');
      }
    }
  };

  const debugAuth = () => {
    console.log('🔍 Debug Auth State:', {
      user: user,
      userEmail: user?.email,
      userId: user?.id,
      userDisplayName: user?.displayName,
    });
    
    showSuccess(`🔍 Debug: User = ${user ? 'Connected' : 'Disconnected'}`);
    if (user) {
      showSuccess(`📧 Email: ${user.email}`);
    }
  };

  const testFirebaseConnection = async () => {
    try {
      showSuccess('🔄 Test de connexion Firebase...');
      
      console.log('Firebase auth initialized:', !!auth);
      showSuccess(`🔥 Firebase: ${auth ? 'Connecté' : 'Erreur'}`);
      showSuccess(`🌐 Projet: swapstadium`);
      
    } catch (error: any) {
      console.error('Erreur Firebase:', error);
      showError(`❌ Firebase Error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Test Navigation & Auth</Text>
      
      <Text style={styles.status}>
        État utilisateur: {user ? `✅ Connecté (${user.email})` : '❌ Déconnecté'}
      </Text>

      <TouchableOpacity style={styles.button} onPress={testSignUp}>
        <Text style={styles.buttonText}>Test Inscription</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#4CAF50' }]} onPress={quickLogin}>
        <Text style={styles.buttonText}>⚡ Connexion Rapide</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testSignIn}>
        <Text style={styles.buttonText}>Test Connexion</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#FF9800' }]} onPress={debugAuth}>
        <Text style={styles.buttonText}>🔍 Debug État Auth</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#9C27B0' }]} onPress={testFirebaseConnection}>
        <Text style={styles.buttonText}>🔥 Test Firebase</Text>
      </TouchableOpacity>

      {user && (
        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={testSignOut}>
          <Text style={styles.buttonText}>Test Déconnexion</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  status: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NavigationTestScreen;
