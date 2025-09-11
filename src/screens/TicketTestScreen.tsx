import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import ticketService from '../services/ticketService';

console.warn('🧪 [TICKET-TEST] TicketTestScreen imported');

const TicketTestScreen: React.FC = () => {
  console.warn('🧪 [TICKET-TEST] TicketTestScreen rendering');

  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  // Test de création d'un ticket avec votre structure Firebase exacte
  const testCreateTicket = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    setIsLoading(true);
    setTestResult('Test en cours...');

    try {
      console.warn('🧪 [TICKET-TEST] Testing ticket creation...');

      // Données de test avec votre structure exacte
      const testData = {
        title: 'Test - PSG vs OM - Échange Tribune Auteuil',
        homeTeam: 'Paris Saint-Germain',
        awayTeam: 'Olympique de Marseille',
        competition: 'Ligue 1',
        matchDate: new Date('2024-12-25T20:00:00'),
        stadium: 'Parc des Princes',
        currentSection: 'Tribune Auteuil',
        currentRow: 'K',
        currentNumber: '15',
        desiredSection: 'Tribune Boulogne',
        desiredRow: 'A',
        desiredNumber: '22',
        description: 'Recherche échange pour être plus proche du terrain. Ma place actuelle offre une très bonne vue.',
        exchangeType: 'section',
        proximity: 'near',
      };

      const result = await ticketService.createTicket(testData, user);

      if (result.success) {
        const message = `✅ SUCCÈS!\n\nTicket créé avec ID: ${result.ticketId}\n\nStructure Firebase utilisée:\n- category: "exchange"\n- currentSeat: {section, row, number}\n- desiredSeat: {section, row, number}\n- match: {homeTeam, awayTeam, competition, date, stadium}\n- preferences: {exchangeType, proximity}\n- moderationStatus: "pending"\n- status: "active"\n- timestamps: createdAt, updatedAt, expiresAt`;
        
        setTestResult(message);
        console.warn('✅ [TICKET-TEST] Ticket creation successful:', result.ticketId);
        
        Alert.alert('Succès', `Ticket créé avec succès!\nID: ${result.ticketId}`);
        
        // Test de récupération des tickets
        setTimeout(() => testGetTickets(), 1000);
      } else {
        const message = `❌ ÉCHEC!\n\nErreur: ${result.error}`;
        setTestResult(message);
        console.warn('💥 [TICKET-TEST] Ticket creation failed:', result.error);
        Alert.alert('Erreur', result.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      const message = `💥 ERREUR CRITIQUE!\n\nException: ${error.message}`;
      setTestResult(message);
      console.warn('💥 [TICKET-TEST] Critical error:', error);
      Alert.alert('Erreur critique', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Test de récupération des tickets
  const testGetTickets = async () => {
    try {
      console.warn('🧪 [TICKET-TEST] Testing ticket retrieval...');
      
      const result = await ticketService.getTickets(5);
      
      if (result.success && result.tickets) {
        const message = `📋 RÉCUPÉRATION RÉUSSIE!\n\nNombre de tickets: ${result.tickets.length}\n\nStructure reçue:\n${JSON.stringify(result.tickets[0] || {}, null, 2)}`;
        setTestResult(prev => prev + '\n\n' + message);
        console.warn('✅ [TICKET-TEST] Tickets retrieved:', result.tickets.length);
      } else {
        const message = `❌ ÉCHEC RÉCUPÉRATION!\n\nErreur: ${result.error}`;
        setTestResult(prev => prev + '\n\n' + message);
        console.warn('💥 [TICKET-TEST] Ticket retrieval failed:', result.error);
      }
    } catch (error: any) {
      const message = `💥 ERREUR RÉCUPÉRATION!\n\nException: ${error.message}`;
      setTestResult(prev => prev + '\n\n' + message);
      console.warn('💥 [TICKET-TEST] Retrieval error:', error);
    }
  };

  // Test d'initialisation du service
  const testServiceInit = async () => {
    setIsLoading(true);
    setTestResult('Test d\'initialisation...');

    try {
      console.warn('🧪 [TICKET-TEST] Testing service initialization...');
      
      await ticketService.initialize();
      
      const message = `✅ INITIALISATION RÉUSSIE!\n\nService Firestore initialisé correctement.\nPrêt pour la création de tickets avec votre structure Firebase.`;
      setTestResult(message);
      console.warn('✅ [TICKET-TEST] Service initialization successful');
      
      Alert.alert('Succès', 'Service initialisé avec succès!');
    } catch (error: any) {
      const message = `💥 ÉCHEC INITIALISATION!\n\nErreur: ${error.message}`;
      setTestResult(message);
      console.warn('💥 [TICKET-TEST] Service initialization failed:', error);
      Alert.alert('Erreur', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>🧪 Test Service Tickets</Text>
      <Text style={styles.subtitle}>Structure Firebase exacte</Text>
      
      {user ? (
        <View style={styles.userInfo}>
          <Text style={styles.userText}>👤 Connecté: {user.email}</Text>
          <Text style={styles.userText}>🆔 UID: {(user as any).uid}</Text>
        </View>
      ) : (
        <Text style={styles.errorText}>❌ Utilisateur non connecté</Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.initButton]}
          onPress={testServiceInit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            🚀 Initialiser Service
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.createButton]}
          onPress={testCreateTicket}
          disabled={isLoading || !user}
        >
          <Text style={styles.buttonText}>
            🎫 Créer Ticket Test
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.listButton]}
          onPress={testGetTickets}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            📋 Lister Tickets
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>⏳ Test en cours...</Text>
        </View>
      )}

      {testResult ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>📊 Résultat du test:</Text>
          <Text style={styles.resultText}>{testResult}</Text>
        </View>
      ) : null}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>🎯 Structure Firebase testée:</Text>
        <Text style={styles.infoText}>
          {`• category: "exchange"
• currentSeat: {section, row, number}
• desiredSeat: {section, row, number}  
• match: {homeTeam, awayTeam, competition, date, stadium}
• preferences: {exchangeType, proximity}
• moderationStatus: "pending"
• status: "active"
• userId, userName, userRating
• timestamps: createdAt, updatedAt, expiresAt
• images: []
• description: string`}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  userInfo: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  userText: {
    fontSize: 14,
    color: '#27ae60',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  initButton: {
    backgroundColor: '#9b59b6',
  },
  createButton: {
    backgroundColor: '#3498db',
  },
  listButton: {
    backgroundColor: '#1abc9c',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#856404',
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 12,
    color: '#34495e',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 16,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#1565c0',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});

export default TicketTestScreen;
