import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { useGlobalToast } from '../../contexts/ToastContext';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation();
  const { signUp } = useAuth();
  const { t } = useTranslation();
  const { showSuccess, showError } = useGlobalToast();

  const validateForm = () => {
    console.log('🔍 Validation du formulaire:', {
      email,
      password: password ? '***' : 'vide',
      confirmPassword: confirmPassword ? '***' : 'vide',
      displayName,
      acceptTerms
    });

    if (!email || !password || !confirmPassword || !displayName) {
      const message = 'Veuillez remplir tous les champs';
      showError(message);
      console.log('❌ Validation échouée: champs manquants');
      return false;
    }

    if (!email.includes('@')) {
      const message = 'Adresse email invalide';
      showError(message);
      console.log('❌ Validation échouée: email invalide');
      return false;
    }

    if (password.length < 6) {
      const message = 'Le mot de passe doit contenir au moins 6 caractères';
      showError(message);
      console.log('❌ Validation échouée: mot de passe trop court');
      return false;
    }

    if (password !== confirmPassword) {
      const message = 'Les mots de passe ne correspondent pas';
      showError(message);
      console.log('❌ Validation échouée: mots de passe différents');
      return false;
    }

    if (!acceptTerms) {
      const message = 'Vous devez accepter les conditions d\'utilisation';
      showError(message);
      console.log('❌ Validation échouée: conditions non acceptées');
      return false;
    }

    console.log('✅ Validation réussie');
    return true;
  };

  const handleRegister = async () => {
    console.log('🚀 Tentative d\'inscription démarrée');
    
    if (!validateForm()) {
      console.log('❌ Validation du formulaire échouée');
      return;
    }

    try {
      console.log('🔄 Début de la création du compte...');
      setLoading(true);
      
      const result = await signUp(email, password, displayName);
      console.log('✅ Compte créé avec succès:', result);
      
      // Toast de succès détaillé
      showSuccess(`🎉 Bienvenue ${displayName} !\n\nVotre compte SwapStadium a été créé avec succès. Vous pouvez maintenant:\n• Publier vos billets d'échange\n• Rechercher des billets\n• Échanger avec d'autres supporters`);
      
      // Petite pause pour laisser voir le toast avant redirection
      setTimeout(() => {
        // Réinitialiser le formulaire
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setDisplayName('');
        setAcceptTerms(false);
      }, 1000);
      
    } catch (error: any) {
      console.error('Erreur d\'inscription détaillée:', error);
      let errorMessage = 'Une erreur est survenue lors de la création du compte.';
      
      // Messages d'erreur personnalisés
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cette adresse email est déjà utilisée. Essayez de vous connecter.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe est trop faible. Utilisez au moins 6 caractères.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'L\'adresse email n\'est pas valide.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'La création de compte n\'est pas activée. Contactez le support.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Réessayez plus tard.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="person-add" size={60} color="#2196F3" />
          <Text style={styles.title}>{t('auth.createAccount')}</Text>
          <Text style={styles.subtitle}>Rejoignez la communauté SwapStadium</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.displayName')}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder={t('auth.confirmPassword')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setAcceptTerms(!acceptTerms)}
          >
            <Ionicons 
              name={acceptTerms ? "checkbox" : "checkbox-outline"} 
              size={20} 
              color="#2196F3" 
            />
            <Text style={styles.termsText}>
              {t('terms.accept')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Terms' as never)}
          >
            <Text style={styles.linkText}>{t('terms.title')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.disabledButton]}
            onPress={() => {
              console.log('🖱️ Bouton inscription cliqué !');
              showSuccess('🖱️ Bouton cliqué !');
              handleRegister();
            }}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? t('common.loading') : t('auth.signUp')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login' as never)}
          >
            <Text style={styles.linkText}>
              {t('auth.alreadyHaveAccount')} <Text style={styles.linkTextBold}>{t('auth.signIn')}</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Avertissements de sécurité */}
        <View style={styles.warningsContainer}>
          <View style={styles.warningBox}>
            <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
            <Text style={styles.warningText}>
              {t('warnings.meetInPublic')}
            </Text>
          </View>
          <View style={[styles.warningBox, { marginTop: 10 }]}>
            <Ionicons name="eye" size={20} color="#2196F3" />
            <Text style={styles.warningText}>
              {t('warnings.verifyTickets')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  termsText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  registerButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 15,
  },
  linkText: {
    color: '#666',
    fontSize: 14,
  },
  linkTextBold: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  warningsContainer: {
    marginTop: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  warningText: {
    flex: 1,
    marginLeft: 10,
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default RegisterScreen;
