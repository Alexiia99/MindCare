import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography, spacing } from '../../constants/colors';
import { getTasksForLevel, taskLevels } from '../../constants/tasks';
import { saveCompletedTasks, getTodayTasks, getSettings, saveSettings } from '../../utils/storage';

const TasksScreen = () => {
  const [currentLevel, setCurrentLevel] = useState(2);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [animatedValues, setAnimatedValues] = useState({});

  useEffect(() => {
    loadTasksData();
  }, []);

  useEffect(() => {
    const tasks = getTasksForLevel(currentLevel);
    setAvailableTasks(tasks);
    
    // Inicializar valores animados para cada tarea
    const newAnimatedValues = {};
    tasks.forEach(task => {
      newAnimatedValues[task.id] = new Animated.Value(0);
    });
    setAnimatedValues(newAnimatedValues);
  }, [currentLevel]);

  const loadTasksData = async () => {
    try {
      const settings = await getSettings();
      const todayTasks = await getTodayTasks();
      
      setCurrentLevel(settings.currentLevel);
      setCompletedTasks(todayTasks);
    } catch (error) {
      console.error('Error loading tasks data:', error);
    }
  };

  const toggleTask = async (taskId) => {
    let newCompletedTasks;
    
    if (completedTasks.includes(taskId)) {
      // Desmarcar tarea
      newCompletedTasks = completedTasks.filter(id => id !== taskId);
      
      // Animación de desmarcar
      Animated.timing(animatedValues[taskId], {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      // Marcar tarea
      newCompletedTasks = [...completedTasks, taskId];
      
      // Animación de marcar
      Animated.sequence([
        Animated.timing(animatedValues[taskId], {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValues[taskId], {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    }
    
    setCompletedTasks(newCompletedTasks);
    await saveCompletedTasks(newCompletedTasks);
  };

  const changeLevel = async (newLevel) => {
    if (newLevel !== currentLevel) {
      Alert.alert(
        'Cambiar nivel',
        `¿Quieres cambiar a nivel ${taskLevels[newLevel].name}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Cambiar', 
            onPress: async () => {
              setCurrentLevel(newLevel);
              await saveSettings({ currentLevel: newLevel });
            }
          },
        ]
      );
    }
  };

  const getProgressPercentage = () => {
    const total = availableTasks.length;
    const completed = completedTasks.length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const currentLevelInfo = taskLevels[currentLevel];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header con progreso */}
        <View style={styles.header}>
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Progreso de hoy</Text>
            <Text style={styles.progressText}>
              {completedTasks.length} de {availableTasks.length} tareas completadas
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${getProgressPercentage()}%` }
                ]}
              />
            </View>
            <Text style={styles.progressPercentage}>
              {Math.round(getProgressPercentage())}%
            </Text>
          </View>
        </View>

        {/* Selector de nivel */}
        <View style={styles.levelSection}>
          <Text style={styles.sectionTitle}>Nivel de dificultad</Text>
          <Text style={styles.levelMessage}>{currentLevelInfo.message}</Text>
          
          <View style={styles.levelSelector}>
            {Object.entries(taskLevels).map(([level, info]) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelButton,
                  { borderColor: info.color },
                  currentLevel === parseInt(level) && { backgroundColor: info.color },
                ]}
                onPress={() => changeLevel(parseInt(level))}
              >
                <Text style={[
                  styles.levelButtonText,
                  currentLevel === parseInt(level) && styles.selectedLevelButtonText,
                ]}>
                  {info.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Lista de tareas */}
        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Tareas de hoy</Text>
          
          {availableTasks.map((task) => {
            const isCompleted = completedTasks.includes(task.id);
            const animatedValue = animatedValues[task.id];
            
            return (
              <Animated.View
                key={task.id}
                style={[
                  styles.taskItem,
                  {
                    transform: animatedValue ? [{ scale: animatedValue }] : [],
                    opacity: isCompleted ? 0.7 : 1,
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.taskContent}
                  onPress={() => toggleTask(task.id)}
                >
                  <View style={styles.taskLeft}>
                    <View style={[
                      styles.checkbox,
                      isCompleted && styles.checkedBox,
                    ]}>
                      {isCompleted && (
                        <Ionicons 
                          name="checkmark" 
                          size={16} 
                          color={colors.white} 
                        />
                      )}
                    </View>
                    
                    <View style={styles.taskInfo}>
                      <Text style={[
                        styles.taskTitle,
                        isCompleted && styles.completedTaskTitle,
                      ]}>
                        {task.title}
                      </Text>
                      <Text style={styles.taskDescription}>
                        {task.description}
                      </Text>
                    </View>
                  </View>
                  
                  <Ionicons 
                    name={task.icon || 'checkmark-circle-outline'}
                    size={24}
                    color={isCompleted ? colors.success : colors.textLight}
                  />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Botón de día muy difícil */}
        <View style={styles.emergencySection}>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => changeLevel(1)}
          >
            <Ionicons name="heart" size={20} color={colors.danger} />
            <Text style={styles.emergencyButtonText}>
              Día muy difícil - Solo lo esencial
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mensaje de ánimo */}
        {completedTasks.length === availableTasks.length && availableTasks.length > 0 && (
          <View style={styles.congratulationsSection}>
            <Ionicons name="trophy" size={32} color={colors.warning} />
            <Text style={styles.congratulationsTitle}>¡Felicitaciones!</Text>
            <Text style={styles.congratulationsText}>
              Has completado todas las tareas de hoy. ¡Eres increíble!
            </Text>
          </View>
        )}
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
  },
  progressSection: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  progressText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressPercentage: {
    textAlign: 'center',
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  levelSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  levelMessage: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  levelSelector: {
    gap: spacing.sm,
  },
  levelButton: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  levelButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  selectedLevelButtonText: {
    color: colors.white,
  },
  tasksSection: {
    padding: spacing.lg,
  },
  taskItem: {
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    borderRadius: 12,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textLight,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  emergencySection: {
    padding: spacing.lg,
  },
  emergencyButton: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger,
    gap: spacing.sm,
  },
  emergencyButtonText: {
    color: colors.danger,
    fontWeight: typography.weights.medium,
  },
  congratulationsSection: {
    alignItems: 'center',
    padding: spacing.xl,
    margin: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  congratulationsTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  congratulationsText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default TasksScreen;