import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography, spacing } from '../../constants/colors';
import { getTasksForLevel, taskLevels, getAllTasksForLevel } from '../../constants/tasks';
import { saveCompletedTasks, getTodayTasks, getSettings, saveSettings } from '../../utils/storage';

const TasksScreen = ({ navigation }) => {
  const [currentLevel, setCurrentLevel] = useState(2);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [customTasks, setCustomTasks] = useState([]);
  const [animatedValues, setAnimatedValues] = useState({});

  useEffect(() => {
    loadTasksData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTasksData();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const tasks = getAllTasksForLevel(currentLevel, customTasks);
    setAvailableTasks(tasks);
    
    // Inicializar valores animados
    const newAnimatedValues = {};
    tasks.forEach(task => {
      newAnimatedValues[task.id] = new Animated.Value(1);
    });
    setAnimatedValues(newAnimatedValues);
  }, [currentLevel, customTasks]);

  const loadTasksData = async () => {
    try {
      const settings = await getSettings();
      const todayTasks = await getTodayTasks();
      
      setCurrentLevel(settings.currentLevel);
      setCustomTasks(settings.customTasks || []);
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
      
      // Animación suave de desmarcar
      Animated.timing(animatedValues[taskId], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: false,
      }).start(() => {
        Animated.timing(animatedValues[taskId], {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
        }).start();
      });
    } else {
      // Marcar tarea
      newCompletedTasks = [...completedTasks, taskId];
      
      // Animación suave de marcar
      Animated.sequence([
        Animated.timing(animatedValues[taskId], {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValues[taskId], {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
        }),
      ]).start();
    }
    
    setCompletedTasks(newCompletedTasks);
    await saveCompletedTasks(newCompletedTasks);
  };

  const changeLevel = async (newLevel) => {
    console.log('🔄 changeLevel called with:', newLevel, 'current:', currentLevel);
    
    if (newLevel !== currentLevel) {
      const levelInfo = taskLevels[newLevel];
      console.log('📋 Showing alert for level:', levelInfo);
      
      Alert.alert(
        'Cambiar nivel',
        `¿Quieres cambiar a nivel ${levelInfo.name}?\n\n${levelInfo.message}`,
        [
          { 
            text: 'Cancelar', 
            style: 'cancel',
            onPress: () => console.log('❌ Level change cancelled')
          },
          { 
            text: 'Cambiar', 
            onPress: async () => {
              console.log('✅ Level change confirmed, setting to:', newLevel);
              setCurrentLevel(newLevel);
              await saveSettings({ currentLevel: newLevel });
              console.log('💾 Level saved successfully');
            }
          },
        ]
      );
    } else {
      console.log('ℹ️ Same level, no change needed');
    }
  };

  const getProgressPercentage = () => {
    const total = availableTasks.length;
    const completed = completedTasks.length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const getTaskIcon = (task) => {
    if (task.category === 'custom' && task.icon) {
      return task.icon;
    }
    return task.icon || 'checkmark-circle-outline';
  };

  const currentLevelInfo = taskLevels[currentLevel];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header con progreso - OPTIMIZADO */}
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

        {/* Selector de nivel - OPTIMIZADO */}
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

        {/* Lista de tareas - OPTIMIZADO */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksSectionHeader}>
            <Text style={styles.sectionTitle}>Tareas de hoy</Text>
            {customTasks.length > 0 && (
              <Text style={styles.tasksCount}>
                {availableTasks.filter(t => t.category === 'basic').length} esenciales + {availableTasks.filter(t => t.category === 'custom').length} personalizadas
              </Text>
            )}
          </View>
          
          {availableTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No hay tareas para este nivel</Text>
              <TouchableOpacity 
                style={styles.reloadButton}
                onPress={loadTasksData}
              >
                <Text style={styles.reloadButtonText}>Recargar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.tasksContainer}>
              {availableTasks.map((task) => {
                const isCompleted = completedTasks.includes(task.id);
                const animatedValue = animatedValues[task.id];
                
                return (
                  <Animated.View
                    key={task.id}
                    style={[
                      styles.taskItem,
                      {
                        transform: animatedValue ? [{ scale: animatedValue }] : [{ scale: 1 }],
                        opacity: isCompleted ? 0.8 : 1,
                      }
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.taskContent}
                      onPress={() => toggleTask(task.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.taskLeft}>
                        <View style={[
                          styles.checkbox,
                          isCompleted && styles.checkedBox,
                          task.category === 'custom' && styles.customCheckbox,
                          task.category === 'custom' && isCompleted && styles.customCheckedBox,
                        ]}>
                          {isCompleted && (
                            <Ionicons 
                              name="checkmark" 
                              size={16} 
                              color="white"
                            />
                          )}
                        </View>
                        
                        <View style={styles.taskInfo}>
                          <View style={styles.taskTitleRow}>
                            <Text style={[
                              styles.taskTitle,
                              isCompleted && styles.completedTaskTitle,
                            ]}>
                              {task.title}
                            </Text>
                            {task.category === 'custom' && (
                              <View style={styles.customBadge}>
                                <Text style={styles.customBadgeText}>Personal</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.taskDescription}>
                            {task.description}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.taskIconContainer}>
                        <Ionicons 
                          name={getTaskIcon(task)}
                          size={24}
                          color={isCompleted ? '#66bb6a' : '#a0aec0'}
                        />
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          )}
        </View>

        {/* Botón para agregar tareas personalizadas - OPTIMIZADO */}
        <View style={styles.customTasksSection}>
          <TouchableOpacity
            style={styles.customTasksButton}
            onPress={() => {
              Alert.alert(
                'Tareas Personalizadas',
                'Para crear tareas personalizadas, ve a:\nInicio → Configuración → Tareas Personalizadas',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { 
                    text: 'Ir a Configuración', 
                    onPress: () => navigation.navigate('Dashboard', { screen: 'Settings' })
                  }
                ]
              );
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color="#667eea" />
            <Text style={styles.customTasksButtonText}>
              Crear tareas personalizadas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botón de día muy difícil - OPTIMIZADO */}
        <View style={styles.emergencySection}>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => changeLevel(1)}
          >
            <Ionicons name="heart" size={20} color="#e53e3e" />
            <Text style={styles.emergencyButtonText}>
              Día muy difícil - Solo lo esencial
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mensaje de ánimo - OPTIMIZADO */}
        {completedTasks.length === availableTasks.length && availableTasks.length > 0 && (
          <View style={styles.congratulationsSection}>
            <Ionicons name="trophy" size={32} color="#ffa726" />
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
  // CONTENEDOR PRINCIPAL
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // SCROLL CONTENT OPTIMIZADO
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 85 : 90, // Android aumentado
  },
  
  // HEADER OPTIMIZADO
  header: {
    paddingHorizontal: 16, // REDUCIDO
    paddingTop: 8, // REDUCIDO
    paddingBottom: 6, // REDUCIDO
  },
  
  progressSection: {
    backgroundColor: 'white',
    padding: 12, // REDUCIDO
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 3, // REDUCIDO
  },
  
  progressText: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 8, // REDUCIDO
  },
  
  progressBar: {
    height: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    marginBottom: 6, // REDUCIDO
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  
  progressPercentage: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  
  // LEVEL SECTION OPTIMIZADO
  levelSection: {
    paddingHorizontal: 16, // REDUCIDO
    paddingVertical: 8, // REDUCIDO
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 6, // REDUCIDO
  },
  
  levelMessage: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 10, // REDUCIDO
    fontStyle: 'italic',
  },
  
  levelSelector: {
    gap: 6, // REDUCIDO
  },
  
  levelButton: {
    backgroundColor: 'white',
    padding: 10, // REDUCIDO
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  
  levelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3748',
  },
  
  selectedLevelButtonText: {
    color: 'white',
  },
  
  // TASKS SECTION OPTIMIZADO
  tasksSection: {
    paddingHorizontal: 16, // REDUCIDO
    paddingVertical: 8, // REDUCIDO
  },
  
  tasksSectionHeader: {
    marginBottom: 10, // REDUCIDO
  },
  
  tasksCount: {
    fontSize: 12,
    color: '#a0aec0',
    marginTop: 3, // REDUCIDO
  },
  
  emptyState: {
    alignItems: 'center',
    padding: 24, // REDUCIDO
    backgroundColor: 'white',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#a0aec0',
  },
  
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3748',
    marginTop: 6, // REDUCIDO
    marginBottom: 6, // REDUCIDO
  },
  
  reloadButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  
  reloadButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  
  tasksContainer: {
    gap: 8, // REDUCIDO
  },
  
  // TASK ITEM OPTIMIZADO
  taskItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    minHeight: 70, // REDUCIDO
  },
  
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12, // REDUCIDO
    minHeight: 70, // REDUCIDO
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
    borderColor: '#a0aec0',
    marginRight: 10, // REDUCIDO
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  
  checkedBox: {
    backgroundColor: '#66bb6a',
    borderColor: '#66bb6a',
  },
  
  customCheckbox: {
    borderColor: '#667eea',
  },
  
  customCheckedBox: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  
  taskInfo: {
    flex: 1,
  },
  
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3, // REDUCIDO
  },
  
  taskTitle: {
    fontSize: 15, // REDUCIDO
    fontWeight: '500',
    color: '#2d3748',
    flex: 1,
  },
  
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#718096',
  },
  
  customBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 5, // REDUCIDO
    paddingVertical: 1, // REDUCIDO
    borderRadius: 6, // REDUCIDO
    marginLeft: 3, // REDUCIDO
  },
  
  customBadgeText: {
    fontSize: 9, // REDUCIDO
    color: '#667eea',
    fontWeight: '500',
  },
  
  taskDescription: {
    fontSize: 13, // REDUCIDO
    color: '#718096',
    lineHeight: 16, // REDUCIDO
  },
  
  taskIconContainer: {
    padding: 3, // REDUCIDO
  },
  
  // CUSTOM TASKS SECTION OPTIMIZADO
  customTasksSection: {
    paddingHorizontal: 16,
    marginBottom: 10, // REDUCIDO
  },
  
  customTasksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 12, // REDUCIDO
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#667eea',
    borderStyle: 'dashed',
    gap: 6, // REDUCIDO
  },
  
  customTasksButtonText: {
    color: '#667eea',
    fontWeight: '500',
  },
  
  // EMERGENCY SECTION OPTIMIZADO
  emergencySection: {
    paddingHorizontal: 16,
    marginBottom: 10, // REDUCIDO
  },
  
  emergencyButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12, // REDUCIDO
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e53e3e',
    gap: 6, // REDUCIDO
  },
  
  emergencyButtonText: {
    color: '#e53e3e',
    fontWeight: '500',
  },
  
  // CONGRATULATIONS SECTION OPTIMIZADO
  congratulationsSection: {
    alignItems: 'center',
    padding: 16, // REDUCIDO
    marginHorizontal: 16,
    marginBottom: 10, // REDUCIDO
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#ffa726',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  
  congratulationsTitle: {
    fontSize: 18, // REDUCIDO
    fontWeight: 'bold',
    color: '#2d3748',
    marginTop: 6, // REDUCIDO
    marginBottom: 3, // REDUCIDO
  },
  
  congratulationsText: {
    fontSize: 14, // REDUCIDO
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20, // REDUCIDO
  },
});

export default TasksScreen;