import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useGlobalToast } from '../contexts/ToastContext';
import { TicketService } from '../services/ticketService';
import { Ticket } from '../types';

const AddTicketTestScreen = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useGlobalToast();
  const [loading, setLoading] = useState(false);

  const createTestTicket = async (type: 'exchange' | 'giveaway') => {
    if (!user) {
      showError('❌ Vous devez être connecté pour créer un billet');
      return;
    }

    try {
      setLoading(true);

      const testTicketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'> = {
        title: type === 'exchange' ? 'PSG vs OM - Échange' : 'PSG vs OM - Don',
        match: {
          homeTeam: 'Paris Saint-Germain',
          awayTeam: 'Olympique de Marseille',
          stadium: 'Parc des Princes',
          date: new Date('2025-12-15'),
          competition: 'Ligue 1'
        },
        currentSeat: {
          section: 'Tribune Paris',
          row: '15',
          number: '120'
        },
        desiredSeat: type === 'exchange' ? {
          section: 'Tribune Boulogne',
          row: '10',
          number: '50'
        } : undefined,
        description: type === 'exchange' 
          ? 'Je propose un échange de ma place en Tribune Paris contre une place en Tribune Boulogne. Ma place offre une vue excellente sur le terrain.'
          : 'Je donne ma place car je ne peux plus assister au match. Premier arrivé, premier servi !',
        category: type,
        userId: user.id,
        userName: user.displayName || 'Utilisateur Test',
        userRating: 4.5,
        status: 'active',
        images: [],
        preferences: {
          exchangeType: 'any',
          proximity: 'any'
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expire dans 30 jours
      };

      const ticketId = await TicketService.createTicket(testTicketData);
      
      showSuccess(`🎉 Billet de test créé avec succès !\n\nType: ${type === 'exchange' ? 'Échange' : 'Don'}\nID: ${ticketId}\n\nLe billet est en cours de modération.`);
  showSuccess(`🎉 Billet de test créé avec succès !\n\nType: ${type === 'exchange' ? 'Échange' : 'Don'}\nID: ${ticketId}`);
      
    } catch (error: any) {
      console.error('Erreur lors de la création du billet de test:', error);
      showError(`❌ Erreur: ${error.message || 'Impossible de créer le billet de test'}`);
    } finally {
      setLoading(false);
    }
  };

  const createMultipleTestTickets = async () => {
    if (!user) {
      showError('❌ Vous devez être connecté');
      return;
    }

    try {
      setLoading(true);
      
      const matches = [
        { home: 'PSG', away: 'OM', stadium: 'Parc des Princes', date: '2025-12-15' },
        { home: 'Lyon', away: 'Monaco', stadium: 'Groupama Stadium', date: '2025-12-20' },
        { home: 'Lille', away: 'Rennes', stadium: 'Pierre-Mauroy', date: '2025-12-22' },
      ];

      let created = 0;
      for (const match of matches) {
        for (const type of ['exchange', 'giveaway'] as const) {
          const ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'> = {
            title: `${match.home} vs ${match.away}`,
            match: {
              homeTeam: match.home,
              awayTeam: match.away,
              stadium: match.stadium,
              date: new Date(match.date),
              competition: 'Ligue 1'
            },
            currentSeat: {
              section: `Section ${Math.floor(Math.random() * 10) + 1}`,
              row: `${Math.floor(Math.random() * 20) + 1}`,
              number: `${Math.floor(Math.random() * 30) + 1}`
            },
            desiredSeat: type === 'exchange' ? {
              section: `Section ${Math.floor(Math.random() * 10) + 1}`,
              row: `${Math.floor(Math.random() * 20) + 1}`,
              number: `${Math.floor(Math.random() * 30) + 1}`
            } : undefined,
            description: type === 'exchange' 
              ? `Échange pour ${match.home} vs ${match.away}. Excellente place disponible.`
              : `Don de billet pour ${match.home} vs ${match.away}. Ne peux plus y aller.`,
            category: type,
            userId: user.id,
            userName: user.displayName || 'Utilisateur Test',
            userRating: 4.0 + Math.random(),
            status: 'active',
            images: [],
            preferences: {
              exchangeType: 'any',
              proximity: 'any'
            },
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          };

          await TicketService.createTicket(ticketData);
          created++;
        }
      }
      
      showSuccess(`🎉 ${created} billets de test créés avec succès !`);
      
    } catch (error: any) {
      console.error('Erreur:', error);
      showError(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flask" size={80} color="#2196F3" />
        <Text style={styles.title}>Test d'ajout de billets</Text>
        <Text style={styles.subtitle}>
          Testez la création de billets dans Firebase
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tests rapides</Text>
        
        <TouchableOpacity 
          style={[styles.testButton, { backgroundColor: '#2196F3' }]}
          onPress={() => createTestTicket('exchange')}
          disabled={loading}
        >
          <Ionicons name="swap-horizontal" size={24} color="white" />
          <Text style={styles.buttonText}>Créer un billet d'échange</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.testButton, { backgroundColor: '#4CAF50' }]}
          onPress={() => createTestTicket('giveaway')}
          disabled={loading}
        >
          <Ionicons name="gift" size={24} color="white" />
          <Text style={styles.buttonText}>Créer un billet de don</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.testButton, { backgroundColor: '#FF9800' }]}
          onPress={createMultipleTestTickets}
          disabled={loading}
        >
          <Ionicons name="duplicate" size={24} color="white" />
          <Text style={styles.buttonText}>Créer plusieurs billets de test</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Ionicons name="information-circle" size={24} color="#2196F3" />
        <Text style={styles.infoText}>
          Ces billets de test sont créés et visibles immédiatement (modération supprimée).
        </Text>
      </View>

      {loading && (
        <View style={styles.loadingSection}>
          <Text style={styles.loadingText}>Création en cours...</Text>
        </View>
      )}
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
    marginBottom: 20,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  loadingSection: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default AddTicketTestScreen;
