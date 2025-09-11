import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ticket } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface TicketCardProps {
  ticket: Ticket;
  onPress: () => void;
  showUser?: boolean;
}

const { width } = Dimensions.get('window');

const TicketCard: React.FC<TicketCardProps> = ({ 
  ticket, 
  onPress, 
  showUser = true 
}) => {
  const { t } = useTranslation();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryColor = (category: string) => {
    return category === 'exchange' ? '#2196F3' : '#4CAF50';
  };

  const getCategoryText = (category: string) => {
    return category === 'exchange' ? t('tickets.exchange') : t('tickets.giveaway');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* En-tête avec les équipes et catégorie */}
      <View style={styles.header}>
        <View style={styles.matchInfo}>
          <Text style={styles.matchTitle} numberOfLines={1}>
            {ticket.match.homeTeam} vs {ticket.match.awayTeam}
          </Text>
          <Text style={styles.competition}>{ticket.match.competition}</Text>
        </View>
        <View 
          style={[
            styles.categoryBadge, 
            { backgroundColor: getCategoryColor(ticket.category) }
          ]}
        >
          <Text style={styles.categoryText}>
            {getCategoryText(ticket.category)}
          </Text>
        </View>
      </View>

      {/* Informations du match */}
      <View style={styles.matchDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{ticket.match.stadium}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{formatDate(ticket.match.date)}</Text>
        </View>
      </View>

      {/* Places */}
      <View style={styles.seatInfo}>
        <View style={styles.currentSeat}>
          <Text style={styles.seatLabel}>Place actuelle:</Text>
          <Text style={styles.seatValue}>
            Section {ticket.currentSeat.section} • 
            Rangée {ticket.currentSeat.row} • 
            Siège {ticket.currentSeat.number}
          </Text>
        </View>
        
        {ticket.desiredSeat && (
          <View style={styles.desiredSeat}>
            <Text style={styles.seatLabel}>Place souhaitée:</Text>
            <Text style={styles.seatValue}>
              Section {ticket.desiredSeat.section}
              {ticket.desiredSeat.row && ` • Rangée ${ticket.desiredSeat.row}`}
              {ticket.desiredSeat.number && ` • Siège ${ticket.desiredSeat.number}`}
            </Text>
          </View>
        )}
      </View>

      {/* Images du billet */}
      {ticket.images && ticket.images.length > 0 && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: ticket.images[0] }} 
            style={styles.ticketImage}
            resizeMode="cover"
          />
          {ticket.images.length > 1 && (
            <View style={styles.imageCounter}>
              <Ionicons name="images" size={12} color="white" />
              <Text style={styles.imageCountText}>+{ticket.images.length - 1}</Text>
            </View>
          )}
        </View>
      )}

      {/* Informations utilisateur */}
      {showUser && (
        <View style={styles.userInfo}>
          <View style={styles.userProfile}>
            {ticket.userPhoto ? (
              <Image source={{ uri: ticket.userPhoto }} style={styles.userPhoto} />
            ) : (
              <View style={styles.userPhotoPlaceholder}>
                <Ionicons name="person" size={16} color="#666" />
              </View>
            )}
            <Text style={styles.userName}>{ticket.userName}</Text>
          </View>
          
          <View style={styles.userRating}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>
              {typeof ticket.userRating === 'number' ? ticket.userRating.toFixed(1) : '5.0'}
            </Text>
          </View>
        </View>
      )}

  {/* Modération supprimée */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  matchInfo: {
    flex: 1,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  competition: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  matchDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  seatInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  currentSeat: {
    marginBottom: 6,
  },
  desiredSeat: {},
  seatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  seatValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  ticketImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  imageCounter: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageCountText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 2,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userPhoto: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  userPhotoPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  userRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 2,
  },
  moderationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  moderationText: {
    fontSize: 11,
    color: '#E65100',
    marginLeft: 4,
  },
});

export default TicketCard;
