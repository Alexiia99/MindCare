import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography, spacing } from '../../constants/colors';
import { getMoods, getAllTasks } from '../../utils/storage';

const { width } = Dimensions.get('window');

const StatisticsScreen = () => {
  const [moodData, setMoodData] = useState({});
  const [tasksData, setTasksData] = useState({});
  const [stats, setStats] = useState({
    averageMood: 0,
    totalEntries: 0,
    completedTasksTotal: 0,
    streakDays: 0,
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const moods = await getMoods();
      const tasks = await getAllTasks();
      
      setMoodData(moods);
      setTasksData(tasks);
      
      calculateStats(moods, tasks);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const calculateStats = (moods, tasks) => {
    const moodEntries = Object.values(moods);
    const taskEntries = Object.values(tasks);
    
    // Calcular promedio de ánimo
    const totalMood = moodEntries.reduce((sum, entry) => sum + (entry.value || 0), 0);
    const averageMood = moodEntries.length > 0 ? totalMood / moodEntries.length : 0;
    
    // Calcular total de tareas completadas
    const completedTasksTotal = taskEntries.reduce((sum, dayTasks) => sum + dayTasks.length, 0);
    
    // Calcular racha de días (simplificado - últimos días consecutivos con datos)
    const sortedDates = Object.keys(moods).sort().reverse();
    let streakDays = 0;
    for (let date of sortedDates) {
      if (moods[date]) {
        streakDays++;
      } else {
        break;
      }
    }
    
    setStats({
      averageMood: Math.round(averageMood * 10) / 10,
      totalEntries: moodEntries.length,
      completedTasksTotal,
      streakDays,
    });
  };

  const getMoodDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    Object.values(moodData).forEach(entry => {
      if (entry.value) {
        distribution[entry.value]++;
      }
    });
    return distribution;
  };

  const getRecentMoods = () => {
    const recent = Object.entries(moodData)
      .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
      .slice(0, 7)
      .reverse();
    
    return recent;
  };

  const getMoodColor = (value) => {
    const colorMap = {
      1: colors.moodVeryBad,
      2: colors.moodBad,
      3: colors.moodNeutral,
      4: colors.moodGood,
      5: colors.moodGreat,
    };
    return colorMap[value] || colors.textLight;
  };

  const moodDistribution = getMoodDistribution();
  const recentMoods = getRecentMoods();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mis Estadísticas</Text>
          <Text style={styles.subtitle}>
            Resumen de tu progreso y patrones
          </Text>
        </View>

        {/* Estadísticas principales */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="happy-outline" size={24} color={colors.primary} />
            <Text style={styles.statNumber}>{stats.averageMood}</Text>
            <Text style={styles.statLabel}>Ánimo promedio</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={24} color={colors.success} />
            <Text style={styles.statNumber}>{stats.totalEntries}</Text>
            <Text style={styles.statLabel}>Días registrados</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color={colors.info} />
            <Text style={styles.statNumber}>{stats.completedTasksTotal}</Text>
            <Text style={styles.statLabel}>Tareas completadas</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="flame-outline" size={24} color={colors.warning} />
            <Text style={styles.statNumber}>{stats.streakDays}</Text>
            <Text style={styles.statLabel}>Racha de días</Text>
          </View>
        </View>

        {/* Distribución de ánimos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribución de ánimos</Text>
          
          <View style={styles.moodDistribution}>
            {Object.entries(moodDistribution).map(([mood, count]) => {
              const percentage = stats.totalEntries > 0 ? (count / stats.totalEntries) * 100 : 0;
              
              return (
                <View key={mood} style={styles.moodDistributionItem}>
                  <View style={styles.moodBar}>
                    <View 
                      style={[
                        styles.moodBarFill,
                        { 
                          backgroundColor: getMoodColor(parseInt(mood)),
                          height: `${Math.max(percentage, 5)}%`
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.moodBarLabel}>{mood}</Text>
                  <Text style={styles.moodBarCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Últimos 7 días */}
        {recentMoods.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Últimos 7 días</Text>
            
            <View style={styles.recentMoods}>
              {recentMoods.map(([date, entry]) => (
                <View key={date} style={styles.recentMoodItem}>
                  <View 
                    style={[
                      styles.recentMoodDot,
                      { backgroundColor: getMoodColor(entry.value) }
                    ]} 
                  />
                  <Text style={styles.recentMoodDate}>
                    {new Date(date).toLocaleDateString('es-ES', { 
                      weekday: 'short',
                      day: 'numeric' 
                    })}
                  </Text>
                  <Text style={styles.recentMoodValue}>{entry.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Mensaje motivacional */}
        <View style={styles.motivationSection}>
          <Ionicons name="heart" size={24} color={colors.danger} />
          <Text style={styles.motivationTitle}>¡Sigue así!</Text>
          <Text style={styles.motivationText}>
            {stats.totalEntries > 0 
              ? `Has registrado tu ánimo ${stats.totalEntries} ${stats.totalEntries === 1 ? 'día' : 'días'}. Cada registro te ayuda a conocerte mejor.`
              : 'Comienza a registrar tu ánimo para ver tus estadísticas aquí.'
            }
          </Text>
        </View>

        {/* Nota informativa */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>📊 Sobre las estadísticas</Text>
          <Text style={styles.infoText}>
            Estas estadísticas te ayudan a identificar patrones en tu bienestar. 
            Recuerda que los altibajos son normales y parte del proceso de crecimiento personal.
          </Text>
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
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    backgroundColor: colors.white,
    flex: 1,
    minWidth: (width - spacing.lg * 2 - spacing.md) / 2,
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  section: {
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
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  moodDistribution: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  moodDistributionItem: {
    alignItems: 'center',
    flex: 1,
  },
  moodBar: {
    width: 30,
    height: 80,
    backgroundColor: colors.background,
    borderRadius: 15,
    justifyContent: 'flex-end',
    marginBottom: spacing.sm,
  },
  moodBarFill: {
    width: '100%',
    borderRadius: 15,
  },
  moodBarLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  moodBarCount: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  recentMoods: {
    gap: spacing.md,
  },
  recentMoodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  recentMoodDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  recentMoodDate: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  recentMoodValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  motivationSection: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  motivationTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  motivationText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default StatisticsScreen;