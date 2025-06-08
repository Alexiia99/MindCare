import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography, spacing } from '../../constants/colors';
import { saveMoodEntry, getTodayMood } from '../../utils/storage';

const emotions = [
  { id: 'happy', label: 'Feliz', icon: 'happy-outline' },
  { id: 'sad', label: 'Triste', icon: 'sad-outline' },
  { id: 'anxious', label: 'Ansioso', icon: 'alert-circle-outline' },
  { id: 'tired', label: 'Cansado', icon: 'bed-outline' },
  { id: 'angry', label: 'Enfadado', icon: 'flame-outline' },
  { id: 'calm', label: 'Tranquilo', icon: 'leaf-outline' },
  { id: 'excited', label: 'Emocionado', icon: 'flash-outline' },
  { id: 'lonely', label: 'Solo', icon: 'person-outline' },
];

const energyLevels = [
  { id: 1, label: 'Muy baja', color: colors.moodVeryBad },
  { id: 2, label: 'Baja', color: colors.moodBad },
  { id: 3, label: 'Normal', color: colors.moodNeutral },
  { id: 4, label: 'Alta', color: colors.moodGood },
];

const MoodScreen = ({ navigation }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [energyLevel, setEnergyLevel] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadTodayMood();
  }, []);

  const loadTodayMood = async () => {
    try {
      const todayMood = await getTodayMood();
      if (todayMood) {
        setSelectedMood(todayMood.value);
        setSelectedEmotions(todayMood.emotions || []);
        setEnergyLevel(todayMood.energy);
        setNotes(todayMood.notes || '');
      }
    } catch (error) {
      console.error('Error loading today mood:', error);
    }
  };

  const getMoodIcon = (value) => {
    const icons = {
      1: 'sad',
      2: 'sad-outline',
      3: 'remove-circle-outline',
      4: 'happy-outline',
      5: 'happy',
    };
    return icons[value] || 'help-outline';
  };

  const getMoodColor = (value) => {
    const colors_map = {
      1: colors.moodVeryBad,
      2: colors.moodBad,
      3: colors.moodNeutral,
      4: colors.moodGood,
      5: colors.moodGreat,
    };
    return colors_map[value] || colors.textLight;
  };

  const getMoodLabel = (value) => {
    const labels = {
      1: 'Muy bajo',
      2: 'Bajo',
      3: 'Neutral',
      4: 'Bueno',
      5: 'Muy bueno',
    };
    return labels[value] || '';
  };

  const toggleEmotion = (emotionId) => {
    setSelectedEmotions(prev => {
      if (prev.includes(emotionId)) {
        return prev.filter(id => id !== emotionId);
      } else {
        return [...prev, emotionId];
      }
    });
  };

  const handleSave = async () => {
    if (!selectedMood) {
      Alert.alert('Error', 'Por favor selecciona tu estado de ánimo general');
      return;
    }

    const moodData = {
      value: selectedMood,
      emotions: selectedEmotions,
      energy: energyLevel,
      notes: notes,
    };

    const success = await saveMoodEntry(moodData);
    
    if (success) {
      Alert.alert(
        'Guardado',
        'Tu estado de ánimo ha sido registrado correctamente',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Error', 'No se pudo guardar el estado de ánimo');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Selector de ánimo general */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Cómo te sientes hoy?</Text>
          <Text style={styles.sectionSubtitle}>Estado general (1-5)</Text>
          
          <View style={styles.moodSelector}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.moodButton,
                  { backgroundColor: getMoodColor(value) },
                  selectedMood === value && styles.selectedMoodButton,
                ]}
                onPress={() => setSelectedMood(value)}
              >
                <Ionicons
                  name={getMoodIcon(value)}
                  size={32}
                  color={colors.white}
                />
                <Text style={styles.moodButtonText}>{value}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {selectedMood && (
            <Text style={styles.selectedMoodText}>
              {getMoodLabel(selectedMood)}
            </Text>
          )}
        </View>

        {/* Selector de emociones específicas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Qué emociones sientes?</Text>
          <Text style={styles.sectionSubtitle}>Puedes seleccionar varias</Text>
          
          <View style={styles.emotionsGrid}>
            {emotions.map((emotion) => (
              <TouchableOpacity
                key={emotion.id}
                style={[
                  styles.emotionChip,
                  selectedEmotions.includes(emotion.id) && styles.selectedEmotionChip,
                ]}
                onPress={() => toggleEmotion(emotion.id)}
              >
                <Ionicons
                  name={emotion.icon}
                  size={20}
                  color={selectedEmotions.includes(emotion.id) ? colors.white : colors.primary}
                />
                <Text style={[
                  styles.emotionChipText,
                  selectedEmotions.includes(emotion.id) && styles.selectedEmotionChipText,
                ]}>
                  {emotion.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selector de nivel de energía */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Cómo está tu energía?</Text>
          
          <View style={styles.energySelector}>
            {energyLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.energyButton,
                  { borderColor: level.color },
                  energyLevel === level.id && { backgroundColor: level.color },
                ]}
                onPress={() => setEnergyLevel(level.id)}
              >
                <Text style={[
                  styles.energyButtonText,
                  energyLevel === level.id && styles.selectedEnergyButtonText,
                ]}>
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Botón de guardar */}
        <View style={styles.saveSection}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              !selectedMood && styles.disabledSaveButton,
            ]}
            onPress={handleSave}
            disabled={!selectedMood}
          >
            <Text style={styles.saveButtonText}>
              Guardar estado de ánimo
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // CONTENEDOR PRINCIPAL
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // SCROLL CONTENT OPTIMIZADO
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 85 : 75,
  },
  
  // SECTION OPTIMIZADA
  section: {
    paddingHorizontal: 16, // REDUCIDO
    paddingVertical: 10, // REDUCIDO
  },
  
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 2, // REDUCIDO
  },
  
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: 12, // REDUCIDO
  },
  
  // MOOD SELECTOR OPTIMIZADO
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8, // REDUCIDO
  },
  
  moodButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  
  selectedMoodButton: {
    transform: [{ scale: 1.1 }],
    elevation: 4,
    shadowOpacity: 0.3,
  },
  
  moodButtonText: {
    color: colors.white,
    fontWeight: typography.weights.bold,
    marginTop: 2, // REDUCIDO
  },
  
  selectedMoodText: {
    textAlign: 'center',
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginTop: 8, // REDUCIDO
  },
  
  // EMOTIONS GRID OPTIMIZADO
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6, // REDUCIDO
  },
  
  emotionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 10, // REDUCIDO
    paddingVertical: 6, // REDUCIDO
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  
  selectedEmotionChip: {
    backgroundColor: colors.primary,
  },
  
  emotionChipText: {
    marginLeft: 4, // REDUCIDO
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  
  selectedEmotionChipText: {
    color: colors.white,
  },
  
  // ENERGY SELECTOR OPTIMIZADO
  energySelector: {
    gap: 6, // REDUCIDO
  },
  
  energyButton: {
    backgroundColor: colors.white,
    padding: 12, // REDUCIDO
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  
  energyButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  
  selectedEnergyButtonText: {
    color: colors.white,
  },
  
  // SAVE SECTION OPTIMIZADA
  saveSection: {
    paddingHorizontal: 16, // REDUCIDO
    paddingVertical: 10, // REDUCIDO
  },
  
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12, // REDUCIDO
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  
  disabledSaveButton: {
    backgroundColor: colors.textLight,
    elevation: 0,
    shadowOpacity: 0,
  },
  
  saveButtonText: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
});

export default MoodScreen;