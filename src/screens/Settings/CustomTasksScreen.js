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

const icons = [
  'star-outline', 'heart-outline', 'home-outline', 'book-outline',
  'fitness-outline', 'musical-notes-outline', 'camera-outline',
  'call-outline', 'mail-outline', 'cafe-outline', 'bicycle-outline',
  'walk-outline', 'bed-outline', 'sunny-outline'
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
      
      setNewTask({ title: '', description: '', level: 2, icon: 'star-outline' });
      setShowAddModal(false);
      
      Alert.alert('¡Listo!', 'Tarea personalizada creada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la tarea');
    }
  };

  const handleDeleteTask = (taskId) => {
    Alert.alert(
      'Eliminar tarea',
      '¿Estás seguro de que quieres eliminar esta tarea personalizada?',
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tareas Personalizadas</Text>
          <Text style={styles.subtitle}>
            Crea tareas específicas para tus objetivos personales
          </Text>
        </View>

        {/* Botón agregar */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add-circle" size={24} color={colors.primary} />
          <Text style={styles.addButtonText}>Crear nueva tarea</Text>
        </TouchableOpacity>

        {/* Lista de tareas */}
        {customTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No tienes tareas personalizadas</Text>
            <Text style={styles.emptyText}>
              Crea tareas específicas para tus objetivos y rutinas personales
            </Text>
          </View>
        ) : (
          <View style={styles.tasksList}>
            {customTasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <View style={styles.taskLeft}>
                  <View style={[styles.taskIcon, { backgroundColor: taskLevels[task.level].color + '20' }]}>
                    <Ionicons 
                      name={task.icon} 
                      size={24} 
                      color={taskLevels[task.level].color} 
                    />
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, !task.isActive && styles.inactiveTask]}>
                      {task.title}
                    </Text>
                    {task.description ? (
                      <Text style={styles.taskDescription}>{task.description}</Text>
                    ) : null}
                    <Text style={styles.taskLevel}>
                      Nivel {task.level} - {taskLevels[task.level].name}
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
                      color={colors.textSecondary} 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteTask(task.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Modal para agregar tarea */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalCancel}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Nueva Tarea</Text>
              <TouchableOpacity onPress={handleAddTask}>
                <Text style={styles.modalSave}>Guardar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Título */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Título de la tarea *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: Meditar 5 minutos"
                  value={newTask.title}
                  onChangeText={(text) => setNewTask({...newTask, title: text})}
                  maxLength={50}
                />
              </View>

              {/* Descripción */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Descripción (opcional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Describe brevemente qué involucra esta tarea..."
                  value={newTask.description}
                  onChangeText={(text) => setNewTask({...newTask, description: text})}
                  multiline
                  numberOfLines={3}
                  maxLength={150}
                />
              </View>

              {/* Nivel */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>¿En qué nivel aparecerá?</Text>
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
                        {info.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Icono */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Elige un icono</Text>
                <View style={styles.iconGrid}>
                  {icons.map((icon) => (
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
                        color={newTask.icon === icon ? colors.white : colors.primary} 
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
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
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addButtonText: {
    marginLeft: spacing.sm,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  tasksList: {
    paddingHorizontal: spacing.lg,
  },
  taskItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
    alignItems: 'center',
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
    marginRight: spacing.md,
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
  inactiveTask: {
    opacity: 0.6,
  },
  taskDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  taskLevel: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  taskActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  modalCancel: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  modalSave: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  inputSection: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  levelSelector: {
    gap: spacing.sm,
  },
  levelOption: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  levelOptionText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  selectedLevelText: {
    color: colors.white,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconOption: {
    width: 48,
    height: 48,
    backgroundColor: colors.white,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  selectedIcon: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});

export default CustomTasksScreen;