import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useGlobalToast } from '../../contexts/ToastContext';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const { t, changeLanguage, locale } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { showSuccess, showError } = useGlobalToast();

  const handleSignOut = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          onPress: async () => {
            try {
              showSuccess('🔄 Déconnexion en cours...');
              await signOut();
              showSuccess('✅ Déconnexion réussie ! À bientôt sur SwapStadium 👋');
            } catch (error: any) {
              console.error('Erreur de déconnexion:', error);
              showError(`❌ Erreur de déconnexion: ${error.message || 'Veuillez réessayer'}`);
            }
          }, 
          style: 'destructive' 
        }
      ]
    );
  };

  // Fonction de déconnexion rapide pour les tests
  const handleQuickSignOut = async () => {
    try {
      showSuccess('🔄 Déconnexion rapide...');
      await signOut();
      showSuccess('✅ Déconnecté ! Vous pouvez maintenant tester avec un autre compte');
    } catch (error: any) {
      console.error('Erreur de déconnexion rapide:', error);
      showError(`❌ Erreur: ${error.message || 'Veuillez réessayer'}`);
    }
  };

  const ProfileItem = ({ icon, title, subtitle, onPress, showArrow = true }: any) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileItemLeft}>
        <Ionicons name={icon} size={24} color="#2196F3" />
        <View style={styles.profileItemTexts}>
          <Text style={styles.profileItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.profileItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && <Ionicons name="chevron-forward" size={20} color="#ccc" />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header du profil */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#2196F3" />
          </View>
          <TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera" size={16} color="white" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.userName}>{user?.displayName}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        
        {/* Indicateur de statut de connexion */}
        <View style={styles.connectionStatus}>
          <Ionicons name="wifi" size={16} color="#4CAF50" />
          <Text style={styles.connectionText}>Connecté</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.rating.toFixed(1) || '0.0'}</Text>
            <Text style={styles.statLabel}>Note</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.totalExchanges || 0}</Text>
            <Text style={styles.statLabel}>Échanges</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.verifiedContainer}>
              <Ionicons 
                name={user?.verified ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={user?.verified ? "#4CAF50" : "#F44336"} 
              />
            </View>
            <Text style={styles.statLabel}>
              {user?.verified ? 'Vérifié' : 'Non vérifié'}
            </Text>
          </View>
        </View>
      </View>

      {/* Options du profil */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mon compte</Text>
        
        <ProfileItem
          icon="person-outline"
          title="Modifier le profil"
          subtitle="Nom, photo, informations"
          onPress={() => navigation.navigate('EditProfile')}
        />
        
        <ProfileItem
          icon="notifications-outline"
          title="Notifications"
          subtitle="Gérer les notifications"
          onPress={() => navigation.navigate('Notifications')}
        />
        
        <ProfileItem
          icon="language"
          title="Langue"
          subtitle={locale === 'fr' ? 'Français' : 'English'}
          onPress={() => changeLanguage(locale === 'fr' ? 'en' : 'fr')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <ProfileItem
          icon="document-text-outline"
          title="Conditions d'utilisation"
          onPress={() => navigation.navigate('Terms')}
        />
        
        <ProfileItem
          icon="help-circle-outline"
          title="Centre d'aide"
          onPress={() => Alert.alert(
            'Guide de test 🧪', 
            '1. Cliquez sur "Déconnexion rapide"\n2. Créez un nouveau compte\n3. Testez les fonctionnalités\n4. Répétez avec d\'autres comptes\n\nCela vous permet de tester les échanges entre utilisateurs !'
          )}
        />
        
        <ProfileItem
          icon="mail-outline"
          title="Nous contacter"
          onPress={() => Alert.alert('Contact', 'support@swapstadium.com')}
        />
      </View>

      {/* Section Déconnexion */}
      <View style={styles.section}>
        <ProfileItem
          icon="flash-outline"
          title="🚀 Déconnexion rapide (Test)"
          subtitle="Pour tester avec d'autres utilisateurs"
          onPress={handleQuickSignOut}
          showArrow={false}
        />
        
        <ProfileItem
          icon="log-out-outline"
          title="Se déconnecter"
          onPress={handleSignOut}
          showArrow={false}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.appVersion}>SwapStadium v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2196F3',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#eee',
  },
  verifiedContainer: {
    marginBottom: 2,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 8,
    marginBottom: 10,
  },
  connectionText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    paddingBottom: 10,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemTexts: {
    marginLeft: 15,
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  profileItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  appVersion: {
    fontSize: 14,
    color: '#999',
  },
});

export default ProfileScreen;
