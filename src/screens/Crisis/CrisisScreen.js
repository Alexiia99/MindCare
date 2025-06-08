// src/screens/Crisis/CrisisScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography, spacing } from '../../constants/colors';
import BreathingExercises from '../../components/BreathingExercises';

const CrisisScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showBreathing, setShowBreathing] = useState(false);

  const groundingSteps = [
    {
      title: "5 cosas que puedes VER",
      description: "Mira a tu alrededor y nombra 5 cosas que puedes ver. Tómate tu tiempo.",
      icon: "eye-outline",
    },
    {
      title: "4 cosas que puedes TOCAR",
      description: "Encuentra 4 cosas que puedas tocar. Nota su textura, temperatura.",
      icon: "hand-left-outline",
    },
    {
      title: "3 cosas que puedes ESCUCHAR",
      description: "Concéntrate en 3 sonidos diferentes a tu alrededor.",
      icon: "ear-outline",
    },
    {
      title: "2 cosas que puedes OLER",
      description: "Identifica 2 olores diferentes en tu espacio.",
      icon: "nose-outline",
    },
    {
      title: "1 cosa que puedes SABOREAR",
      description: "Nota algún sabor en tu boca o toma un sorbo de agua.",
      icon: "mouth-outline",
    },
  ];

  const emergencyContacts = [
    {
      name: "Línea de la Vida (España)",
      number: "024",
      description: "Atención 24h - Gratuita",
      color: colors.danger,
    },
    {
      name: "Emergencias",
      number: "112",
      description: "Emergencias médicas",
      color: colors.warning,
    },
  ];

  const quickHelpOptions = [
    {
      id: 'breathing',
      title: 'Ejercicios de Respiración',
      description: '5 técnicas guiadas para calmar la ansiedad',
      icon: 'leaf-outline',
      color: colors.success,
      action: () => setShowBreathing(true)
    },
    {
      id: 'grounding',
      title: 'Técnica 5-4-3-2-1',
      description: 'Vuelve al presente con tus sentidos',
      icon: 'hand-left-outline',
      color: colors.primary,
      action: () => {
        // Scroll a la sección de grounding
        setCurrentStep(0);
      }
    },
    {
      id: 'call',
      title: 'Línea de Crisis',
      description: 'Habla con alguien ahora mismo',
      icon: 'call-outline',
      color: colors.danger,
      action: () => handleCall('024')
    }
  ];

  const handleCall = (number) => {
    Alert.alert(
      'Llamar',
      `¿Quieres llamar al ${number}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Llamar', onPress: () => Linking.openURL(`tel:${number}`) },
      ]
    );
  };

  const nextStep = () => {
    if (currentStep < groundingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      Alert.alert(
        '¡Muy bien!',
        'Has completado el ejercicio de grounding. ¿Te sientes un poco mejor?',
        [
          { text: 'Repetir ejercicio', onPress: () => setCurrentStep(0) },
          { text: 'Volver al inicio', onPress: () => navigation.goBack() },
        ]
      );
    }
  };

  const resetExercise = () => {
    setCurrentStep(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="heart" size={32} color={colors.danger} />
          <Text style={styles.title}>Estás seguro/a</Text>
          <Text style={styles.subtitle}>
            Este momento difícil va a pasar. Respira conmigo.
          </Text>
        </View>

        {/* NUEVO: Ayuda Rápida */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Ayuda Inmediata</Text>
          <Text style={styles.quickHelpDescription}>
            Elige la técnica que más te ayude en este momento:
          </Text>
          
          <View style={styles.quickHelpGrid}>
            {quickHelpOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.quickHelpCard, { borderColor: option.color }]}
                onPress={option.action}
              >
                <View style={[styles.quickHelpIcon, { backgroundColor: option.color + '20' }]}>
                  <Ionicons name={option.icon} size={24} color={option.color} />
                </View>
                <Text style={styles.quickHelpTitle}>{option.title}</Text>
                <Text style={styles.quickHelpDesc}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contactos de emergencia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚨 Si necesitas ayuda inmediata</Text>
          
          {emergencyContacts.map((contact, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.emergencyButton, { borderColor: contact.color }]}
              onPress={() => handleCall(contact.number)}
            >
              <View style={styles.emergencyInfo}>
                <Text style={[styles.emergencyName, { color: contact.color }]}>
                  {contact.name}
                </Text>
                <Text style={styles.emergencyDescription}>
                  {contact.description}
                </Text>
              </View>
              <View style={[styles.emergencyNumber, { backgroundColor: contact.color }]}>
                <Ionicons name="call" size={20} color={colors.white} />
                <Text style={styles.emergencyNumberText}>{contact.number}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ejercicio de Grounding 5-4-3-2-1 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧘‍♀️ Ejercicio de Grounding</Text>
          <Text style={styles.groundingDescription}>
            Este ejercicio te ayuda a volver al presente y calmar tu mente.
          </Text>

          <View style={styles.groundingCard}>
            <View style={styles.stepHeader}>
              <Ionicons 
                name={groundingSteps[currentStep].icon} 
                size={32} 
                color={colors.primary} 
              />
              <Text style={styles.stepNumber}>
                Paso {currentStep + 1} de {groundingSteps.length}
              </Text>
            </View>

            <Text style={styles.stepTitle}>
              {groundingSteps[currentStep].title}
            </Text>
            
            <Text style={styles.stepDescription}>
              {groundingSteps[currentStep].description}
            </Text>

            <View style={styles.stepActions}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetExercise}
              >
                <Text style={styles.resetButtonText}>Reiniciar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={nextStep}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep < groundingSteps.length - 1 ? 'Siguiente' : 'Terminar'}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>

            {/* Indicador de progreso */}
            <View style={styles.progressIndicator}>
              {groundingSteps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index <= currentStep && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* ACTUALIZADO: Técnicas de respiración */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🫁 Técnicas de Respiración</Text>
          
          <TouchableOpacity 
            style={styles.breathingCard}
            onPress={() => setShowBreathing(true)}
          >
            <View style={styles.breathingHeader}>
              <View style={styles.breathingIconContainer}>
                <Ionicons name="leaf-outline" size={24} color={colors.success} />
              </View>
              <View style={styles.breathingInfo}>
                <Text style={styles.breathingTitle}>Ejercicios Guiados</Text>
                <Text style={styles.breathingSubtitle}>
                  5 técnicas diferentes con guía visual
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
            
            <View style={styles.breathingPreview}>
              <View style={styles.techniquePreview}>
                <Text style={styles.techniquePreviewText}>• Respiración 4-7-8</Text>
              </View>
              <View style={styles.techniquePreview}>
                <Text style={styles.techniquePreviewText}>• Respiración Cuadrada</Text>
              </View>
              <View style={styles.techniquePreview}>
                <Text style={styles.techniquePreviewText}>• Respiración Coherente</Text>
              </View>
              <Text style={styles.moreText}>+ 2 técnicas más</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recordatorios positivos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💙 Recuerda</Text>
          
          <View style={styles.reminderCard}>
            <Text style={styles.reminder}>
              "Has superado días difíciles antes, y puedes superar este también."
            </Text>
          </View>

          <View style={styles.reminderCard}>
            <Text style={styles.reminder}>
              "Está bien no estar bien. Pedir ayuda es de valientes."
            </Text>
          </View>

          <View style={styles.reminderCard}>
            <Text style={styles.reminder}>
              "Este sentimiento es temporal. Tú eres más fuerte de lo que crees."
            </Text>
          </View>
        </View>

        {/* Botón para volver */}
        <View style={styles.backSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text style={styles.backButtonText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* NUEVO: Modal de Ejercicios de Respiración */}
      <BreathingExercises 
        visible={showBreathing}
        onClose={() => setShowBreathing(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // CONTENEDOR PRINCIPAL
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // SCROLL CONTENT OPTIMIZADO
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 85 : 75,
  },
  
  // HEADER OPTIMIZADO
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // SECTION OPTIMIZADA
  section: {
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
  
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 12,
  },

  // NUEVO: QUICK HELP
  quickHelpDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },

  quickHelpGrid: {
    gap: 12,
  },

  quickHelpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: colors.background,
  },

  quickHelpIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  quickHelpTitle: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },

  quickHelpDesc: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  
  // EMERGENCY CONTACTS
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: colors.white,
  },
  
  emergencyInfo: {
    flex: 1,
  },
  
  emergencyName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  
  emergencyDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  
  emergencyNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  
  emergencyNumberText: {
    color: colors.white,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.base,
  },
  
  // GROUNDING EXERCISE
  groundingDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  
  groundingCard: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  stepNumber: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  
  stepTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  
  stepDescription: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  
  stepActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.textLight,
  },
  
  resetButtonText: {
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  
  nextButtonText: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  
  // PROGRESS INDICATOR
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textLight,
  },
  
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  
  // NUEVO: BREATHING CARD MEJORADA
  breathingCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    overflow: 'hidden',
  },

  breathingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },

  breathingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  breathingInfo: {
    flex: 1,
  },
  
  breathingTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },

  breathingSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },

  breathingPreview: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },

  techniquePreview: {
    marginBottom: 4,
  },

  techniquePreviewText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },

  moreText: {
    fontSize: typography.sizes.sm,
    color: colors.success,
    fontWeight: typography.weights.medium,
    marginTop: 4,
  },
  
  // REMINDER CARDS
  reminderCard: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  
  reminder: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
  },
  
  // BACK SECTION
  backSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 6,
  },
  
  backButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
  },
});

export default CrisisScreen;