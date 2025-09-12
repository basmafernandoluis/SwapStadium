import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Dimensions
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { TicketService } from '../services/ticketService';
// Utilisation du type Ticket provenant du service pour éviter les divergences
import { Ticket as ServiceTicket } from '../services/ticketService';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const [recentTickets, setRecentTickets] = useState<ServiceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { t } = useTranslation();

  const loadRecentTickets = async () => {
    try {
      // Utilise désormais le feed public (hors billets de l'utilisateur)
      const result = await TicketService.getPublicActiveTickets({ limit: 20 });
      if (result.success && result.tickets) {
        // Filtrer uniquement les tickets avec un id défini pour correspondre à l'UI
        setRecentTickets(result.tickets.filter(t => !!t.id).slice(0, 5) as ServiceTicket[]);
      } else {
        setRecentTickets([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des billets récents:', error);
      setRecentTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentTickets();
    setRefreshing(false);
  };

  useEffect(() => {
    loadRecentTickets();
  }, []);

  const QuickActionCard = ({ icon, title, subtitle, onPress, color }: any) => (
    <TouchableOpacity style={[styles.actionCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.actionHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.actionTitle}>{title}</Text>
      </View>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  const TicketCard = ({ ticket }: { ticket: ServiceTicket }) => (
    <TouchableOpacity 
      style={styles.ticketCard}
      onPress={() => navigation.navigate('TicketDetails' as any, { ticketId: ticket.id })}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.matchTitle} numberOfLines={1}>
          {ticket.match.homeTeam} vs {ticket.match.awayTeam}
        </Text>
        <View style={[styles.categoryBadge, 
          { backgroundColor: ticket.category === 'exchange' ? '#2196F3' : '#4CAF50' }
        ]}>
          <Text style={styles.categoryText}>
            {ticket.category === 'exchange' ? 'Échange' : 'Don'}
          </Text>
        </View>
      </View>
      <Text style={styles.stadiumText}>{ticket.match.stadium}</Text>
      <Text style={styles.dateText}>
        {new Date(ticket.match.date).toLocaleDateString('fr-FR')}
      </Text>
      <View style={styles.seatInfo}>
        <Text style={styles.seatText}>
          Section {ticket.currentSeat.section} - Rangée {ticket.currentSeat.row}
        </Text>
        <View style={styles.userRating}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{typeof ticket.userRating === 'number' ? ticket.userRating.toFixed(1) : '5.0'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header de bienvenue */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Bonjour,</Text>
          <Text style={styles.userName}>{user?.displayName}!</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications' as never)}
          style={styles.notificationButton}
        >
          <Ionicons name="notifications-outline" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Actions rapides */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actionsContainer}>
          <QuickActionCard
            icon="add-circle"
            title={t('tickets.addTicket')}
            subtitle="Publiez votre billet"
            color="#4CAF50"
            onPress={() => navigation.navigate('AddTicket' as never)}
          />
          <QuickActionCard
            icon="search"
            title={t('search.searchTickets')}
            subtitle="Trouvez le billet parfait"
            color="#2196F3"
            onPress={() => navigation.navigate('Search' as never)}
          />
          <QuickActionCard
            icon="swap-horizontal"
            title={t('exchange.myExchanges')}
            subtitle="Gérez vos échanges"
            color="#FF9800"
            // Correction: l'onglet réel est "Exchanges" (pluriel)
            onPress={() => navigation.navigate('Exchanges' as never)}
          />
        </View>
      </View>

      {/* Billets récents */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Billets récents</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search' as never)}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>{t('common.loading')}</Text>
          </View>
        ) : recentTickets.length > 0 ? (
          <View style={styles.ticketsContainer}>
            {recentTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="ticket-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Aucun billet disponible</Text>
          </View>
        )}
      </View>

      {/* Avertissements de sécurité */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conseils de sécurité</Text>
        <View style={styles.warningContainer}>
          <View style={styles.warningCard}>
            <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
            <Text style={styles.warningText}>
              {t('warnings.meetInPublic')}
            </Text>
          </View>
          <View style={styles.warningCard}>
            <Ionicons name="eye" size={20} color="#2196F3" />
            <Text style={styles.warningText}>
              {t('warnings.verifyTickets')}
            </Text>
          </View>
          <View style={styles.warningCard}>
            <Ionicons name="ban" size={20} color="#F44336" />
            <Text style={styles.warningText}>
              {t('warnings.noFinancialTransaction')}
            </Text>
          </View>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationButton: {
    padding: 8,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  actionsContainer: {
    gap: 10,
  },
  actionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  ticketsContainer: {
    gap: 10,
  },
  ticketCard: {
    backgroundColor: 'white',
    padding: 15,
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
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
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
  stadiumText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  seatInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seatText: {
    fontSize: 13,
    color: '#888',
  },
  userRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  warningContainer: {
    gap: 10,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  warningText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
