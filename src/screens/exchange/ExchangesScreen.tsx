import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExchangeService, ExchangeRequest } from '../../services/exchangeService';
import { AuthService } from '../../services/authService';
import { TicketService, Ticket } from '../../services/ticketService';
import { useGlobalToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';

interface DecoratedExchange extends ExchangeRequest { fromTitle?: string; toTitle?: string; selectedFromTitle?: string; }

const ExchangesScreen: React.FC = () => {
  const { user } = useAuth();
  const myUid = (user as any)?.uid || (user as any)?.id || AuthService.getCurrentUser()?.uid || null;
  const { showError } = useGlobalToast();
  const [incoming, setIncoming] = useState<DecoratedExchange[]>([]);
  const [outgoing, setOutgoing] = useState<DecoratedExchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectVisible, setSelectVisible] = useState(false);
  const [selectingFor, setSelectingFor] = useState<ExchangeRequest | null>(null);
  const [requesterActiveTickets, setRequesterActiveTickets] = useState<Ticket[]>([]);
  const [selectedFromId, setSelectedFromId] = useState<string | null>(null);

  const decorate = async (reqs: ExchangeRequest[]): Promise<DecoratedExchange[]> => {
    const map: Record<string,string> = {};
  const needIds = Array.from(new Set(reqs.flatMap(r => [r.fromTicketId, r.toTicketId, r.selectedFromTicketId].filter(Boolean) as string[])));
    await Promise.all(needIds.map(async id => {
      try { const t = await TicketService.getTicketById(id); if(t?.id) map[id]=t.title || `${t.match.homeTeam} vs ${t.match.awayTeam}`; } catch(e){}
    }));
  return reqs.map(r => ({ ...r, fromTitle: map[r.fromTicketId], toTitle: map[r.toTicketId], selectedFromTitle: r.selectedFromTicketId ? map[r.selectedFromTicketId] : undefined }));
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

  const openSelectForAccept = async (req: ExchangeRequest) => {
    try {
      const list = await TicketService.getUserActiveTickets(req.fromUserId);
      if (!list.success) { showError(list.error || 'Impossible de charger'); return; }
      const tickets = list.tickets || [];
      if (!tickets.length) { showError("L'utilisateur n'a aucun billet actif"); return; }
      setRequesterActiveTickets(tickets);
      setSelectedFromId(tickets[0]?.id || null);
      setSelectingFor(req);
      setSelectVisible(true);
    } catch (e:any) {
      console.error('openSelectForAccept error', e);
      showError('Erreur de chargement');
    }
  };

  const confirmAcceptWithSelection = async () => {
    if (!selectingFor || !selectedFromId) return;
    try {
      const res = await ExchangeService.acceptWithSelection(selectingFor.id!, selectedFromId);
      if (!res.success) showError(res.error || 'Acceptation échouée');
      setSelectVisible(false);
      setSelectingFor(null);
      setSelectedFromId(null);
    } catch (e:any) {
      console.error('confirmAcceptWithSelection error', e);
      showError('Erreur d\'acceptation');
    }
  };

  const renderReq = ({ item }: { item: DecoratedExchange }) => {
    const isIncoming = !!myUid && item.toUserId === myUid;
    const isOutgoing = !!myUid && item.fromUserId === myUid;
    return (
      <View style={styles.reqCard}>
        <View style={styles.rowBetween}>
          <View style={{flex:1}}>
            <Text style={styles.reqTitle} numberOfLines={1}>{item.selectedFromTitle || item.fromTitle || item.fromTicketId}</Text>
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
                <TouchableOpacity style={[styles.smallBtn, {backgroundColor:'#4CAF50'}]} onPress={()=>openSelectForAccept(item)}>
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
              <>
                {isOutgoing && (
                  <TouchableOpacity style={[styles.smallBtn, {backgroundColor:'#9E9E9E'}]} onPress={()=>actOn('cancel', item.id!)}>
                    <Text style={styles.smallBtnText}>Annuler</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.smallBtn, {backgroundColor:'#1976D2'}]} onPress={async ()=>{
                  try { const res = await (ExchangeService as any).confirmComplete?.(item.id!); if(!res?.success) showError(res?.error || 'Confirmation échouée'); } catch(e:any){ console.error(e); showError('Erreur confirmation'); }
                }}>
                  <Text style={styles.smallBtnText}>Je confirme l'échange</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
        {item.status === 'accepted' && (
          <View style={styles.confirmBanner}>
            <View style={styles.confirmHeader}>
              <Ionicons name="shield-checkmark" size={18} color="#0ea5e9" />
              <Text style={styles.confirmTitle}>Confirmation en 2 étapes</Text>
            </View>
            {(() => {
              const amFrom = myUid ? (item.fromUserId === myUid) : false;
              const myDone = amFrom ? !!item.fromCompletedConfirmed : !!item.toCompletedConfirmed;
              const otherDone = amFrom ? !!item.toCompletedConfirmed : !!item.fromCompletedConfirmed;
              return (
                <>
                  <View style={styles.confirmRow}>
                    <Ionicons name={myDone ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={myDone ? '#16a34a' : '#64748b'} />
                    <Text style={[styles.confirmText, myDone && styles.confirmTextDone]}>Votre confirmation {myDone ? '(confirmée)' : '(en attente)'}</Text>
                  </View>
                  <View style={styles.confirmRow}>
                    <Ionicons name={otherDone ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={otherDone ? '#16a34a' : '#64748b'} />
                    <Text style={[styles.confirmText, otherDone && styles.confirmTextDone]}>Confirmation de l'autre partie {otherDone ? '(confirmée)' : '(en attente)'}</Text>
                  </View>
                  {!!item.selectedFromTicketId && (
                    <View style={styles.confirmRow}>
                      <Ionicons name="pricetag" size={16} color="#0369a1" />
                      <Text style={styles.confirmText}>Billet choisi par le destinataire: <Text style={{fontWeight:'700'}}>{item.selectedFromTitle || item.selectedFromTicketId}</Text></Text>
                    </View>
                  )}
                  <Text style={styles.confirmHint}>L'échange sera finalisé automatiquement lorsque les deux auront confirmé.</Text>
                </>
              );
            })()}
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
      {/* Modal de sélection du billet du demandeur */}
      <Modal visible={selectVisible} animationType="slide" transparent onRequestClose={()=>setSelectVisible(false)}>
        <View style={mstyles.overlay}>
          <View style={mstyles.card}>
            <Text style={mstyles.title}>Choisir le billet du demandeur</Text>
            <ScrollView style={{maxHeight: 320}}>
              {requesterActiveTickets.map(t => (
                <TouchableOpacity key={t.id} style={[mstyles.option, selectedFromId===t.id && mstyles.optionSelected]} onPress={()=>setSelectedFromId(t.id!)}>
                  <View style={{flex:1}}>
                    <Text style={mstyles.optTitle}>{t.title}</Text>
                    <Text style={mstyles.optSub}>{t.match.homeTeam} vs {t.match.awayTeam}</Text>
                    <Text style={mstyles.optSub}>Section {t.currentSeat.section} • Rangée {t.currentSeat.row} • Place {String((t.currentSeat as any).number)}</Text>
                  </View>
                  <View style={[mstyles.radio, selectedFromId===t.id && mstyles.radioSel]} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={{flexDirection:'row', gap: 12, marginTop: 10}}>
              <TouchableOpacity style={[styles.smallBtn, {backgroundColor:'#9E9E9E'}]} onPress={()=>setSelectVisible(false)}>
                <Text style={styles.smallBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallBtn, {backgroundColor:'#4CAF50', opacity: selectedFromId?1:0.5}]} disabled={!selectedFromId} onPress={confirmAcceptWithSelection}>
                <Text style={styles.smallBtnText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  ,confirmBanner:{marginTop:8,backgroundColor:'#f0f9ff',borderRadius:10,padding:12,borderWidth:1,borderColor:'#bae6fd'}
  ,confirmHeader:{flexDirection:'row',alignItems:'center',marginBottom:8}
  ,confirmTitle:{fontSize:14,fontWeight:'700',color:'#0c4a6e',marginLeft:6}
  ,confirmRow:{flexDirection:'row',alignItems:'center',gap:8,paddingVertical:4}
  ,confirmText:{fontSize:12,color:'#334155'}
  ,confirmTextDone:{color:'#065f46',fontWeight:'700'}
  ,confirmHint:{marginTop:6,fontSize:11,color:'#475569'}
});

export default ExchangesScreen;

const mstyles = StyleSheet.create({
  overlay:{flex:1,backgroundColor:'rgba(0,0,0,0.35)',justifyContent:'flex-end'},
  card:{backgroundColor:'white',padding:16,borderTopLeftRadius:16,borderTopRightRadius:16,shadowColor:'#000',shadowOpacity:0.2,shadowRadius:8,elevation:8},
  title:{fontSize:18,fontWeight:'700',color:'#111',marginBottom:8},
  option:{flexDirection:'row',alignItems:'center',paddingVertical:12,paddingHorizontal:8,borderRadius:10,backgroundColor:'#f8f9fa',marginBottom:8},
  optionSelected:{borderWidth:2,borderColor:'#2196F3',backgroundColor:'#eef6ff'},
  optTitle:{fontSize:15,fontWeight:'700',color:'#111'},
  optSub:{fontSize:12,color:'#555',marginTop:2},
  radio:{width:18,height:18,borderRadius:9,borderWidth:2,borderColor:'#999',backgroundColor:'white',marginLeft:12},
  radioSel:{borderColor:'#2196F3',backgroundColor:'#2196F3'}
});
