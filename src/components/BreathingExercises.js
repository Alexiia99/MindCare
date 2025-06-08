// src/components/BreathingExercises.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography } from '../constants/colors';

// Definición de técnicas de respiración
const breathingTechniques = [
  {
    id: 'box',
    name: 'Respiración Cuadrada',
    description: 'Inhala, mantén, exhala, mantén - todo por igual',
    pattern: [4, 4, 4, 4], // inhale, hold, exhale, hold
    cycles: 4,
    duration: 64, // segundos totales
    difficulty: 'Principiante',
    benefits: 'Reduce estrés y ansiedad rápidamente',
    icon: 'square-outline',
    color: colors.primary,
    instructions: [
      'Inhala por la nariz durante 4 segundos',
      'Mantén la respiración por 4 segundos',
      'Exhala por la boca durante 4 segundos',
      'Mantén los pulmones vacíos por 4 segundos'
    ]
  },
  {
    id: '478',
    name: 'Respiración 4-7-8',
    description: 'Técnica para calmar el sistema nervioso',
    pattern: [4, 7, 8, 0],
    cycles: 4,
    duration: 76,
    difficulty: 'Intermedio',
    benefits: 'Ideal para dormir y ansiedad severa',
    icon: 'moon-outline',
    color: colors.moodNeutral,
    instructions: [
      'Inhala por la nariz durante 4 segundos',
      'Mantén la respiración por 7 segundos',
      'Exhala completamente por la boca durante 8 segundos',
      'Repite el ciclo'
    ]
  },
  {
    id: 'coherent',
    name: 'Respiración Coherente',
    description: 'Equilibra el sistema nervioso',
    pattern: [5, 0, 5, 0],
    cycles: 6,
    duration: 60,
    difficulty: 'Principiante',
    benefits: 'Mejora la variabilidad del ritmo cardíaco',
    icon: 'heart-outline',
    color: colors.moodGood,
    instructions: [
      'Inhala suavemente por 5 segundos',
      'Exhala suavemente por 5 segundos',
      'Mantén un ritmo constante y relajado',
      'Enfócate en la fluidez del movimiento'
    ]
  },
  {
    id: 'energizing',
    name: 'Respiración Energizante',
    description: 'Para aumentar energía y concentración',
    pattern: [4, 2, 4, 2],
    cycles: 8,
    duration: 96,
    difficulty: 'Avanzado',
    benefits: 'Aumenta energía y concentración',
    icon: 'flash-outline',
    color: colors.warning,
    instructions: [
      'Inhala vigorosamente por 4 segundos',
      'Pausa breve de 2 segundos',
      'Exhala con fuerza por 4 segundos',
      'Pausa breve de 2 segundos'
    ]
  },
  {
    id: 'calm',
    name: 'Respiración Calmante',
    description: 'Para momentos de mucho estrés',
    pattern: [3, 0, 6, 0],
    cycles: 5,
    duration: 45,
    difficulty: 'Principiante',
    benefits: 'Activación del sistema parasimpático',
    icon: 'leaf-outline',
    color: colors.success,
    instructions: [
      'Inhala suavemente por 3 segundos',
      'Exhala lentamente por 6 segundos',
      'La exhalación debe ser el doble de larga',
      'Imagina que sueltas toda la tensión'
    ]
  }
];

const BreathingExercises = ({ visible, onClose }) => {
  const [selectedTechnique, setSelectedTechnique] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0); // 0=inhale, 1=hold1, 2=exhale, 3=hold2
  const [currentCycle, setCurrentCycle] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);

  const circleAnimation = useRef(new Animated.Value(0.5)).current;
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && selectedTechnique) {
      startBreathingCycle();
    } else {
      stopBreathingCycle();
    }

    return () => stopBreathingCycle();
  }, [isActive, selectedTechnique]);

  const startBreathingCycle = () => {
    if (!selectedTechnique) return;

    let phaseIndex = 0;
    let cycleCount = 0;
    let timeInPhase = 0;

    intervalRef.current = setInterval(() => {
      const pattern = selectedTechnique.pattern;
      const currentPhaseDuration = pattern[phaseIndex];

      if (currentPhaseDuration === 0) {
        // Skip phases with 0 duration
        phaseIndex = (phaseIndex + 1) % 4;
        timeInPhase = 0;
        return;
      }

      timeInPhase += 1;

      // Update time remaining
      const totalTime = selectedTechnique.duration;
      const elapsed = cycleCount * pattern.reduce((a, b) => a + b, 0) + 
                     pattern.slice(0, phaseIndex).reduce((a, b) => a + b, 0) + timeInPhase;
      setTimeRemaining(totalTime - elapsed);

      // Update current phase for UI
      setCurrentPhase(phaseIndex);
      setCurrentCycle(cycleCount);

      // Animate circle based on phase
      if (phaseIndex === 0) { // Inhale
        Animated.timing(circleAnimation, {
          toValue: 1,
          duration: currentPhaseDuration * 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }).start();
      } else if (phaseIndex === 2) { // Exhale
        Animated.timing(circleAnimation, {
          toValue: 0.3,
          duration: currentPhaseDuration * 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }).start();
      }

      // Check if phase is complete
      if (timeInPhase >= currentPhaseDuration) {
        phaseIndex = (phaseIndex + 1) % 4;
        timeInPhase = 0;

        // Check if cycle is complete
        if (phaseIndex === 0) {
          cycleCount += 1;
          if (cycleCount >= selectedTechnique.cycles) {
            completeExercise();
            return;
          }
        }
      }
    }, 1000);
  };

  const stopBreathingCycle = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const completeExercise = () => {
    setIsActive(false);
    setCurrentCycle(0);
    setCurrentPhase(0);
    setTimeRemaining(0);
    
    // Reset animation
    Animated.timing(circleAnimation, {
      toValue: 0.5,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const startExercise = (technique) => {
    setSelectedTechnique(technique);
    setIsActive(true);
    setCurrentCycle(0);
    setCurrentPhase(0);
    setTimeRemaining(technique.duration);
    setShowInstructions(false);
  };

  const stopExercise = () => {
    setIsActive(false);
    setSelectedTechnique(null);
    completeExercise();
  };

  const getPhaseText = () => {
    if (!selectedTechnique || !isActive) return 'Selecciona una técnica';

    const phaseTexts = ['Inhala', 'Mantén', 'Exhala', 'Mantén'];
    return phaseTexts[currentPhase] || 'Prepárate...';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Principiante': return colors.success;
      case 'Intermedio': return colors.warning;
      case 'Avanzado': return colors.danger;
      default: return colors.textSecondary;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Cerrar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Técnicas de Respiración</Text>
          <View style={{ width: 60 }} />
        </View>

        {selectedTechnique && !showInstructions ? (
          /* Exercise View */
          <View style={styles.exerciseContainer}>
            <ScrollView contentContainerStyle={styles.exerciseContent}>
              {/* Technique Info */}
              <View style={styles.techniqueHeader}>
                <Ionicons 
                  name={selectedTechnique.icon} 
                  size={32} 
                  color={selectedTechnique.color} 
                />
                <Text style={styles.techniqueName}>{selectedTechnique.name}</Text>
                <Text style={styles.techniqueDescription}>
                  {selectedTechnique.description}
                </Text>
              </View>

              {/* Breathing Circle */}
              <View style={styles.circleContainer}>
                <Animated.View
                  style={[
                    styles.breathingCircle,
                    {
                      backgroundColor: selectedTechnique.color + '20',
                      borderColor: selectedTechnique.color,
                      transform: [{
                        scale: circleAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.7, 1.2],
                        })
                      }]
                    }
                  ]}
                >
                  <Text style={[styles.phaseText, { color: selectedTechnique.color }]}>
                    {getPhaseText()}
                  </Text>
                  {isActive && (
                    <Text style={styles.cycleText}>
                      Ciclo {currentCycle + 1} de {selectedTechnique.cycles}
                    </Text>
                  )}
                </Animated.View>
              </View>

              {/* Controls */}
              <View style={styles.controls}>
                {!isActive ? (
                  <>
                    <TouchableOpacity
                      style={styles.instructionsButton}
                      onPress={() => setShowInstructions(true)}
                    >
                      <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
                      <Text style={styles.instructionsButtonText}>Ver instrucciones</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.startButton, { backgroundColor: selectedTechnique.color }]}
                      onPress={() => startExercise(selectedTechnique)}
                    >
                      <Ionicons name="play" size={24} color={colors.white} />
                      <Text style={styles.startButtonText}>Comenzar</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.timeContainer}>
                      <Text style={styles.timeLabel}>Tiempo restante</Text>
                      <Text style={styles.timeText}>{formatTime(timeRemaining)}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.stopButton}
                      onPress={stopExercise}
                    >
                      <Ionicons name="stop" size={20} color={colors.danger} />
                      <Text style={styles.stopButtonText}>Detener</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </ScrollView>
          </View>
        ) : showInstructions ? (
          /* Instructions View */
          <View style={styles.instructionsContainer}>
            <ScrollView style={styles.instructionsContent}>
              <View style={styles.techniqueHeader}>
                <Ionicons 
                  name={selectedTechnique.icon} 
                  size={32} 
                  color={selectedTechnique.color} 
                />
                <Text style={styles.techniqueName}>{selectedTechnique.name}</Text>
              </View>

              <View style={styles.instructionsSection}>
                <Text style={styles.instructionsTitle}>📋 Instrucciones</Text>
                {selectedTechnique.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>{index + 1}</Text>
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.instructionsSection}>
                <Text style={styles.instructionsTitle}>ℹ️ Información</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Dificultad:</Text>
                  <Text style={[styles.infoValue, { color: getDifficultyColor(selectedTechnique.difficulty) }]}>
                    {selectedTechnique.difficulty}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Duración:</Text>
                  <Text style={styles.infoValue}>{formatTime(selectedTechnique.duration)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ciclos:</Text>
                  <Text style={styles.infoValue}>{selectedTechnique.cycles}</Text>
                </View>
                <Text style={styles.benefitsText}>
                  💡 {selectedTechnique.benefits}
                </Text>
              </View>

              <View style={styles.instructionsActions}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setShowInstructions(false)}
                >
                  <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
                  <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.startButton, { backgroundColor: selectedTechnique.color }]}
                  onPress={() => startExercise(selectedTechnique)}
                >
                  <Ionicons name="play" size={20} color={colors.white} />
                  <Text style={styles.startButtonText}>Comenzar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        ) : (
          /* Technique Selection */
          <ScrollView style={styles.techniquesList}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Elige una técnica de respiración</Text>
              <Text style={styles.sectionSubtitle}>
                Cada técnica está diseñada para diferentes situaciones y niveles de experiencia
              </Text>
            </View>

            {breathingTechniques.map((technique) => (
              <TouchableOpacity
                key={technique.id}
                style={styles.techniqueCard}
                onPress={() => setSelectedTechnique(technique)}
              >
                <View style={styles.techniqueIcon}>
                  <Ionicons name={technique.icon} size={24} color={technique.color} />
                </View>
                
                <View style={styles.techniqueInfo}>
                  <View style={styles.techniqueTop}>
                    <Text style={styles.cardTechniqueName}>{technique.name}</Text>
                    <View style={[
                      styles.difficultyBadge,
                      { backgroundColor: getDifficultyColor(technique.difficulty) + '20' }
                    ]}>
                      <Text style={[
                        styles.difficultyText,
                        { color: getDifficultyColor(technique.difficulty) }
                      ]}>
                        {technique.difficulty}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.cardTechniqueDescription}>
                    {technique.description}
                  </Text>
                  
                  <View style={styles.techniqueDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.detailText}>{formatTime(technique.duration)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="refresh-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.detailText}>{technique.cycles} ciclos</Text>
                    </View>
                  </View>

                  <Text style={styles.benefitsText}>💡 {technique.benefits}</Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
    backgroundColor: colors.white,
  },
  closeButton: {
    width: 60,
  },
  closeText: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },

  // Technique Selection
  techniquesList: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  techniqueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  techniqueIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  techniqueInfo: {
    flex: 1,
  },
  techniqueTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTechniqueName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  cardTechniqueDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  techniqueDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  benefitsText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },

  // Exercise View
  exerciseContainer: {
    flex: 1,
  },
  exerciseContent: {
    padding: 16,
    alignItems: 'center',
  },
  techniqueHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  techniqueName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  techniqueDescription: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseText: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  cycleText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  controls: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  instructionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textLight,
    gap: 8,
  },
  instructionsButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  startButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.white,
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  timeText: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
    gap: 8,
  },
  stopButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.danger,
  },

  // Instructions View
  instructionsContainer: {
    flex: 1,
  },
  instructionsContent: {
    flex: 1,
    padding: 16,
  },
  instructionsSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    backgroundColor: colors.primary,
    borderRadius: 12,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 24,
  },
  instructionText: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  instructionsActions: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textLight,
    gap: 8,
  },
  backButtonText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
});

export default BreathingExercises;