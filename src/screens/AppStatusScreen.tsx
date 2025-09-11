import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useGlobalToast } from '../contexts/ToastContext';
import { TicketService } from '../services/ticketService';

const AppStatusScreen = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useGlobalToast();
  const [stats, setStats] = useState({
    userTickets: 0,
    totalTickets: 0,
    loading: true
  });

  const loadStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      
      // Charger les statistiques
  const allTicketsResult = await TicketService.getPublicActiveTickets({ limit: 500 });
  const userTicketsResult = user ? await TicketService.getMyTickets() : { success: true, tickets: [] };
      
      setStats({
  userTickets: (userTicketsResult.tickets || []).length,
  totalTickets: (allTicketsResult.tickets || []).length,
        loading: false
      });
      
    } catch (error: any) {
      console.error('Erreur chargement stats:', error);
      showError(`Erreur: ${error.message}`);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadStats();
  }, [user]);

  const StatusCard = ({ icon, title, value, color }: any) => (
    <View style={[styles.statusCard, { borderLeftColor: color }]}>
      <View style={styles.statusHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statusTitle}>{title}</Text>
      </View>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="analytics" size={40} color="#2196F3" />
        <Text style={styles.headerTitle}>État de l'application</Text>
        <Text style={styles.headerSubtitle}>SwapStadium Dashboard</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Utilisateur</Text>
        <StatusCard
          icon="person"
          title="Statut"
          value={user ? `Connecté: ${user.displayName}` : 'Déconnecté'}
          color={user ? '#4CAF50' : '#F44336'}
        />
        <StatusCard
          icon="mail"
          title="Email"
          value={user?.email || 'Non connecté'}
          color="#2196F3"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎫 Billets</Text>
        {stats.loading ? (
          <Text style={styles.loadingText}>Chargement...</Text>
        ) : (
          <>
            <StatusCard
              icon="ticket"
              title="Mes billets"
              value={stats.userTickets}
              color="#FF9800"
            />
            <StatusCard
              icon="library"
              title="Total billets"
              value={stats.totalTickets}
              color="#9C27B0"
            />
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 Actions</Text>
        <TouchableOpacity style={styles.actionButton} onPress={loadStats}>
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.actionButtonText}>Actualiser</Text>
        </TouchableOpacity>
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
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statusCard: {
    borderLeftWidth: 4,
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  statusValue: {
    fontSize: 14,
    color: '#666',
    marginLeft: 34,
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default AppStatusScreen;
