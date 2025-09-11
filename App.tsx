import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/hooks/useAuth';
import { ToastProvider } from './src/contexts/ToastContext';
import { ErrorProvider } from './src/contexts/ErrorContext';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthService, User } from './src/services/authService';
import TicketListScreen from './src/screens/tickets/TicketListScreen';
import TicketAddScreen from './src/screens/tickets/TicketAddScreen';
import TicketDetailsScreen from './src/screens/tickets/TicketDetailsScreen';

// Écran d'accueil avec état d'authentification
function HomeScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const unsubscribe = AuthService.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return unsubscribe; // Nettoyer l'écouteur au démontage
  }, []);

  const handleSignOut = async () => {
    const result = await AuthService.signOut();
    if (!result.success) {
      Alert.alert('Erreur', result.error || 'Erreur lors de la déconnexion');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SwapStadium</Text>
      <Text style={styles.subtitle}>Échange de billets de sport</Text>
      
      {user ? (
        <View style={styles.userSection}>
          <Text style={styles.welcomeText}>Bienvenue !</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {user.displayName && (
            <Text style={styles.userName}>{user.displayName}</Text>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={() => navigation.navigate('TicketList')}
            >
              <Text style={styles.buttonText}>Mes Tickets</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate('TicketAdd')}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Créer un Ticket</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.signOutButton]}
              onPress={handleSignOut}
            >
              <Text style={styles.buttonText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.authSection}>
          <Text style={styles.status}>✅ Authentification Firebase intégrée</Text>
          
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

// Écran de connexion avec formulaire Firebase
function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState('');

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (isSignUp && !displayName) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom');
      return;
    }

    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await AuthService.signUp(email, password, displayName);
      } else {
        result = await AuthService.signIn(email, password);
      }

      if (result.success) {
        Alert.alert(
          'Succès', 
          isSignUp ? 'Compte créé avec succès !' : 'Connexion réussie !',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Erreur', result.error || 'Erreur d\'authentification');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isSignUp ? 'Inscription' : 'Connexion'}
      </Text>
      <Text style={styles.subtitle}>SwapStadium</Text>

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
      <ErrorProvider>
      <AuthProvider>
        <ToastProvider>
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
          <Stack.Screen 
            name="TicketList" 
            component={TicketListScreen} 
            options={{ title: 'Mes Tickets' }}
          />
          <Stack.Screen 
            name="TicketAdd" 
            component={TicketAddScreen} 
            options={{ title: 'Nouveau Ticket', headerShown: false }}
          />
          <Stack.Screen
            name="TicketDetails"
            component={TicketDetailsScreen}
            options={{ title: 'Détails du Ticket' }}
          />
        </Stack.Navigator>
  </NavigationContainer>
  </ToastProvider>
      </AuthProvider>
      </ErrorProvider>
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
    marginBottom: 20,
  },
  status: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
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
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  signOutButton: {
    backgroundColor: '#dc2626',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
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
