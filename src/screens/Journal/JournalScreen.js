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

import { colors, typography, spacing } from '../../constants/colors';
import { saveJournalEntry, getTodayJournal } from '../../utils/storage';

const JournalScreen = () => {
  const [journalText, setJournalText] = useState('');
  const [goodThing, setGoodThing] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadTodayJournal();
  }, []);

  const loadTodayJournal = async () => {
    try {
      const todayJournal = await getTodayJournal();
      if (todayJournal) {
        setJournalText(todayJournal.text || '');
        setGoodThing(todayJournal.goodThing || '');
      }
    } catch (error) {
      console.error('Error loading today journal:', error);
    }
  };

  const handleSave = async () => {
    if (!journalText.trim() && !goodThing.trim()) {
      Alert.alert('Error', 'Escribe algo antes de guardar');
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
    setJournalText(text);
    setHasChanges(true);
  };

  const handleGoodThingChange = (text) => {
    setGoodThing(text);
    setHasChanges(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header compacto */}
        <View style={styles.header}>
          <Text style={styles.title}>Mi Diario Personal</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>

        {/* Entrada principal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Cómo ha sido tu día?</Text>
          <Text style={styles.sectionSubtitle}>
            Escribe libremente sobre tus pensamientos y sentimientos
          </Text>
          
          <TextInput
            style={styles.journalInput}
            placeholder="Hoy me siento..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={8}
            value={journalText}
            onChangeText={handleTextChange}
            textAlignVertical="top"
          />
        </View>

        {/* Una cosa buena */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Una cosa buena de hoy</Text>
          <Text style={styles.sectionSubtitle}>
            Aunque sea pequeña, ¿qué cosa positiva puedes destacar?
          </Text>
          
          <TextInput
            style={styles.goodThingInput}
            placeholder="Por ejemplo: Tomé agua, vi el sol, hablé con alguien..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={3}
            value={goodThing}
            onChangeText={handleGoodThingChange}
            textAlignVertical="top"
          />
        </View>

        {/* Botón de guardar */}
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

        {/* Consejos compactos */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Consejos para escribir</Text>
          <Text style={styles.tip}>• No hay respuestas correctas o incorrectas</Text>
          <Text style={styles.tip}>• Escribe como te sientas cómodo</Text>
          <Text style={styles.tip}>• Puedes escribir sobre emociones, eventos o pensamientos</Text>
          <Text style={styles.tip}>• Es solo para ti, sé honesto contigo mismo</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100, // Mantener para que no se tape con navbar, pero el contenido interno será más compacto
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 4, // Muy reducido
    paddingBottom: 8, // Muy reducido
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 4, // Reducido
  },
  date: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 8, // Muy reducido
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
    marginBottom: 4, // Reducido
  },
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: 8, // Muy reducido
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
  saveSection: {
    paddingHorizontal: 16,
    marginBottom: 8, // Muy reducido
  },
  saveButton: {
    backgroundColor: colors.textLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14, // Reducido ligeramente
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
  tipsSection: {
    marginHorizontal: 16,
    marginBottom: 8, // Muy reducido
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
    marginBottom: 8, // Reducido
  },
  tip: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: 4, // Reducido
    lineHeight: 18,
  },
});

export default JournalScreen;