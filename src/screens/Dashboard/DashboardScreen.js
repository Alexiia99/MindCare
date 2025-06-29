// src/screens/Dashboard/DashboardScreen.js
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
import { getTasksForLevel, taskLevels, getAllTasksForLevel } from '../../constants/tasks';
import { getTodayMood, getTodayTasks, getSettings, saveSettings } from '../../utils/storage';
import { getContextualQuote } from '../../constants/quotes';
import LevelSuggestion from '../../components/LevelSuggestion';

const DashboardScreen = ({ navigation }) => {
  const [currentLevel, setCurrentLevel] = useState(2);
  const [todayMood, setTodayMood] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [dailyQuote, setDailyQuote] = useState({
    text: "Cada día es una nueva oportunidad para ser amable contigo mismo.",
    author: "Anónimo"
  });
  const [showLevelSuggestion, setShowLevelSuggestion] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboardData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadDashboardData = async () => {
    try {
      const settings = await getSettings();
      const mood = await getTodayMood();
      const tasks = await getTodayTasks();
      
      setCurrentLevel(settings.currentLevel || 2);
      setTodayMood(mood);
      setCompletedTasks(tasks);
      
      // Cargar tareas disponibles (incluyendo personalizadas)
      const tasksForLevel = await getAllTasksForLevel(settings.currentLevel || 2);
      setAvailableTasks(tasksForLevel);
      
      // Cargar cita contextual
      const quote = await getContextualQuote(getTodayMood);
      setDailyQuote(quote);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  // Nueva función para manejar cambios de nivel
  const handleLevelChanged = async (newLevel) => {
    try {
      const settings = await getSettings();
      const updatedSettings = {
        ...settings,
        currentLevel: newLevel
      };
      await saveSettings(updatedSettings);
      
      // Actualizar el estado local
      setCurrentLevel(newLevel);
      
      // Recargar las tareas disponibles para el nuevo nivel
      const newTasks = await getAllTasksForLevel(newLevel);
      setAvailableTasks(newTasks);
      
      Alert.alert(
        '¡Nivel actualizado! ✨',
        `Ahora estás en modo "${taskLevels[newLevel].name}". Tus tareas se han ajustado automáticamente.`
      );
      
    } catch (error) {
      console.error('Error updating level:', error);
      Alert.alert('Error', 'No se pudo actualizar el nivel');
    }
  };

  const handleSOSPress = () => {
    Alert.alert(
      'Panel SOS',
      '¿Necesitas ayuda inmediata?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, abrir SOS', onPress: () => navigation.navigate('Crisis') },
      ]
    );
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

  const getMoodText = () => {
    if (!todayMood) return 'No registrado';
    
    const moodTexts = {
      1: 'Muy bajo',
      2: 'Bajo',
      3: 'Neutral',
      4: 'Bueno',
      5: 'Muy bueno'
    };
    
    return moodTexts[todayMood.value] || 'No registrado';
  };

  const getTaskProgress = () => {
    const total = availableTasks.length;
    const completed = completedTasks.length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const currentLevelInfo = taskLevels[currentLevel];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>¡Hola!</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
          
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.sosButton}
              onPress={handleSOSPress}
            >
              <Ionicons name="alert-circle" size={24} color={colors.white} />
              <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* NUEVO: Sugerencia automática de nivel */}
        {showLevelSuggestion && (
          <LevelSuggestion onLevelChanged={handleLevelChanged} />
        )}

        {/* Nivel actual */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nivel de hoy</Text>
          <View style={styles.levelContainer}>
            <View style={[styles.levelIndicator, { backgroundColor: currentLevelInfo.color }]} />
            <View style={styles.levelInfo}>
              <Text style={styles.levelName}>{currentLevelInfo.name}</Text>
              <Text style={styles.levelMessage}>{currentLevelInfo.message}</Text>
            </View>
          </View>
        </View>

        {/* Estado de ánimo */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mi ánimo hoy</Text>
          <View style={styles.moodContainer}>
            <View style={[styles.moodIndicator, { backgroundColor: getMoodColor() }]} />
            <Text style={styles.moodText}>{getMoodText()}</Text>
            <TouchableOpacity 
              style={styles.registerButton}
              onPress={() => navigation.navigate('Mood')}
            >
              <Text style={styles.registerButtonText}>
                {todayMood ? 'Actualizar' : 'Registrar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progreso de tareas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Progreso de tareas</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {completedTasks.length} de {availableTasks.length} completadas
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(getTaskProgress())}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${getTaskProgress()}%` }
                ]} 
              />
            </View>
            <TouchableOpacity 
              style={styles.tasksButton}
              onPress={() => navigation.navigate('Tasks')}
            >
              <Text style={styles.tasksButtonText}>Ver tareas</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cita del día */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pensamiento del día</Text>
          <Text style={styles.quote}>
            "{dailyQuote.text}"
          </Text>
          <Text style={styles.quoteAuthor}>- {dailyQuote.author}</Text>
        </View>

        {/* Accesos rápidos */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('Journal')}
          >
            <Ionicons name="book-outline" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Diario</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('Statistics')}
          >
            <Ionicons name="bar-chart-outline" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Estadísticas</Text>
          </TouchableOpacity>
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
    paddingBottom: Platform.OS === 'ios' ? 85 : 75,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  date: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.white,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  sosButton: {
    backgroundColor: colors.danger,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sosText: {
    color: colors.white,
    fontWeight: typography.weights.bold,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  levelMessage: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  moodText: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
  },
  registerButton: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  registerButtonText: {
    color: colors.primary,
    fontWeight: typography.weights.medium,
    fontSize: typography.sizes.sm,
  },
  progressContainer: {
    gap: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
  },
  progressPercentage: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  tasksButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  tasksButtonText: {
    color: colors.white,
    fontWeight: typography.weights.medium,
  },
  quote: {
    fontSize: typography.sizes.base,
    fontStyle: 'italic',
    color: colors.textPrimary,
    lineHeight: 24,
  },
  quoteAuthor: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'right',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  quickActionText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 6,
  },
});

export default DashboardScreen;