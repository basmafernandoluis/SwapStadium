import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useGlobalToast } from '../../contexts/ToastContext';
import { TicketService } from '../../services/ticketService';
import { ExchangeService } from '../../services/exchangeService';
import { Ticket as TicketType } from '../../types';
import { RootStackParamList } from '../../navigation/AppNavigator';

type TicketDetailsRouteProp = RouteProp<RootStackParamList, 'TicketDetails'>;

const TicketDetailsScreen = () => {
  const route = useRoute<TicketDetailsRouteProp>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { showSuccess, showError } = useGlobalToast();
  
  const [ticket, setTicket] = useState<TicketType | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentExchangeId, setCurrentExchangeId] = useState<string | null>(null);
  const [contactRequested, setContactRequested] = useState(false);
  const [contactShared, setContactShared] = useState(false);
  
  const { ticketId } = route.params;

  useEffect(() => {
    loadTicketDetails();
  }, [ticketId]);

  const loadTicketDetails = async () => {
    try {
      setLoading(true);
      const ticketData = await TicketService.getTicketById(ticketId);
      if (ticketData && ticketData.id) {
        // Adapter au type d'écran si nécessaire
        setTicket({
          id: ticketData.id!,
          userId: ticketData.userId,
            userName: ticketData.userName,
            userRating: ticketData.userRating,
            title: ticketData.title,
            description: ticketData.description,
            match: {
              homeTeam: ticketData.match.homeTeam,
              awayTeam: ticketData.match.awayTeam,
              date: ticketData.match.date,
              stadium: ticketData.match.stadium,
              competition: ticketData.match.competition
            },
            currentSeat: {
              section: ticketData.currentSeat.section,
              row: ticketData.currentSeat.row,
              number: String(ticketData.currentSeat.number)
            },
            desiredSeat: ticketData.desiredSeat ? {
              section: ticketData.desiredSeat.section,
              row: ticketData.desiredSeat.row,
              number: String(ticketData.desiredSeat.number)
            } : undefined,
            images: ticketData.images,
            status: ticketData.status === 'completed' ? 'exchanged' : (ticketData.status as any),
            category: ticketData.category as any,
            preferences: {
              exchangeType: 'any',
              proximity: 'any'
            },
            createdAt: ticketData.createdAt,
            updatedAt: ticketData.updatedAt,
            expiresAt: ticketData.expiresAt
        });

        // Tenter de retrouver une demande d'échange existante avec l'un de mes tickets actifs
        try {
          if (user?.id && ticketData.userId !== user.id) {
            const myTicketsRes = await TicketService.getMyTickets();
            if (myTicketsRes.success && myTicketsRes.tickets?.length) {
              const myActive = myTicketsRes.tickets.find(t => t.status === 'active');
              if (myActive?.id) {
                const existing = await (ExchangeService as any).findOpenRequest?.(myActive.id, ticketData.id);
                if (existing?.success && existing.request?.id) {
                  setCurrentExchangeId(existing.request.id);
                  if (existing.request.fromContactRequested) setContactRequested(true);
                  if (existing.request.fromContactShared) setContactShared(true);
                }
              }
            }
          }
        } catch (e) {
          console.log('Lookup exchange existant échoué:', e);
        }
      } else {
        setTicket(null);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement du billet:', error);
      showError('❌ Impossible de charger les détails du billet');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (!ticket || !user) return;
    
    if (ticket.userId === user.id) {
      Alert.alert('Information', 'Ceci est votre propre billet');
      return;
    }

    Alert.alert(
      'Contacter le propriétaire',
      `Souhaitez-vous contacter ${ticket.userName} pour ce billet ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Contacter', onPress: () => showSuccess('🚀 Fonctionnalité de contact à venir !') }
      ]
    );
  };

  const handleExchangeRequest = () => {
    if (!ticket || !user) return;
    if (ticket.userId === user.id) {
      Alert.alert('Information', 'Vous ne pouvez pas faire une demande d\'échange sur votre propre billet');
      return;
    }
    if (ticket.category === 'giveaway') {
      Alert.alert('Information', 'Ce billet est proposé en don, pas en échange');
      return;
    }
    const usedPrompt = (Alert as any).prompt || (Alert as any).Prompt || undefined;
    if (usedPrompt) {
      usedPrompt(
      'Demande d\'échange',
      'Message (optionnel) pour le propriétaire',
      [
        { text: 'Annuler', style: 'cancel' },
  { text: 'Envoyer', onPress: async (message: string) => {
            try {
              // Pour MVP: on suppose que l'utilisateur propose un échange avec son premier ticket actif
              const myTicketsRes = await TicketService.getMyTickets();
              const myActive = myTicketsRes.success && myTicketsRes.tickets?.find(t => t.status === 'active');
              if (!myActive) {
                showError('Aucun de vos tickets actifs à proposer');
                return;
              }
              const res = await ExchangeService.createRequest(myActive.id!, ticket.id!, message || undefined);
              if (res.success && res.request?.id) {
                setCurrentExchangeId(res.request.id);
                showSuccess('Demande envoyée ✅');
              } else {
                showError(res.error || 'Erreur envoi demande');
              }
            } catch (e:any) {
              console.error('Erreur envoi demande échange', e);
              showError('Erreur interne demande');
            }
        }}
        ],
        'plain-text'
      );
      return;
    }
    Alert.alert(
      'Demande d\'échange',
      'Envoyer une demande sans message ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Envoyer', onPress: async () => {
          try {
            const myTicketsRes = await TicketService.getMyTickets();
            const myActive = myTicketsRes.success && myTicketsRes.tickets?.find(t => t.status === 'active');
            if (!myActive) { showError('Aucun ticket actif'); return; }
            const res = await ExchangeService.createRequest(myActive.id!, ticket.id!, undefined);
            if (res.success && res.request?.id) {
              setCurrentExchangeId(res.request.id);
              showSuccess('Demande envoyée ✅');
            } else {
              showError(res.error || 'Erreur envoi');
            }
          } catch(e:any){
            console.error(e); showError('Erreur interne');
          }
        }}
      ]
    );
  };

  // --- Ajout contact (sans chat) ---
  const handleRequestContact = async () => {
    if (!currentExchangeId) {
      showError('Aucune demande d\'échange active');
      return;
    }
    try {
      await (ExchangeService as any).requestContact?.(currentExchangeId);
      setContactRequested(true);
      showSuccess('Demande de contact envoyée');
    } catch (e:any) {
      console.error('Erreur requestContact', e);
      showError('Erreur demande contact');
    }
  };

  const handleShareContact = async () => {
    if (!currentExchangeId) {
      showError('Aucune demande d\'échange active');
      return;
    }
    Alert.alert(
      'Partager vos coordonnées',
      'Confirmez le partage (email masqué).',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Partager', onPress: async () => {
          try {
            const email = user?.email;
            await (ExchangeService as any).shareContact?.(currentExchangeId, { email });
            setContactShared(true);
            showSuccess('Coordonnées partagées (masquées)');
          } catch(e:any){
            console.error('Erreur shareContact', e);
            showError('Erreur partage contact');
          }
        }}
      ]
    );
  };

  const handleReport = () => {
    Alert.alert(
      'Signaler ce billet',
      'Pourquoi voulez-vous signaler ce billet ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Contenu inapproprié', onPress: () => showSuccess('Signalement envoyé') },
        { text: 'Billet suspect', onPress: () => showSuccess('Signalement envoyé') },
        { text: 'Autre', onPress: () => showSuccess('Signalement envoyé') }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    if (status === 'active') return '#4CAF50';
    if (status === 'exchanged') return '#2196F3';
    if (status === 'expired') return '#9E9E9E';
    return '#9E9E9E';
  };

  const getStatusText = (status: string) => {
    if (status === 'active') return 'Disponible';
    if (status === 'exchanged') return 'Échangé';
    if (status === 'expired') return 'Expiré';
    return 'Indisponible';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={64} color="#ccc" />
        <Text style={styles.errorText}>Billet introuvable</Text>
      </View>
    );
  }

  const isOwner = user?.id === ticket.userId;

  return (
    <ScrollView style={styles.container}>
      {/* Header avec statut */}
      <View style={styles.header}>
        <Text style={styles.title}>{ticket.title}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(ticket.status) }
        ]}>
          <Text style={styles.statusText}>
            {getStatusText(ticket.status)}
          </Text>
        </View>
      </View>

      {/* Type de billet */}
      <View style={styles.categoryContainer}>
        <View style={[
          styles.categoryBadge,
          { backgroundColor: ticket.category === 'exchange' ? '#2196F3' : '#4CAF50' }
        ]}>
          <Ionicons 
            name={ticket.category === 'exchange' ? 'swap-horizontal' : 'gift'} 
            size={20} 
            color="white" 
          />
          <Text style={styles.categoryText}>
            {ticket.category === 'exchange' ? 'Échange' : 'Don'}
          </Text>
        </View>
      </View>

      {/* Informations du match */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Informations du match</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Match :</Text>
            <Text style={styles.infoValue}>{ticket.match.homeTeam} vs {ticket.match.awayTeam}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Stade :</Text>
            <Text style={styles.infoValue}>{ticket.match.stadium}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date :</Text>
            <Text style={styles.infoValue}>
              {new Date(ticket.match.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Compétition :</Text>
            <Text style={styles.infoValue}>{ticket.match.competition}</Text>
          </View>
        </View>
      </View>

      {/* Place actuelle */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎫 Place proposée</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Section :</Text>
            <Text style={styles.infoValue}>{ticket.currentSeat.section}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rangée :</Text>
            <Text style={styles.infoValue}>{ticket.currentSeat.row}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Siège :</Text>
            <Text style={styles.infoValue}>{ticket.currentSeat.number}</Text>
          </View>
        </View>
      </View>

      {/* Place souhaitée (pour échange) */}
      {ticket.category === 'exchange' && ticket.desiredSeat && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Place souhaitée en échange</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Section :</Text>
              <Text style={styles.infoValue}>{ticket.desiredSeat.section}</Text>
            </View>
            {ticket.desiredSeat.row && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Rangée :</Text>
                <Text style={styles.infoValue}>{ticket.desiredSeat.row}</Text>
              </View>
            )}
            {ticket.desiredSeat.number && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Siège :</Text>
                <Text style={styles.infoValue}>{ticket.desiredSeat.number}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Description */}
      {ticket.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Description</Text>
          <View style={styles.infoCard}>
            <Text style={styles.descriptionText}>{ticket.description}</Text>
          </View>
        </View>
      )}

      {/* Informations du propriétaire */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Propriétaire</Text>
        <View style={styles.infoCard}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={32} color="#2196F3" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{ticket.userName}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{typeof ticket.userRating === 'number' ? ticket.userRating.toFixed(1) : '5.0'}/5</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Actions */}
  {!isOwner && ticket.status === 'active' && (
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleContact}>
            <Ionicons name="mail" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Contacter</Text>
          </TouchableOpacity>

          {ticket.category === 'exchange' && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handleExchangeRequest}>
              <Ionicons name="swap-horizontal" size={20} color="#2196F3" />
              <Text style={styles.secondaryButtonText}>Demander l'échange</Text>
            </TouchableOpacity>
          )}

          {currentExchangeId && (
            <View style={styles.contactActions}>
              {!contactRequested && (
                <TouchableOpacity style={styles.contactButton} onPress={handleRequestContact}>
                  <Ionicons name="hand-right" size={16} color="#2563eb" />
                  <Text style={styles.contactButtonText}>Demander contact</Text>
                </TouchableOpacity>
              )}
              {contactRequested && !contactShared && (
                <TouchableOpacity style={styles.contactButton} onPress={handleShareContact}>
                  <Ionicons name="share-social" size={16} color="#059669" />
                  <Text style={styles.contactButtonText}>Partager contact</Text>
                </TouchableOpacity>
              )}
              {contactShared && (
                <View style={styles.contactInfo}>
                  <Ionicons name="shield-checkmark" size={16} color="#059669" />
                  <Text style={styles.contactSharedText}>Coordonnées partagées</Text>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
            <Ionicons name="flag" size={16} color="#F44336" />
            <Text style={styles.reportButtonText}>Signaler</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Informations complémentaires */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Publié le {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
        </Text>
        <Text style={styles.footerText}>
          Expire le {new Date(ticket.expiresAt).toLocaleDateString('fr-FR')}
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
  errorText: {
    marginTop: 10,
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginTop: 10,
    backgroundColor: 'white',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
  },
  contactActions: {
    marginTop: 12,
    width: '100%',
    gap: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef6ff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 6,
  },
  contactButtonText: {
    marginLeft: 8,
    color: '#1d4ed8',
    fontWeight: '600'
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 6,
  },
  contactSharedText: {
    marginLeft: 8,
    color: '#047857',
    fontWeight: '600'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  actionsSection: {
    padding: 20,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  reportButtonText: {
    color: '#F44336',
    fontSize: 14,
    marginLeft: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default TicketDetailsScreen;
