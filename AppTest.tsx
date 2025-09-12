import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

console.warn('🧪 [TEST-APP] Starting test app without Firebase...');

// Mock Auth Service sans Firebase
class MockAuthService {
  static async signIn(email: string, password: string) {
    console.warn('🧪 [TEST-APP] Mock signIn called');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simule async
    return { success: true, user: { uid: 'test123', email } };
  }
  
  static async signUp(email: string, password: string, displayName?: string) {
    console.warn('🧪 [TEST-APP] Mock signUp called');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simule async
    return { success: true, user: { uid: 'test456', email, displayName } };
  }
}

// Écran d'accueil de test
function HomeScreen({ navigation }: any) {
  console.warn('🧪 [TEST-APP] HomeScreen rendered');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SwapStadium - Test Sans Firebase</Text>
      <Text style={styles.subtitle}>✅ App fonctionne sur {Platform.OS}</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => {
          console.warn('🧪 [TEST-APP] Navigation to Login');
          navigation.navigate('Login');
        }}
      >
        <Text style={styles.buttonText}>Test Connexion</Text>
      </TouchableOpacity>
    </View>
  );
}

// Écran de connexion de test
function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    console.warn('🧪 [TEST-APP] Mock auth started');
    setLoading(true);
    
    try {
      const result = await MockAuthService.signIn(email, password);
      console.warn('🧪 [TEST-APP] Mock auth success:', result);
      
      Alert.alert(
        'Test Réussi!', 
        'L\'app fonctionne sans Firebase',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.warn('🧪 [TEST-APP] Mock auth error:', error);
      Alert.alert('Erreur Test', 'Erreur dans le test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Authentification</Text>
      <Text style={styles.subtitle}>Platform: {Platform.OS}</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Test en cours...' : 'Tester Sans Firebase'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const Stack = createStackNavigator();

export default function TestApp() {
  console.warn('🧪 [TEST-APP] TestApp component rendered');
  
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Test SwapStadium' }}
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ title: 'Test Connexion' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e40af',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#059669',
    marginBottom: 30,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
  },
});
