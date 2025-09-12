import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TicketService, Ticket } from '../../services/ticketService';
import { ExchangeService } from '../../services/exchangeService';
import { useGlobalToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';

const PublicTicketsScreen: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { showSuccess, showError } = useGlobalToast();
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    const unsub = TicketService.subscribePublicActiveTickets({ limit: 100 }, (tks) => {
      setTickets(tks);
      setLoading(false);
    });
    return () => { unsub(); };
  }, []);

  const onRefresh = async () => {
    // Avec snapshot temps réel, pas besoin de refetch; on simule juste un spinner court
    setRefreshing(true);
    setTimeout(()=> setRefreshing(false), 400);
  };

  const handleQuickExchange = async (target: Ticket) => {
    try {
      if (!user) { showError('Connexion requise'); return; }
      const myTicketsRes = await TicketService.getMyTickets();
      const myActive = myTicketsRes.success && myTicketsRes.tickets?.find(t => t.status === 'active');
      if (!myActive) { showError('Aucun de vos billets actifs'); return; }
      if (!myActive.id || !target.id) { showError('Billet invalide'); return; }
      const existing = await (ExchangeService as any).findOpenRequest?.(myActive.id, target.id);
      if (existing?.success) { showError('Demande déjà existante'); return; }
      const res = await ExchangeService.createRequest(myActive.id, target.id, undefined);
      if (res.success) showSuccess('Demande envoyée ✅'); else showError(res.error || 'Erreur demande');
    } catch(e:any){
      console.error('Quick exchange error', e); showError('Erreur interne');
    }
  };

  const renderItem = ({ item }: { item: Ticket }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('TicketDetails', { ticketId: item.id! })}>
      <View style={styles.header}>        
        <Text style={styles.title} numberOfLines={1}>{item.match.homeTeam} vs {item.match.awayTeam}</Text>
        <View style={[styles.categoryBadge,{backgroundColor: item.category === 'exchange' ? '#2196F3':'#4CAF50'}]}>
          <Text style={styles.categoryText}>{item.category === 'exchange' ? 'Échange' : 'Don'}</Text>
        </View>
      </View>
      <Text style={styles.stadium}>{item.match.stadium} • {new Date(item.match.date).toLocaleDateString('fr-FR')}</Text>
      <Text style={styles.seat}>Section {item.currentSeat.section} - Rangée {item.currentSeat.row}</Text>
      {!!item.desiredSeat && (
        <Text style={styles.desired}>Souhaite: Section {item.desiredSeat.section}{item.desiredSeat.row && ` / Rangée ${item.desiredSeat.row}`}</Text>
      )}
      <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
      {item.category === 'exchange' && (
        <TouchableOpacity style={styles.exchangeBtn} onPress={() => handleQuickExchange(item)}>
          <Ionicons name="swap-horizontal" size={16} color="white" />
          <Text style={styles.exchangeBtnText}>Proposer un échange</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>        
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loading}>Chargement des billets disponibles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {tickets.length === 0 ? (
        <View style={styles.center}>          
          <Ionicons name="ticket-outline" size={72} color="#ccc" />
          <Text style={styles.emptyTitle}>Aucun billet disponible</Text>
          <Text style={styles.emptySubtitle}>Les autres utilisateurs n'ont pas encore publié de billets actifs.</Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id!}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#f5f5f5' },
  center: { flex:1, alignItems:'center', justifyContent:'center', padding:24 },
  loading: { marginTop:12, color:'#666' },
  list: { padding:16 },
  card: { backgroundColor:'white', borderRadius:12, padding:14, marginBottom:14, shadowColor:'#000', shadowOpacity:0.06, shadowOffset:{width:0,height:2}, shadowRadius:4, elevation:2 },
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:6 },
  title: { fontSize:16, fontWeight:'600', flex:1, marginRight:8, color:'#333' },
  categoryBadge:{ paddingHorizontal:8, paddingVertical:4, borderRadius:10 },
  categoryText:{ color:'white', fontSize:12, fontWeight:'600' },
  stadium:{ fontSize:13, color:'#555', marginBottom:4 },
  seat:{ fontSize:13, color:'#222', marginBottom:2 },
  desired:{ fontSize:12, color:'#1976D2', marginBottom:4 },
  desc:{ fontSize:12, color:'#555' },
  exchangeBtn:{ marginTop:8, flexDirection:'row', alignItems:'center', backgroundColor:'#2196F3', paddingVertical:8, paddingHorizontal:12, borderRadius:8, alignSelf:'flex-start' },
  exchangeBtnText:{ color:'white', marginLeft:6, fontSize:13, fontWeight:'600' },
  emptyTitle:{ marginTop:16, fontSize:18, fontWeight:'600', color:'#333' },
  emptySubtitle:{ marginTop:8, fontSize:14, color:'#666', textAlign:'center' }
});

export default PublicTicketsScreen;