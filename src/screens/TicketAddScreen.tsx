import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../hooks/useAuth';
import ticketService, { TicketFormData } from '../services/ticketService';

console.warn('📱 [TICKET-ADD] TicketAddScreen imported');

interface Props {
  navigation: any;
}

const TicketAddScreen: React.FC<Props> = ({ navigation }) => {
  console.warn('📱 [TICKET-ADD] TicketAddScreen rendering');

  const { user } = useAuth();

  // États pour le formulaire selon votre structure Firebase exacte
  const [formData, setFormData] = useState<TicketFormData>({
    title: '',
    homeTeam: '',
    awayTeam: '',
    competition: '',
    matchDate: new Date(),
    stadium: '',
    currentSection: '',
    currentRow: '',
    currentNumber: '',
    desiredSection: '',
    desiredRow: '',
    desiredNumber: '',
    description: '',
    exchangeType: 'seat',
    proximity: 'near',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchDateString, setMatchDateString] = useState('');

  // Fonction pour mettre à jour un champ du formulaire
  const updateField = (field: keyof TicketFormData, value: string | Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fonction pour parser la date
  const parseMatchDate = (dateString: string): Date => {
    try {
      // Format attendu: DD/MM/YYYY HH:mm
      if (dateString.includes('/')) {
        const [datePart, timePart = '20:00'] = dateString.split(' ');
        const [day, month, year] = datePart.split('/');
        const [hours, minutes] = timePart.split(':');
        return new Date(
          parseInt(year), 
          parseInt(month) - 1, 
          parseInt(day), 
          parseInt(hours), 
          parseInt(minutes)
        );
      }
      return new Date(dateString);
    } catch (error) {
      console.warn('⚠️ Date parsing error:', error);
      return new Date();
    }
  };

  // Mettre à jour la date du match
  const handleDateChange = (dateString: string) => {
    setMatchDateString(dateString);
    const parsedDate = parseMatchDate(dateString);
    updateField('matchDate', parsedDate);
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert('Erreur', 'Le titre est requis');
      return false;
    }
    if (!formData.homeTeam.trim() || !formData.awayTeam.trim()) {
      Alert.alert('Erreur', 'Les équipes sont requises');
      return false;
    }
    if (!formData.competition.trim()) {
      Alert.alert('Erreur', 'La compétition est requise');
      return false;
    }
    if (!matchDateString.trim()) {
      Alert.alert('Erreur', 'La date du match est requise');
      return false;
    }
    if (!formData.stadium.trim()) {
      Alert.alert('Erreur', 'Le stade est requis');
      return false;
    }
    if (!formData.currentSection.trim() || !formData.currentRow.trim() || !formData.currentNumber.trim()) {
      Alert.alert('Erreur', 'Les informations de la place actuelle sont requises');
      return false;
    }
    if (!formData.desiredSection.trim() || !formData.desiredRow.trim() || !formData.desiredNumber.trim()) {
      Alert.alert('Erreur', 'Les informations de la place désirée sont requises');
      return false;
    }
    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return false;
    }
    return true;
  };

  // Soumission du formulaire
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.warn('📱 [TICKET-ADD] Submitting ticket creation...', formData.title);
      
      const result = await ticketService.createTicket(formData, user);
      
      if (result.success) {
        console.warn('✅ [TICKET-ADD] Ticket created successfully:', result.ticketId);
        Alert.alert(
          'Succès',
          'Votre ticket a été créé avec succès ! Il sera visible après modération.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        console.warn('💥 [TICKET-ADD] Ticket creation failed:', result.error);
        Alert.alert('Erreur', result.error || 'Erreur lors de la création du ticket');
      }
    } catch (error: any) {
      console.warn('💥 [TICKET-ADD] Ticket creation error:', error);
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Créer un ticket d'échange</Text>
      
      {/* Titre du ticket */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations générales</Text>
        
        <Text style={styles.label}>Titre du ticket *</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(value) => updateField('title', value)}
          placeholder="Ex: Échange place PSG vs OM"
          placeholderTextColor="#999"
          maxLength={100}
        />
      </View>

      {/* Informations du match */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Match</Text>
        
        <Text style={styles.label}>Équipe à domicile *</Text>
        <TextInput
          style={styles.input}
          value={formData.homeTeam}
          onChangeText={(value) => updateField('homeTeam', value)}
          placeholder="Ex: Paris Saint-Germain"
          placeholderTextColor="#999"
        />
        
        <Text style={styles.label}>Équipe extérieure *</Text>
        <TextInput
          style={styles.input}
          value={formData.awayTeam}
          onChangeText={(value) => updateField('awayTeam', value)}
          placeholder="Ex: Olympique de Marseille"
          placeholderTextColor="#999"
        />
        
        <Text style={styles.label}>Compétition *</Text>
        <TextInput
          style={styles.input}
          value={formData.competition}
          onChangeText={(value) => updateField('competition', value)}
          placeholder="Ex: Ligue 1"
          placeholderTextColor="#999"
        />
        
        <Text style={styles.label}>Date et heure du match *</Text>
        <TextInput
          style={styles.input}
          value={matchDateString}
          onChangeText={handleDateChange}
          placeholder="Ex: 25/12/2024 20:00"
          placeholderTextColor="#999"
        />
        
        <Text style={styles.label}>Stade *</Text>
        <TextInput
          style={styles.input}
          value={formData.stadium}
          onChangeText={(value) => updateField('stadium', value)}
          placeholder="Ex: Parc des Princes"
          placeholderTextColor="#999"
        />
      </View>

      {/* Place actuelle */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Place actuelle</Text>
        
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Tribune *</Text>
            <TextInput
              style={styles.input}
              value={formData.currentSection}
              onChangeText={(value) => updateField('currentSection', value)}
              placeholder="Ex: Auteuil"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.flex1}>
            <Text style={styles.label}>Rangée *</Text>
            <TextInput
              style={styles.input}
              value={formData.currentRow}
              onChangeText={(value) => updateField('currentRow', value)}
              placeholder="Ex: K"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.flex1}>
            <Text style={styles.label}>Siège *</Text>
            <TextInput
              style={styles.input}
              value={formData.currentNumber}
              onChangeText={(value) => updateField('currentNumber', value)}
              placeholder="Ex: 15"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Place désirée */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Place désirée</Text>
        
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Tribune *</Text>
            <TextInput
              style={styles.input}
              value={formData.desiredSection}
              onChangeText={(value) => updateField('desiredSection', value)}
              placeholder="Ex: Boulogne"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.flex1}>
            <Text style={styles.label}>Rangée *</Text>
            <TextInput
              style={styles.input}
              value={formData.desiredRow}
              onChangeText={(value) => updateField('desiredRow', value)}
              placeholder="Ex: A"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.flex1}>
            <Text style={styles.label}>Siège *</Text>
            <TextInput
              style={styles.input}
              value={formData.desiredNumber}
              onChangeText={(value) => updateField('desiredNumber', value)}
              placeholder="Ex: 22"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Préférences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Préférences</Text>
        
        <Text style={styles.label}>Type d'échange</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.exchangeType}
            onValueChange={(value) => updateField('exchangeType', value)}
            style={styles.picker}
          >
            <Picker.Item label="Échange de siège" value="seat" />
            <Picker.Item label="Échange de tribune" value="section" />
            <Picker.Item label="Tout type d'échange" value="any" />
          </Picker>
        </View>
        
        <Text style={styles.label}>Proximité souhaitée</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.proximity}
            onValueChange={(value) => updateField('proximity', value)}
            style={styles.picker}
          >
            <Picker.Item label="Proche de ma place" value="near" />
            <Picker.Item label="Même tribune" value="same_section" />
            <Picker.Item label="Peu importe" value="any" />
          </Picker>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.label}>Description (optionnelle)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(value) => updateField('description', value)}
          placeholder="Ajoutez des détails sur votre demande d'échange..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          maxLength={500}
        />
      </View>

      {/* Bouton de soumission */}
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Création...' : 'Créer le ticket'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34495e',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2c3e50',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 4,
  },
  picker: {
    height: 50,
    color: '#2c3e50',
  },
  submitButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TicketAddScreen;
