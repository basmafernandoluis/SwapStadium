import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFirebaseStatus } from '../hooks/useFirebaseStatus';
import { useNavigation } from '@react-navigation/native';

const FirebaseTestScreen = () => {
  const { status, loading, testRegistration, testLogin } = useFirebaseStatus();
  const navigation = useNavigation();
  const [testEmail, setTestEmail] = useState('test@swapstadium.com');
  const [testPassword, setTestPassword] = useState('test123456');
  const [testName, setTestName] = useState('Test User');
  const [testLoading, setTestLoading] = useState(false);

  const handleTestRegistration = async () => {
    setTestLoading(true);
    try {
      const result = await testRegistration(testEmail, testPassword, testName);
      if (result.success) {
        Alert.alert('✅ Succès', 'Inscription réussie !');
      } else {
        Alert.alert('❌ Erreur', result.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      Alert.alert('❌ Erreur', error.message);
    } finally {
      setTestLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setTestLoading(true);
    try {
      const result = await testLogin(testEmail, testPassword);
      if (result.success) {
        Alert.alert('✅ Succès', 'Connexion réussie !');
      } else {
        Alert.alert('❌ Erreur', result.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      Alert.alert('❌ Erreur', error.message);
    } finally {
      setTestLoading(false);
    }
  };

  const getStatusIcon = (isWorking: boolean) => {
    return isWorking ? '✅' : '❌';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Test de Firebase en cours...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="analytics" size={60} color="#2196F3" />
        <Text style={styles.title}>Diagnostic Firebase</Text>
        <Text style={styles.subtitle}>Test de la configuration SwapStadium</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 État des services</Text>
        
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>
            {getStatusIcon(status.config)} Configuration Firebase
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>
            {getStatusIcon(status.auth)} Firebase Authentication
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>
            {getStatusIcon(status.firestore)} Cloud Firestore
          </Text>
        </View>
      </View>

      {status.errors.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Erreurs détectées</Text>
          {status.errors.map((error, index) => (
            <View key={index} style={styles.errorItem}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 Test d'inscription</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nom d'affichage</Text>
          <TextInput
            style={styles.input}
            value={testName}
            onChangeText={setTestName}
            placeholder="Nom d'affichage"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={testEmail}
            onChangeText={setTestEmail}
            placeholder="Email de test"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            value={testPassword}
            onChangeText={setTestPassword}
            placeholder="Mot de passe de test"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.testButton, testLoading && styles.disabledButton]}
          onPress={handleTestRegistration}
          disabled={testLoading}
        >
          <Text style={styles.testButtonText}>
            {testLoading ? 'Test en cours...' : 'Tester l\'inscription'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, styles.secondaryButton, testLoading && styles.disabledButton]}
          onPress={handleTestLogin}
          disabled={testLoading}
        >
          <Text style={[styles.testButtonText, styles.secondaryButtonText]}>
            {testLoading ? 'Test en cours...' : 'Tester la connexion'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, styles.specialButton]}
          onPress={() => navigation.navigate('SignupTest' as never)}
        >
          <Text style={styles.testButtonText}>
            🧪 Test complet d'inscription
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Conseils de dépannage</Text>
        
        <View style={styles.tipItem}>
          <Text style={styles.tipText}>
            • Vérifiez que Firebase Authentication est activé dans la console
          </Text>
        </View>
        
        <View style={styles.tipItem}>
          <Text style={styles.tipText}>
            • Assurez-vous que l'authentification Email/Password est configurée
          </Text>
        </View>
        
        <View style={styles.tipItem}>
          <Text style={styles.tipText}>
            • Vérifiez les clés de configuration dans firebase.ts
          </Text>
        </View>
        
        <View style={styles.tipItem}>
          <Text style={styles.tipText}>
            • Consultez FIREBASE_PREREQUISITES.md pour la configuration complète
          </Text>
        </View>
      </View>
    </ScrollView>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statusItem: {
    paddingVertical: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
  },
  errorItem: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  testButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  disabledButton: {
    opacity: 0.6,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#2196F3',
  },
  specialButton: {
    backgroundColor: '#FF9800',
  },
  tipItem: {
    paddingVertical: 5,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default FirebaseTestScreen;
