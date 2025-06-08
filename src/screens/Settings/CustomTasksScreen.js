import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography, spacing } from '../../constants/colors';
import { getSettings, saveSettings } from '../../utils/storage';
import { addCustomTask, taskLevels } from '../../constants/tasks';

// Iconos disponibles para tareas personalizadas
const availableIcons = [
  'star-outline', 'heart-outline', 'home-outline', 'book-outline',
  'fitness-outline', 'musical-notes-outline', 'camera-outline',
  'call-outline', 'mail-outline', 'cafe-outline', 'bicycle-outline',
  'walk-outline', 'bed-outline', 'sunny-outline', 'moon-outline',
  'leaf-outline', 'flower-outline', 'water-outline', 'flame-outline',
  'gift-outline', 'game-controller-outline', 'headset-outline',
  'brush-outline', 'build-outline', 'calculator-outline'
];

const CustomTasksScreen = ({ navigation }) => {
  const [customTasks, setCustomTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    level: 2,
    icon: 'star-outline'
  });

  useEffect(() => {
    loadCustomTasks();
  }, []);

  useEffect(() => {
    // Recargar cuando se vuelve a la pantalla
    const unsubscribe = navigation.addListener('focus', () => {
      loadCustomTasks();
    });
    return unsubscribe;
  }, [navigation]);

  const loadCustomTasks = async () => {
    try {
      const settings = await getSettings();
      setCustomTasks(settings.customTasks || []);
    } catch (error) {
      console.error('Error loading custom tasks:', error);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      Alert.alert('Error', 'Por favor escribe un título para la tarea');
      return;
    }

    try {
      const task = addCustomTask(newTask);
      const updatedTasks = [...customTasks, task];
      
      setCustomTasks(updatedTasks);
      await saveSettings({ customTasks: updatedTasks });
      
      // Resetear formulario
      setNewTask({ 
        title: '', 
        description: '', 
        level: 2, 
        icon: 'star-outline' 
      });
      setShowAddModal(false);
      
      Alert.alert(
        '¡Listo! ✨', 
        'Tu tarea personalizada ha sido creada correctamente.',
        [{ text: 'Genial' }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la tarea');
      console.error('Error creating task:', error);
    }
  };

  const handleDeleteTask = (taskId) => {
    const taskToDelete = customTasks.find(task => task.id === taskId);
    
    Alert.alert(
      'Eliminar tarea',
      `¿Estás seguro de que quieres eliminar "${taskToDelete?.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const updatedTasks = customTasks.filter(task => task.id !== taskId);
            setCustomTasks(updatedTasks);
            await saveSettings({ customTasks: updatedTasks });
          }
        }
      ]
    );
  };

  const handleToggleTask = async (taskId) => {
    const updatedTasks = customTasks.map(task => 
      task.id === taskId 
        ? { ...task, isActive: !task.isActive }
        : task
    );
    
    setCustomTasks(updatedTasks);
    await saveSettings({ customTasks: updatedTasks });
  };

  const resetForm = () => {
    setNewTask({
      title: '',
      description: '',
      level: 2,
      icon: 'star-outline'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tareas Personalizadas</Text>
          <Text style={styles.subtitle}>
            Crea tareas específicas para tus objetivos y rutinas personales
          </Text>
        </View>

        {/* Botón agregar */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add-circle" size={24} color="#667eea" />
          <Text style={styles.addButtonText}>Crear nueva tarea</Text>
        </TouchableOpacity>

        {/* Lista de tareas */}
        {customTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#a0aec0" />
            <Text style={styles.emptyTitle}>No tienes tareas personalizadas</Text>
            <Text style={styles.emptyText}>
              Crea tareas específicas para tus objetivos y rutinas personales.
              Aparecerán automáticamente en tu lista de tareas diarias.
            </Text>
          </View>
        ) : (
          <View style={styles.tasksList}>
            <Text style={styles.tasksListTitle}>
              Mis tareas ({customTasks.length})
            </Text>
            {customTasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <View style={styles.taskLeft}>
                  <View style={[
                    styles.taskIcon, 
                    { backgroundColor: taskLevels[task.level].color + '20' }
                  ]}>
                    <Ionicons 
                      name={task.icon} 
                      size={24} 
                      color={taskLevels[task.level].color} 
                    />
                  </View>
                  <View style={styles.taskInfo}>
                    <View style={styles.taskTitleRow}>
                      <Text style={[
                        styles.taskTitle, 
                        !task.isActive && styles.inactiveTask
                      ]}>
                        {task.title}
                      </Text>
                      <View style={[
                        styles.levelBadge,
                        { backgroundColor: taskLevels[task.level].color }
                      ]}>
                        <Text style={styles.levelBadgeText}>
                          Nivel {task.level}
                        </Text>
                      </View>
                    </View>
                    {task.description ? (
                      <Text style={styles.taskDescription}>{task.description}</Text>
                    ) : null}
                    <Text style={styles.taskLevel}>
                      {taskLevels[task.level].name} • {task.isActive ? 'Activa' : 'Inactiva'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.taskActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleToggleTask(task.id)}
                  >
                    <Ionicons 
                      name={task.isActive ? "eye" : "eye-off"} 
                      size={20} 
                      color={task.isActive ? "#66bb6a" : "#a0aec0"} 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteTask(task.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#e53e3e" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Información adicional */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 Consejos</Text>
          <Text style={styles.infoText}>
            • Las tareas aparecerán automáticamente según tu nivel actual{'\n'}
            • Puedes activar/desactivar tareas sin eliminarlas{'\n'}
            • Crea tareas específicas y alcanzables{'\n'}
            • Usa descripciones claras para recordar el objetivo
          </Text>
        </View>

        {/* Modal para agregar tarea */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                <Text style={styles.modalCancel}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Nueva Tarea</Text>
              <TouchableOpacity onPress={handleAddTask}>
                <Text style={styles.modalSave}>Guardar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Título */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Título de la tarea *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: Meditar 5 minutos"
                  placeholderTextColor="#a0aec0"
                  value={newTask.title}
                  onChangeText={(text) => setNewTask({...newTask, title: text})}
                  maxLength={50}
                />
                <Text style={styles.charCounter}>
                  {newTask.title.length}/50 caracteres
                </Text>
              </View>

              {/* Descripción */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Descripción (opcional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Describe brevemente qué involucra esta tarea..."
                  placeholderTextColor="#a0aec0"
                  value={newTask.description}
                  onChangeText={(text) => setNewTask({...newTask, description: text})}
                  multiline
                  numberOfLines={3}
                  maxLength={150}
                />
                <Text style={styles.charCounter}>
                  {newTask.description.length}/150 caracteres
                </Text>
              </View>

              {/* Nivel */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>¿En qué nivel aparecerá?</Text>
                <Text style={styles.inputHelper}>
                  La tarea aparecerá en este nivel y todos los superiores
                </Text>
                <View style={styles.levelSelector}>
                  {Object.entries(taskLevels).map(([level, info]) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.levelOption,
                        { borderColor: info.color },
                        newTask.level === parseInt(level) && { backgroundColor: info.color }
                      ]}
                      onPress={() => setNewTask({...newTask, level: parseInt(level)})}
                    >
                      <Text style={[
                        styles.levelOptionText,
                        newTask.level === parseInt(level) && styles.selectedLevelText
                      ]}>
                        Nivel {level}: {info.name}
                      </Text>
                      <Text style={[
                        styles.levelOptionDescription,
                        newTask.level === parseInt(level) && styles.selectedLevelText
                      ]}>
                        {info.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Icono */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Elige un icono</Text>
                <View style={styles.iconGrid}>
                  {availableIcons.map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconOption,
                        newTask.icon === icon && styles.selectedIcon
                      ]}
                      onPress={() => setNewTask({...newTask, icon})}
                    >
                      <Ionicons 
                        name={icon} 
                        size={24} 
                        color={newTask.icon === icon ? 'white' : '#667eea'} 
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Preview */}
              <View style={styles.previewSection}>
                <Text style={styles.previewTitle}>Vista previa:</Text>
                <View style={styles.previewTask}>
                  <View style={[
                    styles.previewIcon,
                    { backgroundColor: taskLevels[newTask.level].color + '20' }
                  ]}>
                    <Ionicons 
                      name={newTask.icon} 
                      size={20} 
                      color={taskLevels[newTask.level].color} 
                    />
                  </View>
                  <View style={styles.previewInfo}>
                    <Text style={styles.previewTaskTitle}>
                      {newTask.title || 'Título de la tarea'}
                    </Text>
                    <Text style={styles.previewTaskDescription}>
                      {newTask.description || 'Descripción de la tarea'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Espaciado adicional para evitar que se corte */}
              <View style={styles.bottomSpacer} />
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    paddingBottom: 100, // Espaciado extra para el navbar
  },
  header: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'white',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#667eea',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    marginHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
  tasksList: {
    paddingHorizontal: 16,
  },
  tasksListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  taskItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3748',
    flex: 1,
  },
  inactiveTask: {
    opacity: 0.6,
  },
  levelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  levelBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  taskDescription: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  taskLevel: {
    fontSize: 12,
    color: '#a0aec0',
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  infoSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3748',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCancel: {
    fontSize: 16,
    color: '#718096',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3748',
    marginBottom: 8,
  },
  inputHelper: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#2d3748',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCounter: {
    fontSize: 12,
    color: '#a0aec0',
    textAlign: 'right',
    marginTop: 4,
  },
  levelSelector: {
    gap: 8,
  },
  levelOption: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  levelOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d3748',
  },
  levelOptionDescription: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  selectedLevelText: {
    color: 'white',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconOption: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  selectedIcon: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  previewSection: {
    marginTop: 8,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d3748',
    marginBottom: 8,
  },
  previewTask: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  previewInfo: {
    flex: 1,
  },
  previewTaskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d3748',
    marginBottom: 2,
  },
  previewTaskDescription: {
    fontSize: 12,
    color: '#718096',
  },
  bottomSpacer: {
    height: 100, // Espaciado adicional para evitar que se corte con el navbar
  },
});

export default CustomTasksScreen;