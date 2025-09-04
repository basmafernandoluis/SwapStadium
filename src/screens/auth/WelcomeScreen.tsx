import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const features = [
    {
      icon: 'ticket-outline',
      title: 'Publiez vos billets',
      description: 'Proposez vos billets en échange ou en don',
    },
    {
      icon: 'search-outline',
      title: 'Trouvez des billets',
      description: 'Recherchez des billets par match ou stade',
    },
    {
      icon: 'people-outline',
      title: 'Échangez en sécurité',
      description: 'Communiquez avec d\'autres supporters',
    },
    {
      icon: 'star-outline',
      title: 'Système de notation',
      description: 'Évaluez vos expériences d\'échange',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
        <Text style={styles.title}>Bienvenue {user?.displayName} ! 🎉</Text>
        <Text style={styles.subtitle}>
          Votre compte SwapStadium a été créé avec succès
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏟️ Que pouvez-vous faire maintenant ?</Text>
        
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons 
                name={feature.icon as keyof typeof Ionicons.glyphMap} 
                size={24} 
                color="#2196F3" 
              />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ Rappels de sécurité</Text>
        
        <View style={styles.safetyItem}>
          <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
          <Text style={styles.safetyText}>
            Rencontrez-vous toujours dans des lieux publics
          </Text>
        </View>
        
        <View style={styles.safetyItem}>
          <Ionicons name="eye" size={20} color="#2196F3" />
          <Text style={styles.safetyText}>
            Vérifiez l'authenticité des billets
          </Text>
        </View>
        
        <View style={styles.safetyItem}>
          <Ionicons name="close-circle" size={20} color="#F44336" />
          <Text style={styles.safetyText}>
            Aucune transaction financière autorisée
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Main' as never)}
        >
          <Text style={styles.primaryButtonText}>
            Commencer à explorer 🚀
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('AddTicket' as never)}
        >
          <Text style={styles.secondaryButtonText}>
            Publier mon premier billet
          </Text>
        </TouchableOpacity>
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
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
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
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  safetyText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  actions: {
    marginTop: 20,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;
