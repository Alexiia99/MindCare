// src/components/LevelSuggestion.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography } from '../constants/colors';
import { taskLevels } from '../constants/tasks';
import { 
  shouldSuggestLevelChange, 
  applySuggestedLevel,
  getLevelAnalysisReport 
} from '../utils/levelDetection';

const LevelSuggestion = ({ onLevelChanged }) => {
  const [suggestion, setSuggestion] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisReport, setAnalysisReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkForSuggestions();
  }, []);

  const checkForSuggestions = async () => {
    try {
      const suggestionData = await shouldSuggestLevelChange();
      setSuggestion(suggestionData);
    } catch (error) {
      console.error('Error checking level suggestions:', error);
    }
  };

  const handleAcceptSuggestion = () => {
    if (!suggestion) return;

    const currentLevelInfo = taskLevels[suggestion.currentLevel];
    const suggestedLevelInfo = taskLevels[suggestion.suggestedLevel];

    Alert.alert(
      'Cambiar Nivel',
      `¿Cambiar de "${currentLevelInfo.name}" a "${suggestedLevelInfo.name}"?\n\n${suggestion.reason}`,
      [
        { text: 'No, mantener actual', style: 'cancel' },
        {
          text: 'Sí, cambiar',
          onPress: async () => {
            const success = await applySuggestedLevel(suggestion.suggestedLevel);
            if (success) {
              setSuggestion(null);
              onLevelChanged?.(suggestion.suggestedLevel);
              Alert.alert(
                '¡Listo! ✨',
                `Tu nivel ha sido cambiado a "${suggestedLevelInfo.name}"`
              );
            }
          }
        }
      ]
    );
  };

  const handleShowAnalysis = async () => {
    setLoading(true);
    try {
      const report = await getLevelAnalysisReport();
      setAnalysisReport(report);
      setShowAnalysis(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el análisis');
    } finally {
      setLoading(false);
    }
  };

  const dismissSuggestion = () => {
    Alert.alert(
      'Ignorar sugerencia',
      '¿Estás seguro? La sugerencia se basó en tu patrón de ánimo reciente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, ignorar',
          onPress: () => setSuggestion(null)
        }
      ]
    );
  };

  if (!suggestion) return null;

  const suggestedLevelInfo = taskLevels[suggestion.suggestedLevel];
  const currentLevelInfo = taskLevels[suggestion.currentLevel];

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="analytics" size={20} color={colors.primary} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Sugerencia Automática</Text>
            <Text style={styles.confidence}>
              Confianza: {suggestion.confidence}%
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.dismissButton}
            onPress={dismissSuggestion}
          >
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.levelChange}>
            <View style={styles.levelIndicator}>
              <View style={[styles.levelDot, { backgroundColor: currentLevelInfo.color }]} />
              <Text style={styles.levelName}>{currentLevelInfo.name}</Text>
            </View>
            
            <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
            
            <View style={styles.levelIndicator}>
              <View style={[styles.levelDot, { backgroundColor: suggestedLevelInfo.color }]} />
              <Text style={styles.levelName}>{suggestedLevelInfo.name}</Text>
            </View>
          </View>

          <Text style={styles.reason}>
            {suggestion.reason}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.analysisButton}
              onPress={handleShowAnalysis}
              disabled={loading}
            >
              <Ionicons 
                name="bar-chart-outline" 
                size={16} 
                color={colors.textSecondary} 
              />
              <Text style={styles.analysisButtonText}>Ver análisis</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={handleAcceptSuggestion}
            >
              <Text style={styles.acceptButtonText}>Cambiar nivel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modal de Análisis */}
      <Modal
        visible={showAnalysis}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAnalysis(false)}>
              <Text style={styles.modalClose}>Cerrar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Análisis de Nivel</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {analysisReport && (
              <>
                <View style={styles.analysisSection}>
                  <Text style={styles.analysisSectionTitle}>
                    📊 Resumen del Análisis
                  </Text>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Días analizados:</Text>
                    <Text style={styles.statValue}>
                      {analysisReport.detection.analysis?.daysAnalyzed || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Registros encontrados:</Text>
                    <Text style={styles.statValue}>
                      {analysisReport.detection.analysis?.entriesAnalyzed || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Ánimo promedio:</Text>
                    <Text style={styles.statValue}>
                      {analysisReport.detection.analysis?.average || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Estabilidad:</Text>
                    <Text style={styles.statValue}>
                      {analysisReport.detection.analysis?.stability 
                        ? `${Math.round(analysisReport.detection.analysis.stability * 100)}%`
                        : 'N/A'
                      }
                    </Text>
                  </View>
                </View>

                {analysisReport.detection.analysis?.distribution && (
                  <View style={styles.analysisSection}>
                    <Text style={styles.analysisSectionTitle}>
                      📈 Distribución de Días
                    </Text>
                    <View style={styles.distributionContainer}>
                      <View style={styles.distributionItem}>
                        <View style={[styles.distributionDot, { backgroundColor: colors.moodBad }]} />
                        <Text style={styles.distributionText}>
                          Días difíciles: {analysisReport.detection.analysis.distribution.lowDays}
                        </Text>
                      </View>
                      <View style={styles.distributionItem}>
                        <View style={[styles.distributionDot, { backgroundColor: colors.moodNeutral }]} />
                        <Text style={styles.distributionText}>
                          Días neutros: {analysisReport.detection.analysis.distribution.neutralDays}
                        </Text>
                      </View>
                      <View style={styles.distributionItem}>
                        <View style={[styles.distributionDot, { backgroundColor: colors.moodGood }]} />
                        <Text style={styles.distributionText}>
                          Días buenos: {analysisReport.detection.analysis.distribution.goodDays}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.analysisSection}>
                  <Text style={styles.analysisSectionTitle}>
                    🎯 Recomendación
                  </Text>
                  <Text style={styles.recommendationText}>
                    {analysisReport.detection.reason}
                  </Text>
                  <Text style={styles.confidenceText}>
                    Confianza en la recomendación: {analysisReport.detection.confidence}%
                  </Text>
                </View>

                <View style={styles.analysisSection}>
                  <Text style={styles.analysisSectionTitle}>
                    ℹ️ Sobre el Análisis Automático
                  </Text>
                  <Text style={styles.infoText}>
                    Este sistema analiza tu patrón de ánimo de los últimos días para sugerir 
                    el nivel de tareas más apropiado. Los niveles se ajustan según tu estado 
                    emocional para que siempre tengas objetivos alcanzables.
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryLight + '15',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  confidence: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  dismissButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  levelChange: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  levelIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  levelName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  reason: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginVertical: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  analysisButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textLight,
    gap: 4,
  },
  analysisButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.white,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  modalClose: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.medium,
    width: 60,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  analysisSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  analysisSectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  distributionContainer: {
    gap: 8,
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distributionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  distributionText: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
  },
  recommendationText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default LevelSuggestion;