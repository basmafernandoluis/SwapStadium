import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import ticketService from '../services/ticketService';

console.warn('📱 [TICKET-LIST] TicketListScreen imported');

interface Props {
  navigation: any;
}

const TicketListScreen: React.FC<Props> = ({ navigation }) => {
  console.warn('📱 [TICKET-LIST] TicketListScreen rendering');

  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les tickets
  const loadTickets = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.warn('📱 [TICKET-LIST] Loading tickets...');
      
      const result = await ticketService.getTickets(20);
      
      if (result.success && result.tickets) {
        console.warn('✅ [TICKET-LIST] Tickets loaded:', result.tickets.length);
        setTickets(result.tickets);
      } else {
        console.warn('💥 [TICKET-LIST] Failed to load tickets:', result.error);
        Alert.alert('Erreur', result.error || 'Impossible de charger les tickets');
      }
    } catch (error: any) {
      console.warn('💥 [TICKET-LIST] Load tickets error:', error);
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Effet pour charger les tickets au montage
  useEffect(() => {
    loadTickets();
  }, []);

  // Fonction de rafraîchissement
  const onRefresh = () => {
    loadTickets(true);
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  };

  // Fonction pour obtenir le statut en français
  const getStatusText = (status: string, moderationStatus: string): string => {
    if (moderationStatus === 'pending') {
      return 'En attente de modération';
    }
    if (moderationStatus === 'rejected') {
      return 'Rejeté';
    }
    
    switch (status) {
      case 'active':
        return 'Actif';
      case 'completed':
        return 'Échangé';
      case 'cancelled':
        return 'Annulé';
      case 'expired':
        return 'Expiré';
      default:
        return status;
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string, moderationStatus: string): string => {
    if (moderationStatus === 'pending') {
      return '#f39c12';
    }
    if (moderationStatus === 'rejected') {
      return '#e74c3c';
    }
    
    switch (status) {
      case 'active':
        return '#27ae60';
      case 'completed':
        return '#3498db';
      case 'cancelled':
      case 'expired':
        return '#95a5a6';
      default:
        return '#7f8c8d';
    }
  };

  // Composant pour afficher un ticket
  const TicketItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={() => {
        console.warn('📱 [TICKET-LIST] Ticket pressed:', item.id);
        // TODO: Navigation vers les détails du ticket
      }}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status, item.moderationStatus) }
        ]}>
          <Text style={styles.statusText}>
            {getStatusText(item.status, item.moderationStatus)}
          </Text>
        </View>
      </View>

      <View style={styles.matchInfo}>
        <Text style={styles.matchText}>
          {item.match?.homeTeam} vs {item.match?.awayTeam}
        </Text>
        <Text style={styles.competitionText}>
          {item.match?.competition} • {item.match?.stadium}
        </Text>
        <Text style={styles.dateText}>
          {formatDate(item.match?.date)}
        </Text>
      </View>

      <View style={styles.seatInfo}>
        <View style={styles.seatColumn}>
          <Text style={styles.seatLabel}>Place actuelle</Text>
          <Text style={styles.seatText}>
            {item.currentSeat?.section} - Rangée {item.currentSeat?.row} - Siège {item.currentSeat?.number}
          </Text>
        </View>
        <View style={styles.seatArrow}>
          <Text style={styles.arrowText}>→</Text>
        </View>
        <View style={styles.seatColumn}>
          <Text style={styles.seatLabel}>Place désirée</Text>
          <Text style={styles.seatText}>
            {item.desiredSeat?.section} - Rangée {item.desiredSeat?.row} - Siège {item.desiredSeat?.number}
          </Text>
        </View>
      </View>

      <View style={styles.ticketFooter}>
        <Text style={styles.userText}>
          Par {item.userName} • ⭐ {item.userRating}
        </Text>
        <Text style={styles.createdText}>
          Créé le {formatDate(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Affichage de chargement
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Chargement des tickets...</Text>
      </View>
    );
  }

  // Affichage si aucun ticket
  if (tickets.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Aucun ticket disponible</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('TicketAdd')}
        >
          <Text style={styles.addButtonText}>Créer un ticket</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tickets d'échange</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('TicketAdd')}
        >
          <Text style={styles.addButtonText}>+ Nouveau</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TicketItem item={item} />}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#3498db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  ticketCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: 12,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  matchInfo: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  matchText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  competitionText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
  },
  seatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  seatColumn: {
    flex: 1,
  },
  seatArrow: {
    marginHorizontal: 12,
  },
  arrowText: {
    fontSize: 20,
    color: '#3498db',
    fontWeight: 'bold',
  },
  seatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  seatText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  userText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  createdText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default TicketListScreen;
