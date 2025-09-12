import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExchangeService, ExchangeRequest } from '../../services/exchangeService';
import { AuthService } from '../../services/authService';
import { TicketService } from '../../services/ticketService';
import { useGlobalToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';

interface DecoratedExchange extends ExchangeRequest { fromTitle?: string; toTitle?: string; }

const ExchangesScreen: React.FC = () => {
  const { user } = useAuth();
  const myUid = (user as any)?.uid || (user as any)?.id || AuthService.getCurrentUser()?.uid || null;
  const { showError } = useGlobalToast();
  const [incoming, setIncoming] = useState<DecoratedExchange[]>([]);
  const [outgoing, setOutgoing] = useState<DecoratedExchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const decorate = async (reqs: ExchangeRequest[]): Promise<DecoratedExchange[]> => {
    const map: Record<string,string> = {};
    const needIds = Array.from(new Set(reqs.flatMap(r => [r.fromTicketId, r.toTicketId])));
    await Promise.all(needIds.map(async id => {
      try { const t = await TicketService.getTicketById(id); if(t?.id) map[id]=t.title || `${t.match.homeTeam} vs ${t.match.awayTeam}`; } catch(e){}
    }));
    return reqs.map(r => ({ ...r, fromTitle: map[r.fromTicketId], toTitle: map[r.toTicketId] }));
  };

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;    
    setLoading(true);
    const unsubIn = ExchangeService.subscribeIncoming(async (reqs) => {
      setIncoming(await decorate(reqs));
    });
    const unsubOut = ExchangeService.subscribeOutgoing(async (reqs) => {
      setOutgoing(await decorate(reqs));
    });
    // petite temporisation pour éviter clignotement si deux snapshots arrivent successivement
    const timer = setTimeout(()=> setLoading(false), 250);
    return () => { unsubIn(); unsubOut(); clearTimeout(timer); };
  }, [user]);

  const onRefresh = async () => { 
    // Dans le mode temps réel, on force simplement un redecorate manuel (snapshots déjà actifs)
    setRefreshing(true); 
    try {
      setIncoming(await decorate(incoming));
      setOutgoing(await decorate(outgoing));
    } finally { setRefreshing(false); }
  };

  const actOn = async (action: 'accept'|'reject'|'cancel', id: string) => {
    try {
      let res;
      if (action === 'accept') res = await ExchangeService.accept(id);
      else if (action === 'reject') res = await ExchangeService.reject(id);
      else res = await ExchangeService.cancel(id);
      if (!res.success) showError(res.error || 'Action échouée');
  // Pas besoin de reload complet: actions mises à jour via snapshot; on peut forcer redecorate
  setIncoming(await decorate(incoming));
  setOutgoing(await decorate(outgoing));
    } catch (e:any){
      console.error('Exchange action error', e); showError('Erreur action');
    }
  };

  const renderReq = ({ item }: { item: DecoratedExchange }) => {
    const isIncoming = !!myUid && item.toUserId === myUid;
    const isOutgoing = !!myUid && item.fromUserId === myUid;
    return (
      <View style={styles.reqCard}>
        <View style={styles.rowBetween}>
          <View style={{flex:1}}>
            <Text style={styles.reqTitle} numberOfLines={1}>{item.fromTitle || item.fromTicketId}</Text>
            <Ionicons name="swap-horizontal" size={16} color="#2196F3" style={{marginVertical:4}} />
            <Text style={styles.reqTitle} numberOfLines={1}>{item.toTitle || item.toTicketId}</Text>
          </View>
          <View style={[styles.statusBadge, {backgroundColor: item.status==='pending'? '#FFB300': (item.status==='accepted' || item.status==='completed') ? '#4CAF50' : '#9E9E9E'}]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        {item.message ? <Text style={styles.message} numberOfLines={2}>{item.message}</Text> : null}
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('fr-FR')}</Text>
        {myUid && (item.status === 'pending' || item.status === 'accepted') && (
          <View style={styles.actionsRow}>
            {isIncoming && item.status === 'pending' && (
              <>
                <TouchableOpacity style={[styles.smallBtn, {backgroundColor:'#4CAF50'}]} onPress={()=>actOn('accept', item.id!)}>
                  <Text style={styles.smallBtnText}>Accepter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.smallBtn, {backgroundColor:'#F44336'}]} onPress={()=>actOn('reject', item.id!)}>
                  <Text style={styles.smallBtnText}>Refuser</Text>
                </TouchableOpacity>
              </>
            )}
            {isOutgoing && item.status === 'pending' && (
              <TouchableOpacity style={[styles.smallBtn, {backgroundColor:'#9E9E9E'}]} onPress={()=>actOn('cancel', item.id!)}>
                <Text style={styles.smallBtnText}>Annuler</Text>
              </TouchableOpacity>
            )}
            {item.status === 'accepted' && (isIncoming || isOutgoing) && (
              <TouchableOpacity style={[styles.smallBtn, {backgroundColor:'#1976D2'}]} onPress={async ()=>{
                try { const res = await ExchangeService.complete(item.id!); if(!res.success) showError(res.error || 'Finalisation échouée'); } catch(e:any){ console.error(e); showError('Erreur finalisation'); }
              }}>
                <Text style={styles.smallBtnText}>Marquer comme échangé</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {!myUid && <Text style={{marginTop:6,color:'#a00',fontSize:11}}>Non connecté: actions cachées</Text>}
        {myUid && !(isIncoming || isOutgoing) && <Text style={{marginTop:6,color:'#a00',fontSize:11}}>Note: cette demande ne vous appartient pas (uid: {myUid?.slice?.(0,6)}…)</Text>}
      </View>
    );
  };

  if (loading) return (
    <View style={styles.center}> <ActivityIndicator size="large" color="#2196F3" /> <Text style={styles.loading}>Chargement échanges...</Text></View>
  );

  return (
    <View style={{flex:1}}>
      <FlatList
        ListHeaderComponent={
          <View>
            <Text style={styles.sectionTitle}>Entrantes ({incoming.length})</Text>
            {incoming.length===0 && <Text style={styles.empty}>Aucune demande entrante</Text>}
          </View>
        }
        data={[...incoming, ...outgoing.map(r=> ({...r, _out:true}))]}
        keyExtractor={(item)=> item.id!}
        renderItem={renderReq}
        ListFooterComponent={
          <View style={{marginTop:12}}>
            <Text style={styles.sectionTitle}>Sortantes ({outgoing.length})</Text>
            {outgoing.length===0 && <Text style={styles.empty}>Aucune demande sortante</Text>}
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center:{flex:1,alignItems:'center',justifyContent:'center',padding:24},
  loading:{marginTop:8,color:'#555'},
  list:{padding:16},
  sectionTitle:{fontSize:18,fontWeight:'700',marginVertical:12,color:'#333'},
  empty:{fontSize:14,color:'#777',marginBottom:12},
  reqCard:{backgroundColor:'white',padding:14,borderRadius:10,marginBottom:12,shadowColor:'#000',shadowOpacity:0.06,shadowOffset:{width:0,height:2},shadowRadius:4,elevation:2},
  rowBetween:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'},
  reqTitle:{fontSize:14,fontWeight:'600',color:'#333'},
  statusBadge:{paddingHorizontal:10,paddingVertical:4,borderRadius:12},
  statusText:{color:'white',fontSize:12,fontWeight:'600',textTransform:'capitalize'},
  message:{marginTop:6,fontSize:12,color:'#555'},
  date:{marginTop:6,fontSize:11,color:'#888'}
  ,actionsRow:{flexDirection:'row',marginTop:10,gap:8}
  ,smallBtn:{paddingVertical:6,paddingHorizontal:12,borderRadius:6}
  ,smallBtnText:{color:'white',fontSize:12,fontWeight:'600'}
});

export default ExchangesScreen;
