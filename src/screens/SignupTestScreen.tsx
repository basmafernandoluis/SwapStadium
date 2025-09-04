import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../services/authService';
import { auth, db } from '../services/firebase';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  duration?: number;
}

const SignupTestScreen = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'completed'>('idle');

  const testData = {
    email: `test-${Date.now()}@swapstadium.com`,
    password: 'test123456',
    displayName: 'Test User',
  };

  const addTestResult = (result: TestResult) => {
    setTests(prev => [...prev, result]);
  };

  const updateLastTest = (updates: Partial<TestResult>) => {
    setTests(prev => {
      const newTests = [...prev];
      if (newTests.length > 0) {
        newTests[newTests.length - 1] = { ...newTests[newTests.length - 1], ...updates };
      }
      return newTests;
    });
  };

  const testFirebaseConnection = async (): Promise<boolean> => {
    const startTime = Date.now();
    addTestResult({
      name: 'Connexion Firebase',
      status: 'pending',
      message: 'Test de la configuration Firebase...',
    });

    try {
      if (!auth || !db) {
        throw new Error('Services Firebase non initialisés');
      }

      // Test simple de l'auth
      await auth.signOut();
      
      const duration = Date.now() - startTime;
      updateLastTest({
        status: 'success',
        message: 'Configuration Firebase OK',
        duration,
      });
      return true;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateLastTest({
        status: 'error',
        message: `Erreur Firebase: ${error.message}`,
        duration,
      });
      return false;
    }
  };

  const testSignup = async (): Promise<boolean> => {
    const startTime = Date.now();
    addTestResult({
      name: 'Inscription utilisateur',
      status: 'pending',
      message: `Test inscription avec ${testData.email}...`,
    });

    try {
      const userData = await AuthService.signUp(
        testData.email,
        testData.password,
        testData.displayName
      );

      const duration = Date.now() - startTime;
      updateLastTest({
        status: 'success',
        message: `Inscription réussie - ID: ${userData.id}`,
        duration,
      });
      return true;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      let errorMessage = error.message;
      
      // Messages d'erreur détaillés
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email déjà utilisé (normal si test précédent)';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Authentification Email/Password non activée dans Firebase';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Mot de passe trop faible';
      }
      
      updateLastTest({
        status: 'error',
        message: errorMessage,
        duration,
      });
      return false;
    }
  };

  const testSignin = async (): Promise<boolean> => {
    const startTime = Date.now();
    addTestResult({
      name: 'Connexion utilisateur',
      status: 'pending',
      message: 'Test connexion avec le compte créé...',
    });

    try {
      const userData = await AuthService.signIn(testData.email, testData.password);
      
      const duration = Date.now() - startTime;
      updateLastTest({
        status: 'success',
        message: `Connexion réussie - Utilisateur: ${userData.displayName}`,
        duration,
      });
      return true;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateLastTest({
        status: 'error',
        message: `Erreur connexion: ${error.message}`,
        duration,
      });
      return false;
    }
  };

  const testCleanup = async (): Promise<boolean> => {
    const startTime = Date.now();
    addTestResult({
      name: 'Nettoyage',
      status: 'pending',
      message: 'Déconnexion du compte test...',
    });

    try {
      await AuthService.signOut();
      
      const duration = Date.now() - startTime;
      updateLastTest({
        status: 'success',
        message: 'Déconnexion réussie',
        duration,
      });
      return true;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateLastTest({
        status: 'error',
        message: `Erreur déconnexion: ${error.message}`,
        duration,
      });
      return false;
    }
  };

  const runFullTest = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    setTests([]);

    const results = [];
    
    // Test 1: Connexion Firebase
    results.push(await testFirebaseConnection());
    
    // Test 2: Inscription (si Firebase OK)
    if (results[0]) {
      results.push(await testSignup());
    }
    
    // Test 3: Connexion (si inscription OK)
    if (results[1]) {
      results.push(await testSignin());
    }
    
    // Test 4: Nettoyage
    results.push(await testCleanup());

    const allSuccessful = results.every(Boolean);
    setOverallStatus('completed');
    setIsRunning(false);

    // Résumé final
    setTimeout(() => {
      Alert.alert(
        allSuccessful ? '✅ Tests réussis' : '❌ Tests échoués',
        allSuccessful 
          ? 'Toutes les fonctionnalités d\'inscription fonctionnent correctement !'
          : 'Certains tests ont échoué. Vérifiez la configuration Firebase.',
        [{ text: 'OK' }]
      );
    }, 500);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <ActivityIndicator size="small" color="#2196F3" />;
      case 'success':
        return <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />;
      case 'error':
        return <Ionicons name="close-circle" size={20} color="#F44336" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return '#2196F3';
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flask" size={60} color="#2196F3" />
        <Text style={styles.title}>Test d'inscription SwapStadium</Text>
        <Text style={styles.subtitle}>Validation complète du processus d'inscription</Text>
      </View>

      <View style={styles.testInfo}>
        <Text style={styles.testInfoTitle}>Données de test :</Text>
        <Text style={styles.testInfoText}>• Email: {testData.email}</Text>
        <Text style={styles.testInfoText}>• Nom: {testData.displayName}</Text>
        <Text style={styles.testInfoText}>• Mot de passe: {testData.password}</Text>
      </View>

      <TouchableOpacity
        style={[styles.runButton, isRunning && styles.disabledButton]}
        onPress={runFullTest}
        disabled={isRunning}
      >
        <Text style={styles.runButtonText}>
          {isRunning ? 'Tests en cours...' : 'Lancer les tests'}
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Résultats des tests :</Text>
        
        {tests.map((test, index) => (
          <View key={index} style={styles.testItem}>
            <View style={styles.testHeader}>
              <View style={styles.testStatus}>
                {getStatusIcon(test.status)}
                <Text style={[styles.testName, { color: getStatusColor(test.status) }]}>
                  {test.name}
                </Text>
              </View>
              {test.duration && (
                <Text style={styles.testDuration}>{test.duration}ms</Text>
              )}
            </View>
            <Text style={styles.testMessage}>{test.message}</Text>
          </View>
        ))}

        {tests.length === 0 && !isRunning && (
          <View style={styles.emptyState}>
            <Ionicons name="play-circle-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>Appuyez sur "Lancer les tests" pour commencer</Text>
          </View>
        )}
      </ScrollView>

      {overallStatus === 'completed' && (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>
            {tests.every(t => t.status === 'success') ? '🎉 Tous les tests réussis !' : '⚠️ Certains tests ont échoué'}
          </Text>
          <Text style={styles.summaryText}>
            {tests.filter(t => t.status === 'success').length} / {tests.length} tests réussis
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  testInfo: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  testInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  testInfoText: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 2,
  },
  runButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  runButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  testItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  testStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  testDuration: {
    fontSize: 12,
    color: '#666',
  },
  testMessage: {
    fontSize: 14,
    color: '#666',
    marginLeft: 28,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 10,
    textAlign: 'center',
  },
  summary: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
});

export default SignupTestScreen;
