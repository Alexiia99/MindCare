import { getMoods, getSettings, saveSettings } from './storage';
import { subDays, format } from 'date-fns';

// Configuración del sistema de detección
const DETECTION_CONFIG = {
  DAYS_TO_ANALYZE: 7, // Últimos 7 días
  MIN_ENTRIES_FOR_DETECTION: 3, // Mínimo 3 registros para sugerir
  SURVIVAL_THRESHOLD: 2, // Promedio <= 2 sugiere nivel 1
  STABILITY_THRESHOLD: 3.5, // Promedio > 2 y <= 3.5 sugiere nivel 2
  // Promedio > 3.5 sugiere nivel 3
};

// Función principal para detectar nivel sugerido
export const detectSuggestedLevel = async () => {
  try {
    const moods = await getMoods();
    const recentMoods = getRecentMoodEntries(moods);
    
    if (recentMoods.length < DETECTION_CONFIG.MIN_ENTRIES_FOR_DETECTION) {
      return {
        suggestedLevel: null,
        confidence: 0,
        reason: 'Necesitas al menos 3 registros de ánimo para la detección automática',
        analysis: null
      };
    }

    const analysis = analyzeMoodPattern(recentMoods);
    const suggestedLevel = calculateSuggestedLevel(analysis);
    const confidence = calculateConfidence(analysis, recentMoods.length);

    return {
      suggestedLevel,
      confidence,
      reason: getLevelRecommendationReason(analysis, suggestedLevel),
      analysis: {
        ...analysis,
        entriesAnalyzed: recentMoods.length,
        daysAnalyzed: DETECTION_CONFIG.DAYS_TO_ANALYZE
      }
    };
  } catch (error) {
    console.error('Error detecting suggested level:', error);
    return {
      suggestedLevel: null,
      confidence: 0,
      reason: 'Error al analizar el patrón de ánimo',
      analysis: null
    };
  }
};

// Obtener registros de ánimo recientes
const getRecentMoodEntries = (moods) => {
  const today = new Date();
  const recentEntries = [];

  // Analizar últimos N días
  for (let i = 0; i < DETECTION_CONFIG.DAYS_TO_ANALYZE; i++) {
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    if (moods[date]) {
      recentEntries.push({
        date,
        ...moods[date]
      });
    }
  }

  return recentEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Analizar patrón de ánimo
const analyzeMoodPattern = (moodEntries) => {
  const values = moodEntries.map(entry => entry.value);
  
  // Cálculos básicos
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const variance = calculateVariance(values, average);
  const stability = 1 / (1 + variance); // Entre 0 y 1, mayor es más estable
  
  // Análisis de tendencia (últimos 3 días vs primeros 3)
  const trend = calculateTrend(values);
  
  // Contar días por nivel de ánimo
  const lowDays = values.filter(v => v <= 2).length;
  const neutralDays = values.filter(v => v === 3).length;
  const goodDays = values.filter(v => v >= 4).length;
  
  // Detectar patrones especiales
  const hasVeryLowDays = values.some(v => v === 1);
  const hasConsecutiveLowDays = detectConsecutiveLowDays(values);
  const hasRecentImprovement = detectRecentImprovement(values);
  
  return {
    average: Math.round(average * 100) / 100,
    min,
    max,
    variance: Math.round(variance * 100) / 100,
    stability: Math.round(stability * 100) / 100,
    trend,
    distribution: {
      lowDays,
      neutralDays,
      goodDays,
      total: values.length
    },
    patterns: {
      hasVeryLowDays,
      hasConsecutiveLowDays,
      hasRecentImprovement
    },
    rawValues: values
  };
};

// Calcular varianza
const calculateVariance = (values, average) => {
  const squaredDiffs = values.map(value => Math.pow(value - average, 2));
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
};

// Calcular tendencia
const calculateTrend = (values) => {
  if (values.length < 4) return 'stable';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.ceil(values.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
  
  const difference = secondAvg - firstAvg;
  
  if (difference > 0.5) return 'improving';
  if (difference < -0.5) return 'declining';
  return 'stable';
};

// Detectar días consecutivos bajos
const detectConsecutiveLowDays = (values) => {
  let consecutiveCount = 0;
  let maxConsecutive = 0;
  
  for (const value of values) {
    if (value <= 2) {
      consecutiveCount++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveCount);
    } else {
      consecutiveCount = 0;
    }
  }
  
  return maxConsecutive >= 2;
};

// Detectar mejora reciente
const detectRecentImprovement = (values) => {
  if (values.length < 3) return false;
  
  const recent = values.slice(-3); // Últimos 3 días
  const beforeRecent = values.slice(-6, -3); // 3 días anteriores
  
  if (beforeRecent.length === 0) return false;
  
  const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
  const beforeAvg = beforeRecent.reduce((sum, val) => sum + val, 0) / beforeRecent.length;
  
  return recentAvg > beforeAvg + 0.5;
};

// Calcular nivel sugerido basado en análisis
const calculateSuggestedLevel = (analysis) => {
  const { average, distribution, patterns } = analysis;
  
  // Nivel 1 (Supervivencia) - Casos críticos
  if (
    average <= DETECTION_CONFIG.SURVIVAL_THRESHOLD ||
    patterns.hasConsecutiveLowDays ||
    (distribution.lowDays / distribution.total) >= 0.6 // 60% o más días bajos
  ) {
    return 1;
  }
  
  // Nivel 3 (Progreso) - Casos positivos
  if (
    average > DETECTION_CONFIG.STABILITY_THRESHOLD &&
    !patterns.hasVeryLowDays &&
    (distribution.goodDays / distribution.total) >= 0.5 && // 50% o más días buenos
    analysis.stability > 0.6 // Relativamente estable
  ) {
    return 3;
  }
  
  // Nivel 2 (Estabilización) - Caso por defecto
  return 2;
};

// Calcular confianza en la sugerencia
const calculateConfidence = (analysis, entriesCount) => {
  let confidence = 0.5; // Base 50%
  
  // Más entradas = más confianza
  confidence += Math.min(entriesCount / 7, 1) * 0.2; // +20% máximo por cantidad
  
  // Estabilidad del patrón
  confidence += analysis.stability * 0.2; // +20% máximo por estabilidad
  
  // Claridad del patrón
  const { distribution } = analysis;
  const dominantPattern = Math.max(distribution.lowDays, distribution.neutralDays, distribution.goodDays);
  const patternClarity = dominantPattern / distribution.total;
  confidence += patternClarity * 0.1; // +10% máximo por claridad
  
  return Math.min(Math.round(confidence * 100), 95); // Máximo 95%
};

// Generar razón de la recomendación
const getLevelRecommendationReason = (analysis, suggestedLevel) => {
  const { average, distribution, patterns, trend } = analysis;
  
  const reasons = [];
  
  switch (suggestedLevel) {
    case 1:
      if (patterns.hasConsecutiveLowDays) {
        reasons.push('Has tenido varios días consecutivos difíciles');
      }
      if (average <= 2) {
        reasons.push(`Tu ánimo promedio es ${average} (bajo)`);
      }
      if ((distribution.lowDays / distribution.total) >= 0.6) {
        reasons.push('La mayoría de tus días han sido difíciles');
      }
      reasons.push('Te recomendamos enfocarte solo en lo esencial');
      break;
      
    case 3:
      if (average > 3.5) {
        reasons.push(`Tu ánimo promedio es ${average} (bueno)`);
      }
      if ((distribution.goodDays / distribution.total) >= 0.5) {
        reasons.push('Has tenido muchos días positivos');
      }
      if (patterns.hasRecentImprovement) {
        reasons.push('Has mostrado mejora reciente');
      }
      reasons.push('Tienes energía para enfocarte en crecimiento y metas');
      break;
      
    case 2:
    default:
      reasons.push('Tu ánimo muestra un patrón mixto');
      if (trend === 'improving') {
        reasons.push('Estás en una tendencia positiva');
      } else if (trend === 'declining') {
        reasons.push('Hay una leve tendencia a la baja');
      }
      reasons.push('Te recomendamos mantener el equilibrio y autocuidado');
      break;
  }
  
  return reasons.join('. ');
};

// Verificar si el nivel actual es muy diferente al sugerido
export const shouldSuggestLevelChange = async () => {
  try {
    const settings = await getSettings();
    const currentLevel = settings.currentLevel || 2;
    const detection = await detectSuggestedLevel();
    
    if (!detection.suggestedLevel) return null;
    
    const levelDifference = Math.abs(currentLevel - detection.suggestedLevel);
    const isSignificantChange = levelDifference >= 1;
    const hasGoodConfidence = detection.confidence >= 70;
    
    if (isSignificantChange && hasGoodConfidence) {
      return {
        ...detection,
        currentLevel,
        shouldSuggest: true
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error checking level change suggestion:', error);
    return null;
  }
};

// Aplicar sugerencia de nivel
export const applySuggestedLevel = async (newLevel) => {
  try {
    const settings = await getSettings();
    const updatedSettings = {
      ...settings,
      currentLevel: newLevel,
      lastLevelChange: new Date().toISOString(),
      levelChangeReason: 'auto-detection'
    };
    
    await saveSettings(updatedSettings);
    return true;
  } catch (error) {
    console.error('Error applying suggested level:', error);
    return false;
  }
};

// Función para obtener reporte completo de análisis
export const getLevelAnalysisReport = async () => {
  try {
    const detection = await detectSuggestedLevel();
    const settings = await getSettings();
    const currentLevel = settings.currentLevel || 2;
    
    return {
      currentLevel,
      detection,
      needsChange: detection.suggestedLevel !== currentLevel,
      lastAnalysis: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting analysis report:', error);
    return null;
  }
};