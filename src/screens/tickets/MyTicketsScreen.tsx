import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useGlobalToast } from '../../contexts/ToastContext';
import { TicketService, Ticket as ServiceTicket } from '../../services/ticketService';
import { RootStackParamList } from '../../navigation/AppNavigator';

const MyTicketsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { showSuccess, showError } = useGlobalToast();
  
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUserTickets = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
  const result = await TicketService.getMyTickets();
  if (result.success && result.tickets) setTickets(result.tickets);
    } catch (error: any) {
      console.error('Erreur lors du chargement des billets:', error);
      showError('❌ Erreur lors du chargement de vos billets');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserTickets();
    setRefreshing(false);
  };

  // Charger les billets à l'ouverture de l'écran
  useFocusEffect(
    React.useCallback(() => {
      loadUserTickets();
    }, [user])
  );

  const handleAddTicket = () => {
    navigation.navigate('AddTicket');
  };

  const handleTicketPress = (ticket: ServiceTicket) => {
  if (!ticket.id) return; // sécurité
  navigation.navigate('TicketDetails', { ticketId: ticket.id });
  };

  const getStatusColor = (status: string) => {
    if (status === 'active') return '#4CAF50';
    if (status === 'exchanged') return '#2196F3';
    if (status === 'expired') return '#9E9E9E';
    return '#9E9E9E';
  };

  const getStatusText = (status: string) => {
    if (status === 'active') return 'Actif';
    if (status === 'exchanged') return 'Échangé';
    if (status === 'expired') return 'Expiré';
    return 'Suspendu';
  };

  const renderTicketCard = ({ item: ticket }: { item: ServiceTicket }) => (
    <TouchableOpacity 
      style={styles.ticketCard}
      onPress={() => handleTicketPress(ticket)}
    >
      <View style={styles.ticketHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.matchTitle} numberOfLines={1}>
            {ticket.title}
          </Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(ticket.status) }
          ]}>
            <Text style={styles.statusText}>
              {getStatusText(ticket.status)}
            </Text>
          </View>
        </View>
        <View style={[styles.categoryBadge, 
          { backgroundColor: ticket.category === 'exchange' ? '#2196F3' : '#4CAF50' }
        ]}>
          <Text style={styles.categoryText}>
            {ticket.category === 'exchange' ? 'Échange' : 'Don'}
          </Text>
        </View>
      </View>

      <View style={styles.matchInfo}>
        <Text style={styles.stadiumText}>📍 {ticket.match.stadium}</Text>
        <Text style={styles.dateText}>
          📅 {new Date(ticket.match.date).toLocaleDateString('fr-FR')}
        </Text>
      </View>

      <View style={styles.seatInfo}>
        <Text style={styles.seatText}>
          🎫 Section {ticket.currentSeat.section} - Rangée {ticket.currentSeat.row} - Siège {ticket.currentSeat.number}
        </Text>
      </View>

      {ticket.description && (
        <Text style={styles.descriptionText} numberOfLines={2}>
          {ticket.description}
        </Text>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.createdText}>
          Créé le {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Chargement de vos billets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {tickets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="ticket-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Aucun billet</Text>
          <Text style={styles.emptySubtitle}>
            Vous n'avez pas encore publié de billets
          </Text>
          
          <TouchableOpacity style={styles.addButton} onPress={handleAddTicket}>
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.addButtonText}>Publier mon premier billet</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Mes billets ({tickets.length})</Text>
            <TouchableOpacity style={styles.addButtonSmall} onPress={handleAddTicket}>
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={tickets}
            renderItem={renderTicketCard}
            keyExtractor={(item) => item.id!}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
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
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButtonSmall: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  ticketCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  matchInfo: {
    marginBottom: 8,
  },
  stadiumText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  seatInfo: {
    marginBottom: 8,
  },
  seatText: {
    fontSize: 13,
    color: '#888',
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 18,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  createdText: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  addButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyTicketsScreen;
