import 'react-native-gesture-handler';
console.log('📱 [DEBUG] App import started - react-native-gesture-handler imported');

import React, { useState, useEffect } from 'react';
console.log('📱 [DEBUG] React imports loaded');

import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
console.log('📱 [DEBUG] React Native components imported');

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
console.log('📱 [DEBUG] Navigation components imported');

console.log('📱 [DEBUG] About to import AuthService from firebaseUniversal...');
import { AuthService, User } from './src/services/firebaseUniversal';
console.log('📱 [DEBUG] AuthService imported successfully!');

// Écran d'accueil avec gestion d'erreur robuste
function HomeScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🏠 [DEBUG] HomeScreen useEffect started');
    // METRO LOG pour mobile
    if (Platform.OS !== 'web') {
      console.warn(`🏠 [METRO] HomeScreen starting on ${Platform.OS}`);
    }
    
    let unsubscribe: (() => void) | undefined;
    
    try {
      console.log('🏠 [DEBUG] Setting up auth state listener...');
      console.log('🏠 [DEBUG] AuthService available:', !!AuthService);
      console.log('🏠 [DEBUG] AuthService.onAuthStateChanged available:', !!AuthService.onAuthStateChanged);
      
      // METRO LOG pour mobile - AVANT AUTH LISTENER
      if (Platform.OS !== 'web') {
        console.warn(`🏠 [METRO] Setting up auth listener on ${Platform.OS}`);
      }
      
      // Écouter les changements d'état d'authentification
      unsubscribe = AuthService.onAuthStateChanged((authUser) => {
        console.log('🏠 [DEBUG] Auth state changed:', authUser ? 'User logged in' : 'User logged out');
        // METRO LOG pour mobile - AUTH STATE CHANGE
        if (Platform.OS !== 'web') {
          console.warn(`🏠 [METRO] Auth state changed on ${Platform.OS}:`, authUser ? 'LOGGED IN' : 'LOGGED OUT');
        }
        setUser(authUser);
        setLoading(false);
        setError(null);
      });
      
      console.log('🏠 [DEBUG] Auth state listener set up successfully');
      // METRO LOG pour mobile - AUTH LISTENER OK
      if (Platform.OS !== 'web') {
        console.warn(`✅ [METRO] Auth listener ready on ${Platform.OS}`);
      }
    } catch (err: any) {
      console.error('🏠 [DEBUG] Error setting up auth listener:', err);
      console.error('🏠 [DEBUG] Error details:', {
        name: err?.name,
        message: err?.message,
        code: err?.code
      });
      // METRO LOG pour mobile - ERREUR LISTENER
      if (Platform.OS !== 'web') {
        console.warn(`🚨 [METRO] AUTH LISTENER ERROR on ${Platform.OS}:`, err?.message || err);
      }
      setError('Erreur lors de l\'initialisation de l\'authentification');
      setLoading(false);
    }

    return () => {
      console.log('🏠 [DEBUG] HomeScreen useEffect cleanup');
      if (Platform.OS !== 'web') {
        console.warn(`🏠 [METRO] Cleanup on ${Platform.OS}`);
      }
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const result = await AuthService.signOut();
      if (!result.success) {
        Alert.alert('Erreur', result.error || 'Erreur lors de la déconnexion');
      }
    } catch (err) {
      console.error('Sign out error:', err);
      Alert.alert('Erreur', 'Erreur lors de la déconnexion');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={styles.loadingText}>Initialisation Firebase...</Text>
        <Text style={styles.platformText}>Platform: {Platform.OS}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <TouchableOpacity 
          style={[styles.button, styles.retryButton]}
          onPress={() => {
            setError(null);
            setLoading(true);
            // Relancer l'initialisation
            setTimeout(() => setLoading(false), 2000);
          }}
        >
          <Text style={styles.buttonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SwapStadium</Text>
      <Text style={styles.subtitle}>Échange de billets de sport</Text>
      <Text style={styles.platformText}>Mode: {Platform.OS}</Text>
      
      {user ? (
        <View style={styles.userSection}>
          <Text style={styles.welcomeText}>✅ Bienvenue !</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {user.displayName && (
            <Text style={styles.userName}>{user.displayName}</Text>
          )}
          
          <TouchableOpacity 
            style={[styles.button, styles.signOutButton]}
            onPress={handleSignOut}
          >
            <Text style={styles.buttonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.authSection}>
          <Text style={styles.status}>🔥 Firebase v10 Universal (Web + Mobile)</Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Écran de connexion avec gestion d'erreur améliorée
function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState('Test User');

  const handleAuth = async () => {
    console.log('🔑 [DEBUG] handleAuth called:', { email, isSignUp, platform: Platform.OS });
    
    if (!email || !password) {
      console.log('🔑 [DEBUG] Missing email or password');
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (isSignUp && !displayName) {
      console.log('🔑 [DEBUG] Missing displayName for signup');
      Alert.alert('Erreur', 'Veuillez entrer votre nom');
      return;
    }

    console.log('🔑 [DEBUG] Starting authentication process...');
    setLoading(true);

    try {
      console.log('🔑 [DEBUG] AuthService available:', !!AuthService);
      
      let result;
      if (isSignUp) {
        console.log('🔑 [DEBUG] Calling AuthService.signUp...');
        result = await AuthService.signUp(email, password, displayName);
      } else {
        console.log('🔑 [DEBUG] Calling AuthService.signIn...');
        result = await AuthService.signIn(email, password);
      }
      
      console.log('🔑 [DEBUG] Auth result:', result);

      if (result.success) {
        console.log('🔑 [DEBUG] Authentication successful!');
        Alert.alert(
          'Succès', 
          isSignUp ? 'Compte créé avec succès !' : 'Connexion réussie !',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        console.log('🔑 [DEBUG] Authentication failed:', result.error);
        Alert.alert('Erreur d\'authentification', result.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      console.error('🔑 [DEBUG] Auth error caught:', error);
      console.error('🔑 [DEBUG] Error details:', {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        stack: error?.stack
      });
      Alert.alert('Erreur', 'Une erreur réseau est survenue. Vérifiez votre connexion.');
    } finally {
      console.log('🔑 [DEBUG] Auth process completed, setting loading to false');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isSignUp ? 'Inscription' : 'Connexion'}
      </Text>
      <Text style={styles.subtitle}>SwapStadium Firebase v10</Text>
      <Text style={styles.platformText}>Platform: {Platform.OS}</Text>

      <View style={styles.formContainer}>
        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder="Nom complet"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />
        )}
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {isSignUp ? 'S\'inscrire' : 'Se connecter'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.switchButton}
          onPress={() => setIsSignUp(!isSignUp)}
        >
          <Text style={styles.switchButtonText}>
            {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
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

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Accueil SwapStadium' }}
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ title: 'Connexion' }}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e40af',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  platformText: {
    fontSize: 12,
    color: '#059669',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  userSection: {
    alignItems: 'center',
    width: '100%',
  },
  authSection: {
    alignItems: 'center',
    width: '100%',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 10,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 20,
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
  signOutButton: {
    backgroundColor: '#dc2626',
  },
  retryButton: {
    backgroundColor: '#059669',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 20,
    padding: 10,
  },
  switchButtonText: {
    color: '#1e40af',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  backButton: {
    marginTop: 10,
    padding: 10,
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
  },
});
