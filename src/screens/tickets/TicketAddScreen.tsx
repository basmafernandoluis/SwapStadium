import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TicketService, CreateTicketData, Seat, Match } from '../../services/ticketService';

interface TicketAddScreenProps {
  navigation: any;
}

const TicketAddScreen: React.FC<TicketAddScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  
  // États pour le formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Match info
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [competition, setCompetition] = useState('');
  const [stadium, setStadium] = useState('');
  const [matchDate, setMatchDate] = useState('');
  
  // Current seat
  const [currentSection, setCurrentSection] = useState('');
  const [currentRow, setCurrentRow] = useState('');
  const [currentNumber, setCurrentNumber] = useState('');
  
  // Desired seat
  const [desiredSection, setDesiredSection] = useState('');
  const [desiredRow, setDesiredRow] = useState('');
  const [desiredNumber, setDesiredNumber] = useState('');
  
  // Preferences
  const [preferences, setPreferences] = useState('');

  const validateForm = (): string | null => {
    if (!title.trim()) return 'Le titre est obligatoire';
    if (!homeTeam.trim()) return 'L\'équipe domicile est obligatoire';
    if (!awayTeam.trim()) return 'L\'équipe extérieure est obligatoire';
    if (!competition.trim()) return 'La compétition est obligatoire';
    if (!stadium.trim()) return 'Le stade est obligatoire';
    if (!matchDate.trim()) return 'La date du match est obligatoire';
    if (!currentSection.trim()) return 'La section actuelle est obligatoire';
    if (!currentRow.trim()) return 'La rangée actuelle est obligatoire';
    if (!currentNumber.trim()) return 'Le numéro de place actuel est obligatoire';
    if (!desiredSection.trim()) return 'La section désirée est obligatoire';
    if (!desiredRow.trim()) return 'La rangée désirée est obligatoire';
    if (!desiredNumber.trim()) return 'Le numéro de place désiré est obligatoire';
    
    return null;
  };

  const parseDate = (dateStr: string): Date => {
    // Format attendu: DD/MM/YYYY HH:mm ou DD/MM/YYYY
    try {
      if (dateStr.includes('/')) {
        const [datePart, timePart] = dateStr.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hours, minutes] = (timePart || '20:00').split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes);
      }
      return new Date(dateStr);
    } catch (error) {
      console.error('Erreur parsing date:', error);
      return new Date();
    }
  };

  const handleSubmit = async () => {
    const validation = validateForm();
    if (validation) {
      Alert.alert('Erreur', validation);
      return;
    }

    setLoading(true);

    try {
      const currentSeat: Seat = {
        section: currentSection.trim(),
        row: currentRow.trim(),
        number: parseInt(currentNumber.trim()) || 0,
      };

      const desiredSeat: Seat = {
        section: desiredSection.trim(),
        row: desiredRow.trim(),
        number: parseInt(desiredNumber.trim()) || 0,
      };

      const match: Match = {
        homeTeam: homeTeam.trim(),
        awayTeam: awayTeam.trim(),
        competition: competition.trim(),
        stadium: stadium.trim(),
        date: parseDate(matchDate),
      };

      const ticketData: CreateTicketData = {
        title: title.trim(),
        description: description.trim(),
        category: 'exchange', // Par défaut
        currentSeat,
        desiredSeat,
        match,
        expiresAt: new Date(match.date.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 jours après le match
        preferences: preferences.trim() ? [preferences.trim()] : [],
      };

      const result = await TicketService.createTicket(ticketData);

      if (result.success) {
        Alert.alert(
          'Succès',
          'Votre ticket d\'échange a été créé avec succès!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Erreur', result.error || 'Erreur lors de la création du ticket');
      }
    } catch (error) {
      console.error('Erreur création ticket:', error);
      Alert.alert('Erreur', 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau Ticket</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Informations générales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations générales</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Titre *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: PSG vs Marseille - Échange place"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Décrivez votre demande d'échange..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Informations du match */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Match</Text>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Équipe domicile *</Text>
                <TextInput
                  style={styles.input}
                  value={homeTeam}
                  onChangeText={setHomeTeam}
                  placeholder="Ex: PSG"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Équipe extérieure *</Text>
                <TextInput
                  style={styles.input}
                  value={awayTeam}
                  onChangeText={setAwayTeam}
                  placeholder="Ex: Marseille"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Compétition *</Text>
              <TextInput
                style={styles.input}
                value={competition}
                onChangeText={setCompetition}
                placeholder="Ex: Ligue 1, Champions League..."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Stade *</Text>
              <TextInput
                style={styles.input}
                value={stadium}
                onChangeText={setStadium}
                placeholder="Ex: Parc des Princes"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date et heure *</Text>
              <TextInput
                style={styles.input}
                value={matchDate}
                onChangeText={setMatchDate}
                placeholder="Ex: 15/09/2025 20:00"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Place actuelle */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ma place actuelle</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Section *</Text>
              <TextInput
                style={styles.input}
                value={currentSection}
                onChangeText={setCurrentSection}
                placeholder="Ex: Tribune Auteuil"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Rangée *</Text>
                <TextInput
                  style={styles.input}
                  value={currentRow}
                  onChangeText={setCurrentRow}
                  placeholder="Ex: K"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Numéro *</Text>
                <TextInput
                  style={styles.input}
                  value={currentNumber}
                  onChangeText={setCurrentNumber}
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
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Section *</Text>
              <TextInput
                style={styles.input}
                value={desiredSection}
                onChangeText={setDesiredSection}
                placeholder="Ex: Tribune Présidentielle"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Rangée *</Text>
                <TextInput
                  style={styles.input}
                  value={desiredRow}
                  onChangeText={setDesiredRow}
                  placeholder="Ex: A"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Numéro *</Text>
                <TextInput
                  style={styles.input}
                  value={desiredNumber}
                  onChangeText={setDesiredNumber}
                  placeholder="Ex: 10"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Préférences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Préférences</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Commentaire</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={preferences}
                onChangeText={setPreferences}
                placeholder="Précisez vos préférences d'échange..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={2}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Créer le ticket</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TicketAddScreen;
