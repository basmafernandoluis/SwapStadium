import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import firebaseHybrid from './firebaseHybrid';

// Import des nouveaux écrans billets
import TicketListScreen from './src/screens/tickets/TicketListScreen';
import TicketAddScreen from './src/screens/tickets/TicketAddScreen';

console.warn('🚀 [APP-HYBRID] Starting SwapStadium with Firebase Hybrid...');

function HomeScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  console.warn('🏠 [APP-HYBRID] HomeScreen rendered');

  useEffect(() => {
    console.warn('🏠 [APP-HYBRID] Setting up auth listener...');
    
    const initAuth = async () => {
      try {
        // Initialiser Firebase
        await firebaseHybrid.initialize();
        
        // Écouter les changements d'état d'authentification
        const unsubscribe = firebaseHybrid.onAuthStateChanged((user) => {
          console.warn('🏠 [APP-HYBRID] Auth state changed:', user ? 'logged in' : 'logged out');
          setUser(user);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.warn('💥 [APP-HYBRID] Auth setup failed:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🔄 Chargement...</Text>
        <Text style={styles.subtitle}>Platform: {Platform.OS}</Text>
      </View>
    );
  }

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>✅ SwapStadium</Text>
        <Text style={styles.subtitle}>Bienvenue {user.displayName || user.email}</Text>
        <Text style={styles.subtitle}>Platform: {Platform.OS}</Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            console.warn('🎫 [APP-HYBRID] Navigation to Tickets');
            navigation.navigate('TicketList');
          }}
        >
          <Text style={styles.buttonText}>🎫 Voir les Billets</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => {
            console.warn('🎫 [APP-HYBRID] Navigation to Add Ticket');
            navigation.navigate('TicketAdd');
          }}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>➕ Ajouter un Billet</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={async () => {
            console.warn('🚪 [APP-HYBRID] Logout attempt');
            const result = await firebaseHybrid.signOut();
            if (result.success) {
              Alert.alert('Succès', 'Déconnexion réussie');
            }
          }}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Se Déconnecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 SwapStadium</Text>
      <Text style={styles.subtitle}>Échange de billets entre supporters</Text>
      <Text style={styles.subtitle}>Platform: {Platform.OS}</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => {
          console.warn('🏠 [APP-HYBRID] Navigation to Login');
          navigation.navigate('Login');
        }}
      >
        <Text style={styles.buttonText}>Se Connecter</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]}
        onPress={() => {
          console.warn('🏠 [APP-HYBRID] Navigation to Signup');
          navigation.navigate('Signup');
        }}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>S'Inscrire</Text>
      </TouchableOpacity>
    </View>
  );
}

function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  console.warn('🔐 [APP-HYBRID] LoginScreen rendered');

  const handleLogin = async () => {
    console.warn('🔐 [APP-HYBRID] Login attempt for:', email);
    setLoading(true);
    
    try {
      const result = await firebaseHybrid.signIn(email, password);
      console.warn('🔐 [APP-HYBRID] Login result:', result.success ? 'SUCCESS' : 'FAILED');
      
      if (result.success) {
        Alert.alert('Succès', 'Connexion réussie!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Erreur', result.error || 'Erreur de connexion');
      }
    } catch (error) {
      console.warn('💥 [APP-HYBRID] Login error:', error);
      Alert.alert('Erreur', 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Connexion</Text>
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
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Connexion...' : 'Se Connecter'}
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

function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    console.warn('📝 [APP-HYBRID] Signup attempt for:', email);
    setLoading(true);
    
    try {
      const result = await firebaseHybrid.signUp(email, password, displayName);
      console.warn('📝 [APP-HYBRID] Signup result:', result.success ? 'SUCCESS' : 'FAILED');
      
      if (result.success) {
        Alert.alert('Succès', 'Inscription réussie!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Erreur', result.error || 'Erreur d\'inscription');
      }
    } catch (error) {
      console.warn('💥 [APP-HYBRID] Signup error:', error);
      Alert.alert('Erreur', 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 Inscription</Text>
      <Text style={styles.subtitle}>Platform: {Platform.OS}</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nom d'affichage"
          value={displayName}
          onChangeText={setDisplayName}
        />
        
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
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Inscription...' : 'S\'Inscrire'}
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

export default function HybridApp() {
  console.warn('🚀 [APP-HYBRID] HybridApp component rendered');
  
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'SwapStadium' }}
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ title: 'Connexion' }}
          />
          <Stack.Screen 
            name="Signup" 
            component={SignupScreen} 
            options={{ title: 'Inscription' }}
          />
          <Stack.Screen 
            name="TicketList" 
            component={TicketListScreen} 
            options={{ title: 'Billets Disponibles' }}
          />
          <Stack.Screen 
            name="TicketAdd" 
            component={TicketAddScreen} 
            options={{ title: 'Ajouter un Billet' }}
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
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#1e40af',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#1e40af',
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
