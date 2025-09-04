import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../hooks/useTranslation';

const TermsScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="document-text" size={60} color="#2196F3" />
          <Text style={styles.title}>{t('terms.title')}</Text>
          <Text style={styles.lastUpdated}>
            {t('terms.lastUpdated')}: 3 septembre 2025
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Objet de la plateforme</Text>
          <Text style={styles.text}>
            SwapStadium est une plateforme communautaire permettant l'échange gratuit 
            de billets de football entre utilisateurs. Aucune transaction financière 
            n'est autorisée sur la plateforme.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Responsabilités des utilisateurs</Text>
          <Text style={styles.text}>
            Les utilisateurs s'engagent à :
            {'\n'}• Fournir des informations exactes sur leurs billets
            {'\n'}• Respecter les autres utilisateurs
            {'\n'}• Ne pas utiliser la plateforme à des fins commerciales
            {'\n'}• Vérifier l'authenticité des billets avant tout échange
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Limitation de responsabilité</Text>
          <Text style={styles.text}>
            SwapStadium n'est pas responsable :
            {'\n'}• De l'authenticité des billets échangés
            {'\n'}• Des problèmes survenus lors des rencontres physiques
            {'\n'}• Des annulations de matchs ou autres événements
            {'\n'}• Des pertes ou dommages liés aux échanges
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Interdictions</Text>
          <Text style={styles.text}>
            Il est strictement interdit :
            {'\n'}• De vendre ou acheter des billets
            {'\n'}• De publier de fausses annonces
            {'\n'}• D'utiliser la plateforme pour des activités illégales
            {'\n'}• De harceler d'autres utilisateurs
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Modération</Text>
          <Text style={styles.text}>
            Toutes les annonces sont soumises à modération avant publication. 
            SwapStadium se réserve le droit de supprimer tout contenu inapproprié 
            et de suspendre les comptes non conformes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Données personnelles</Text>
          <Text style={styles.text}>
            Les données personnelles sont traitées conformément au RGPD. 
            Elles ne sont utilisées que pour le fonctionnement de la plateforme 
            et ne sont jamais partagées avec des tiers à des fins commerciales.
          </Text>
        </View>

        <View style={styles.warningBox}>
          <Ionicons name="warning" size={24} color="#FF9800" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Avertissement important</Text>
            <Text style={styles.warningText}>
              Rencontrez-vous toujours dans un lieu public et vérifiez 
              l'authenticité des billets avant tout échange. SwapStadium 
              n'est pas responsable des échanges effectués entre utilisateurs.
            </Text>
          </View>
        </View>

        <View style={styles.contact}>
          <Text style={styles.contactTitle}>Contact</Text>
          <Text style={styles.contactText}>
            Pour toute question : support@swapstadium.com
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  warningContent: {
    flex: 1,
    marginLeft: 15,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 5,
  },
  warningText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  contact: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  contactText: {
    fontSize: 14,
    color: '#2196F3',
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  backButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TermsScreen;
