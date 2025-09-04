import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useGlobalToast } from '../../contexts/ToastContext';
import { TicketService } from '../../services/ticketService';
import { Ticket } from '../../types';

const AddTicketScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { showSuccess, showError } = useGlobalToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    homeTeam: '',
    awayTeam: '',
    stadium: '',
    date: '',
    time: '',
    currentSection: '',
    currentRow: '',
    currentSeat: '',
    description: '',
    category: 'exchange' as 'exchange' | 'giveaway',
    wantedSection: '',
    wantedRow: '',
    wantedSeat: '',
    price: '',
  });

  const handleSave = async () => {
    // Validation des champs obligatoires
    if (!formData.homeTeam || !formData.awayTeam || !formData.stadium || !formData.date) {
      showError('❌ Veuillez remplir tous les champs obligatoires (équipes, stade, date)');
      return;
    }

    // Validation des places actuelles
    if (!formData.currentSection || !formData.currentRow || !formData.currentSeat) {
      showError('❌ Veuillez renseigner votre place actuelle (section, rangée, siège)');
      return;
    }

    // Validation spéciale pour les échanges
    if (formData.category === 'exchange' && (!formData.wantedSection || !formData.wantedRow || !formData.wantedSeat)) {
      showError('❌ Pour un échange, veuillez renseigner la place souhaitée (section, rangée, siège)');
      return;
    }

    // Validation de la date
    const matchDate = new Date(formData.date.split('/').reverse().join('-'));
    if (isNaN(matchDate.getTime()) || matchDate < new Date()) {
      showError('❌ Veuillez entrer une date valide dans le futur');
      return;
    }

    if (!user) {
      showError('❌ Vous devez être connecté pour publier un billet');
      return;
    }

    try {
      setLoading(true);

      // Construire l'objet ticket
      const baseTicketData = {
        title: `${formData.homeTeam} vs ${formData.awayTeam}`,
        match: {
          homeTeam: formData.homeTeam.trim(),
          awayTeam: formData.awayTeam.trim(),
          stadium: formData.stadium.trim(),
          date: matchDate,
          competition: 'Ligue 1' // Valeur par défaut
        },
        currentSeat: {
          section: formData.currentSection.trim(),
          row: formData.currentRow.trim(),
          number: formData.currentSeat.trim()
        },
        description: formData.description.trim(),
        category: formData.category,
        userId: user.id,
        userName: user.displayName || 'Utilisateur',
        userRating: 4.5, // Note par défaut pour nouveaux utilisateurs
        status: 'active' as const,
        moderationStatus: 'pending' as const,
        images: [], // Pour l'instant pas d'images
        preferences: {
          exchangeType: 'any' as const,
          proximity: 'any' as const
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expire dans 30 jours
      };

      // Ajouter desiredSeat seulement pour les échanges
      const ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'> = {
        ...baseTicketData,
        ...(formData.category === 'exchange' && formData.wantedSection ? {
          desiredSeat: {
            section: formData.wantedSection.trim(),
            row: formData.wantedRow.trim(),
            number: formData.wantedSeat.trim()
          }
        } : {})
      };

      console.log('🎫 Données du billet à créer:', ticketData);

      const ticketId = await TicketService.createTicket(ticketData);
      
      showSuccess(`🎉 Billet publié avec succès !\n\nVotre annonce "${formData.homeTeam} vs ${formData.awayTeam}" est en cours de modération et sera visible sous peu.`);
      
      // Réinitialiser le formulaire
      setFormData({
        homeTeam: '',
        awayTeam: '',
        stadium: '',
        date: '',
        time: '',
        currentSection: '',
        currentRow: '',
        currentSeat: '',
        description: '',
        category: 'exchange',
        wantedSection: '',
        wantedRow: '',
        wantedSeat: '',
        price: '',
      });
      
      // Retourner à l'écran précédent après un délai
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
      
    } catch (error: any) {
      console.error('Erreur lors de la création du billet:', error);
      showError(`❌ Erreur lors de la publication: ${error.message || 'Veuillez réessayer'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Informations du match</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Équipe domicile *</Text>
          <TextInput
            style={styles.input}
            value={formData.homeTeam}
            onChangeText={(text) => setFormData({ ...formData, homeTeam: text })}
            placeholder="Ex: Paris Saint-Germain"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Équipe visiteur *</Text>
          <TextInput
            style={styles.input}
            value={formData.awayTeam}
            onChangeText={(text) => setFormData({ ...formData, awayTeam: text })}
            placeholder="Ex: Olympique de Marseille"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Stade *</Text>
          <TextInput
            style={styles.input}
            value={formData.stadium}
            onChangeText={(text) => setFormData({ ...formData, stadium: text })}
            placeholder="Ex: Parc des Princes"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
              placeholder="JJ/MM/AAAA"
            />
          </View>
          
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.label}>Heure</Text>
            <TextInput
              style={styles.input}
              value={formData.time}
              onChangeText={(text) => setFormData({ ...formData, time: text })}
              placeholder="HH:MM"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Place actuelle</Text>
        
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Section *</Text>
            <TextInput
              style={styles.input}
              value={formData.currentSection}
              onChangeText={(text) => setFormData({ ...formData, currentSection: text })}
              placeholder="Ex: Tribune Paris"
            />
          </View>
          
          <View style={[styles.inputGroup, { flex: 1, marginHorizontal: 5 }]}>
            <Text style={styles.label}>Rangée</Text>
            <TextInput
              style={styles.input}
              value={formData.currentRow}
              onChangeText={(text) => setFormData({ ...formData, currentRow: text })}
              placeholder="Ex: 12"
            />
          </View>
          
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.label}>Siège</Text>
            <TextInput
              style={styles.input}
              value={formData.currentSeat}
              onChangeText={(text) => setFormData({ ...formData, currentSeat: text })}
              placeholder="Ex: 15"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Place souhaitée (pour échange)</Text>
        
        {formData.category === 'exchange' && (
          <>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Section souhaitée</Text>
                <TextInput
                  style={styles.input}
                  value={formData.wantedSection}
                  onChangeText={(text) => setFormData({ ...formData, wantedSection: text })}
                  placeholder="Ex: Tribune Boulogne"
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginHorizontal: 5 }]}>
                <Text style={styles.label}>Rangée</Text>
                <TextInput
                  style={styles.input}
                  value={formData.wantedRow}
                  onChangeText={(text) => setFormData({ ...formData, wantedRow: text })}
                  placeholder="Ex: 10"
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Siège</Text>
                <TextInput
                  style={styles.input}
                  value={formData.wantedSeat}
                  onChangeText={(text) => setFormData({ ...formData, wantedSeat: text })}
                  placeholder="Ex: 20"
                />
              </View>
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#2196F3" />
              <Text style={styles.infoText}>
                Laissez vide si vous acceptez n'importe quelle place en échange
              </Text>
            </View>
          </>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Décrivez votre billet et vos préférences d'échange..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <Text style={styles.sectionTitle}>Type d'annonce</Text>
        
        <View style={styles.categoryContainer}>
          <TouchableOpacity 
            style={[styles.categoryOption, formData.category === 'exchange' && styles.selectedCategory]}
            onPress={() => setFormData({ ...formData, category: 'exchange' })}
          >
            <Ionicons 
              name="swap-horizontal" 
              size={24} 
              color={formData.category === 'exchange' ? 'white' : '#2196F3'} 
            />
            <Text style={[styles.categoryText, formData.category === 'exchange' && styles.selectedCategoryText]}>
              Échange
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.categoryOption, formData.category === 'giveaway' && styles.selectedCategory]}
            onPress={() => setFormData({ ...formData, category: 'giveaway' })}
          >
            <Ionicons 
              name="gift" 
              size={24} 
              color={formData.category === 'giveaway' ? 'white' : '#4CAF50'} 
            />
            <Text style={[styles.categoryText, formData.category === 'giveaway' && styles.selectedCategoryText]}>
              Don
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Publier le billet</Text>
          )}
        </TouchableOpacity>

        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={20} color="#FF9800" />
          <Text style={styles.warningText}>
            Votre annonce sera vérifiée par notre équipe avant publication
          </Text>
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
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  categoryOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  selectedCategory: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedCategoryText: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    color: '#1976D2',
    fontSize: 12,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  warningText: {
    flex: 1,
    marginLeft: 10,
    color: '#E65100',
    fontSize: 12,
  },
});

export default AddTicketScreen;
