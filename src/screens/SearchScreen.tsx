import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../hooks/useTranslation';
import { TicketService } from '../services/ticketService';
import { Ticket, SearchFilters } from '../types';

const SearchScreen = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const { t } = useTranslation();

  const searchTickets = async () => {
    try {
      setLoading(true);
      const searchFilters: SearchFilters = {
        ...filters,
        match: searchText || undefined
      };
      
      const result = await TicketService.searchTickets(searchFilters);
      setTickets(result.tickets);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      Alert.alert(t('common.error'), 'Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchTickets();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await searchTickets();
    setRefreshing(false);
  };

  const TicketItem = ({ item }: { item: Ticket }) => (
    <TouchableOpacity style={styles.ticketCard}>
      <View style={styles.ticketHeader}>
        <Text style={styles.matchTitle} numberOfLines={1}>
          {item.match.homeTeam} vs {item.match.awayTeam}
        </Text>
        <View style={[styles.categoryBadge, 
          { backgroundColor: item.category === 'exchange' ? '#2196F3' : '#4CAF50' }
        ]}>
          <Text style={styles.categoryText}>
            {item.category === 'exchange' ? 'Échange' : 'Don'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.stadiumText}>{item.match.stadium}</Text>
      <Text style={styles.dateText}>
        {new Date(item.match.date).toLocaleDateString('fr-FR')}
      </Text>
      
      <View style={styles.seatInfo}>
        <Text style={styles.seatText}>
          Section {item.currentSeat.section} - Rangée {item.currentSeat.row}
        </Text>
        <View style={styles.userInfo}>
          <View style={styles.userRating}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{item.userRating.toFixed(1)}</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un match, équipe, stade..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={searchTickets}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.searchButton} onPress={searchTickets}>
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Filtres rapides */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity 
          style={[styles.filterChip, filters.category === 'exchange' && styles.activeFilter]}
          onPress={() => setFilters({ ...filters, category: filters.category === 'exchange' ? undefined : 'exchange' })}
        >
          <Text style={[styles.filterText, filters.category === 'exchange' && styles.activeFilterText]}>
            Échanges
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterChip, filters.category === 'giveaway' && styles.activeFilter]}
          onPress={() => setFilters({ ...filters, category: filters.category === 'giveaway' ? undefined : 'giveaway' })}
        >
          <Text style={[styles.filterText, filters.category === 'giveaway' && styles.activeFilterText]}>
            Dons
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.filterChip}
          onPress={() => Alert.alert('Filtres', 'Fonctionnalité de filtres avancés à venir')}
        >
          <Ionicons name="options" size={16} color="#666" />
          <Text style={styles.filterText}>Plus</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des billets */}
      <FlatList
        data={tickets}
        renderItem={TicketItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {loading ? t('common.loading') : 'Aucun billet trouvé'}
            </Text>
            {!loading && (
              <Text style={styles.emptySubtext}>
                Essayez de modifier vos critères de recherche
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#2196F3',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  activeFilter: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  activeFilterText: {
    color: 'white',
  },
  list: {
    flex: 1,
  },
  ticketCard: {
    backgroundColor: 'white',
    margin: 10,
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
    marginBottom: 8,
  },
  seatText: {
    fontSize: 13,
    color: '#888',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 15,
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default SearchScreen;
