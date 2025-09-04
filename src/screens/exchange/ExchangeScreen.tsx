import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useGlobalToast } from '../../contexts/ToastContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';

// Interface temporaire pour les échanges
interface Exchange {
  id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  ticketTitle: string;
  otherUserName: string;
  createdAt: Date;
  type: 'sent' | 'received';
}

const ExchangeScreen = () => {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useGlobalToast();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const loadExchanges = async () => {
    try {
      setLoading(true);
      // TODO: Remplacer par un vrai appel au service d'échange
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données de test pour la démo
      const mockExchanges: Exchange[] = [
        {
          id: '1',
          status: 'pending',
          ticketTitle: 'PSG vs OM',
          otherUserName: 'Marie Dubois',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          type: 'sent'
        },
        {
          id: '2',
          status: 'accepted',
          ticketTitle: 'Lyon vs Monaco',
          otherUserName: 'Pierre Martin',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          type: 'received'
        }
      ];
      
      setExchanges(mockExchanges);
    } catch (error) {
      console.error('Erreur lors du chargement des échanges:', error);
      showError('❌ Erreur lors du chargement des échanges');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExchanges();
    setRefreshing(false);
  };

  useEffect(() => {
    loadExchanges();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'completed': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Accepté';
      case 'rejected': return 'Refusé';
      case 'completed': return 'Terminé';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time';
      case 'accepted': return 'checkmark-circle';
      case 'rejected': return 'close-circle';
      case 'completed': return 'checkmark-done-circle';
      default: return 'help-circle';
    }
  };

  const handleExchangePress = (exchange: Exchange) => {
    showSuccess(`🚀 Détails de l'échange "${exchange.ticketTitle}" à venir !`);
  };

  const renderExchangeCard = ({ item: exchange }: { item: Exchange }) => (
    <TouchableOpacity 
      style={styles.exchangeCard}
      onPress={() => handleExchangePress(exchange)}
    >
      <View style={styles.exchangeHeader}>
        <View style={styles.exchangeInfo}>
          <Text style={styles.ticketTitle}>{exchange.ticketTitle}</Text>
          <Text style={styles.exchangeType}>
            {exchange.type === 'sent' ? '📤 Demande envoyée' : '📥 Demande reçue'}
          </Text>
          <Text style={styles.otherUser}>
            avec {exchange.otherUserName}
          </Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(exchange.status) }
          ]}>
            <Ionicons 
              name={getStatusIcon(exchange.status)} 
              size={16} 
              color="white" 
            />
            <Text style={styles.statusText}>
              {getStatusText(exchange.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.exchangeFooter}>
        <Text style={styles.dateText}>
          {new Date(exchange.createdAt).toLocaleDateString('fr-FR')}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Chargement des échanges...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {exchanges.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="swap-horizontal-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Aucun échange</Text>
          <Text style={styles.emptySubtitle}>
            Vos demandes d'échange apparaîtront ici
          </Text>
          
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Search' as never)}
          >
            <Ionicons name="search" size={20} color="white" />
            <Text style={styles.exploreButtonText}>Explorer les billets</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Mes échanges ({exchanges.length})
            </Text>
          </View>
          
          <FlatList
            data={exchanges}
            renderItem={renderExchangeCard}
            keyExtractor={(item) => item.id}
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
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  exchangeCard: {
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
  exchangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  exchangeInfo: {
    flex: 1,
    marginRight: 10,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  exchangeType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  otherUser: {
    fontSize: 14,
    color: '#888',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  exchangeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dateText: {
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
  exploreButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  exploreButtonText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExchangeScreen;
