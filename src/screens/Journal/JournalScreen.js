import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { colors, typography, spacing } from '../../constants/colors';
import { saveJournalEntry, getJournalByDate, getTodayMood } from '../../utils/storage';
import JournalHistory from '../../components/JournalHistory';

const JournalScreen = () => {
  const [journalText, setJournalText] = useState('');
  const [goodThing, setGoodThing] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showHistory, setShowHistory] = useState(false);
  const [todayMood, setTodayMood] = useState(null);
  const [isViewingPastEntry, setIsViewingPastEntry] = useState(false);

  useEffect(() => {
    loadJournalForDate(currentDate);
    loadTodayMood();
  }, []);

  useEffect(() => {
    loadJournalForDate(currentDate);
  }, [currentDate]);

  const loadJournalForDate = async (date) => {
    try {
      const dateKey = format(date, 'yyyy-MM-dd');
      const journal = await getJournalByDate(dateKey);
      
      if (journal) {
        setJournalText(journal.text || '');
        setGoodThing(journal.goodThing || '');
      } else {
        setJournalText('');
        setGoodThing('');
      }
      
      setHasChanges(false);
      setIsViewingPastEntry(!isToday(date));
    } catch (error) {
      console.error('Error loading journal for date:', error);
    }
  };

  const loadTodayMood = async () => {
    try {
      const mood = await getTodayMood();
      setTodayMood(mood);
    } catch (error) {
      console.error('Error loading today mood:', error);
    }
  };

  const isToday = (date) => {
    const today = new Date();
    return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  };

  const handleSave = async () => {
    if (!journalText.trim() && !goodThing.trim()) {
      Alert.alert('Error', 'Escribe algo antes de guardar');
      return;
    }

    if (isViewingPastEntry) {
      Alert.alert('Error', 'No puedes editar entradas de días anteriores');
      return;
    }

    const journalData = {
      text: journalText,
      goodThing: goodThing,
    };

    const success = await saveJournalEntry(journalData);
    
    if (success) {
      setHasChanges(false);
      Alert.alert('Guardado', 'Tu entrada de diario ha sido guardada');
    } else {
      Alert.alert('Error', 'No se pudo guardar la entrada');
    }
  };

  const handleTextChange = (text) => {
    if (isViewingPastEntry) return;
    setJournalText(text);
    setHasChanges(true);
  };

  const handleGoodThingChange = (text) => {
    if (isViewingPastEntry) return;
    setGoodThing(text);
    setHasChanges(true);
  };

  const handleSelectHistoryDate = (dateKey, journalEntry) => {
    const selectedDate = new Date(dateKey);
    setCurrentDate(selectedDate);
    
    if (journalEntry) {
      setJournalText(journalEntry.text || '');
      setGoodThing(journalEntry.goodThing || '');
    } else {
      setJournalText('');
      setGoodThing('');
    }
    
    setHasChanges(false);
    setIsViewingPastEntry(!isToday(selectedDate));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToPreviousDay = () => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setCurrentDate(prevDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // No permitir ir más allá de hoy
    if (nextDay <= new Date()) {
      setCurrentDate(nextDay);
    }
  };

  const getMoodColor = () => {
    if (!todayMood) return colors.textLight;
    
    switch (todayMood.value) {
      case 1: return colors.moodVeryBad;
      case 2: return colors.moodBad;
      case 3: return colors.moodNeutral;
      case 4: return colors.moodGood;
      case 5: return colors.moodGreat;
      default: return colors.textLight;
    }
  };

  const canGoToNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay <= new Date();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header con navegación de fechas */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Mi Diario Personal</Text>
            <TouchableOpacity 
              style={styles.historyButton}
              onPress={() => setShowHistory(true)}
            >
              <Ionicons name="calendar-outline" size={24} color={colors.primary} />
              <Text style={styles.historyButtonText}>Historial</Text>
            </TouchableOpacity>
          </View>

          {/* Navegación de fechas */}
          <View style={styles.dateNavigation}>
            <TouchableOpacity 
              style={styles.dateNavButton}
              onPress={goToPreviousDay}
            >
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dateInfo}
              onPress={() => setShowHistory(true)}
            >
              <Text style={[
                styles.dateText,
                isToday(currentDate) && styles.todayDateText
              ]}>
                {isToday(currentDate) 
                  ? 'Hoy' 
                  : format(currentDate, 'EEEE d', { locale: es })
                }
              </Text>
              <Text style={styles.fullDateText}>
                {format(currentDate, 'd MMMM yyyy', { locale: es })}
              </Text>
              {isViewingPastEntry && (
                <Text style={styles.pastEntryLabel}>Entrada anterior</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.dateNavButton,
                !canGoToNextDay() && styles.dateNavButtonDisabled
              ]}
              onPress={goToNextDay}
              disabled={!canGoToNextDay()}
            >
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={canGoToNextDay() ? colors.primary : colors.textLight} 
              />
            </TouchableOpacity>
          </View>

          {!isToday(currentDate) && (
            <TouchableOpacity 
              style={styles.todayButton}
              onPress={goToToday}
            >
              <Ionicons name="today-outline" size={16} color={colors.primary} />
              <Text style={styles.todayButtonText}>Ir a hoy</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Estado de ánimo del día (solo si es hoy) */}
        {isToday(currentDate) && todayMood && (
          <View style={styles.moodSection}>
            <View style={styles.moodIndicator}>
              <View style={[styles.moodDot, { backgroundColor: getMoodColor() }]} />
              <Text style={styles.moodText}>
                Tu ánimo de hoy: {todayMood.value}/5
              </Text>
            </View>
          </View>
        )}

        {/* Entrada principal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isToday(currentDate) ? '¿Cómo ha sido tu día?' : '¿Cómo fue tu día?'}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {isViewingPastEntry 
              ? 'Esta es una entrada anterior (solo lectura)'
              : 'Escribe libremente sobre tus pensamientos y sentimientos'
            }
          </Text>
          
          <TextInput
            style={[
              styles.journalInput,
              isViewingPastEntry && styles.readOnlyInput
            ]}
            placeholder={isViewingPastEntry ? 'No hay entrada para este día' : 'Hoy me siento...'}
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={8}
            value={journalText}
            onChangeText={handleTextChange}
            textAlignVertical="top"
            editable={!isViewingPastEntry}
          />
        </View>

        {/* Una cosa buena */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Una cosa buena de {isToday(currentDate) ? 'hoy' : 'ese día'}</Text>
          <Text style={styles.sectionSubtitle}>
            {isViewingPastEntry 
              ? 'Lo que destacaste como positivo ese día'
              : 'Aunque sea pequeña, ¿qué cosa positiva puedes destacar?'
            }
          </Text>
          
          <TextInput
            style={[
              styles.goodThingInput,
              isViewingPastEntry && styles.readOnlyInput
            ]}
            placeholder={isViewingPastEntry ? 'No hay cosa buena registrada' : 'Por ejemplo: Tomé agua, vi el sol, hablé con alguien...'}
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={3}
            value={goodThing}
            onChangeText={handleGoodThingChange}
            textAlignVertical="top"
            editable={!isViewingPastEntry}
          />
        </View>

        {/* Botón de guardar (solo si es el día actual) */}
        {!isViewingPastEntry && (
          <View style={styles.saveSection}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                hasChanges && styles.saveButtonActive,
              ]}
              onPress={handleSave}
            >
              <Ionicons 
                name="save-outline" 
                size={20} 
                color={colors.white} 
              />
              <Text style={styles.saveButtonText}>
                Guardar entrada
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Mensaje para entradas pasadas */}
        {isViewingPastEntry && (
          <View style={styles.pastEntryInfo}>
            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
            <Text style={styles.pastEntryInfoText}>
              Estás viendo una entrada anterior. Para editar, ve al día de hoy.
            </Text>
          </View>
        )}

        {/* Consejos compactos (solo si es hoy) */}
        {!isViewingPastEntry && (
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 Consejos para escribir</Text>
            <Text style={styles.tip}>• No hay respuestas correctas o incorrectas</Text>
            <Text style={styles.tip}>• Escribe como te sientas cómodo</Text>
            <Text style={styles.tip}>• Puedes escribir sobre emociones, eventos o pensamientos</Text>
            <Text style={styles.tip}>• Es solo para ti, sé honesto contigo mismo</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal de Historial */}
      <JournalHistory
        visible={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectDate={handleSelectHistoryDate}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Header mejorado
  header: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  historyButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },

  // Navegación de fechas
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 8,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  dateNavButton: {
    padding: 8,
    borderRadius: 8,
  },
  dateNavButtonDisabled: {
    opacity: 0.3,
  },
  dateInfo: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  todayDateText: {
    color: colors.primary,
  },
  fullDateText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  pastEntryLabel: {
    fontSize: typography.sizes.xs,
    color: colors.warning,
    fontWeight: typography.weights.medium,
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 4,
  },
  todayButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },

  // Mood section
  moodSection: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  moodIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  moodDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  moodText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },

  // Sections
  section: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  journalInput: {
    borderWidth: 1,
    borderColor: colors.background,
    borderRadius: 12,
    padding: 12,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    minHeight: 120,
    lineHeight: 22,
  },
  goodThingInput: {
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 12,
    padding: 12,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    backgroundColor: colors.white,
    minHeight: 80,
    lineHeight: 22,
  },
  readOnlyInput: {
    backgroundColor: colors.textLight + '10',
    borderColor: colors.textLight,
    color: colors.textSecondary,
  },

  // Save section
  saveSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: colors.textLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonActive: {
    backgroundColor: colors.primary,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },

  // Past entry info
  pastEntryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info + '20',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  pastEntryInfoText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.info,
  },

  // Tips section
  tipsSection: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  tipsTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  tip: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
});

export default JournalScreen;