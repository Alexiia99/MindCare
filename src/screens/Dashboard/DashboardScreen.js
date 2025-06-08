import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography, spacing } from '../../constants/colors';
import { getTasksForLevel, taskLevels } from '../../constants/tasks';
import { getTodayMood, getTodayTasks, getSettings } from '../../utils/storage';

const DashboardScreen = ({ navigation }) => {
  const [currentLevel, setCurrentLevel] = useState(2);
  const [todayMood, setTodayMood] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);

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
      
      setCurrentLevel(settings.currentLevel);
      setTodayMood(mood);
      setCompletedTasks(tasks);
      setAvailableTasks(getTasksForLevel(settings.currentLevel));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
      <ScrollView showsVerticalScrollIndicator={false}>
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
          
          <TouchableOpacity 
            style={styles.sosButton}
            onPress={handleSOSPress}
          >
            <Ionicons name="alert-circle" size={24} color={colors.white} />
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>
        </View>

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
            "Cada día es una nueva oportunidad para ser amable contigo mismo."
          </Text>
          <Text style={styles.quoteAuthor}>- Anónimo</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.sm,
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
  sosButton: {
    backgroundColor: colors.danger,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
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
    marginBottom: spacing.md,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
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
    marginTop: spacing.xs,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  moodText: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
  },
  registerButton: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  registerButtonText: {
    color: colors.primary,
    fontWeight: typography.weights.medium,
    fontSize: typography.sizes.sm,
  },
  progressContainer: {
    gap: spacing.md,
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
    paddingVertical: spacing.md,
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
    marginTop: spacing.sm,
    textAlign: 'right',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    padding: spacing.lg,
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
    marginTop: spacing.sm,
  },
});

export default DashboardScreen;