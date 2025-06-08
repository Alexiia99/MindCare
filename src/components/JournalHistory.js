import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, subDays, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';

import { colors, typography } from '../constants/colors';
import { getAllJournals, getMoods } from '../utils/storage';

const JournalHistory = ({ visible, onClose, onSelectDate }) => {
  const [journals, setJournals] = useState({});
  const [moods, setMoods] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    try {
      const [journalData, moodData] = await Promise.all([
        getAllJournals(),
        getMoods()
      ]);
      setJournals(journalData);
      setMoods(moodData);
    } catch (error) {
      console.error('Error loading journal history:', error);
    }
  };

  const getEntriesForMonth = () => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return days.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const journal = journals[dateKey];
      const mood = moods[dateKey];
      
      return {
        date: day,
        dateKey,
        journal,
        mood,
        hasEntry: !!journal?.text || !!journal?.goodThing
      };
    });
  };

  const getRecentEntries = () => {
    const entries = Object.entries(journals)
      .filter(([_, entry]) => entry?.text || entry?.goodThing)
      .map(([dateKey, entry]) => ({
        dateKey,
        date: parseISO(dateKey),
        journal: entry,
        mood: moods[dateKey]
      }))
      .sort((a, b) => new Date(b.dateKey) - new Date(a.dateKey))
      .slice(0, 20); // Últimas 20 entradas

    if (searchText) {
      return entries.filter(entry => 
        entry.journal?.text?.toLowerCase().includes(searchText.toLowerCase()) ||
        entry.journal?.goodThing?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return entries;
  };

  const getMoodColor = (moodValue) => {
    if (!moodValue) return colors.textLight;
    switch (moodValue) {
      case 1: return colors.moodVeryBad;
      case 2: return colors.moodBad;
      case 3: return colors.moodNeutral;
      case 4: return colors.moodGood;
      case 5: return colors.moodGreat;
      default: return colors.textLight;
    }
  };

  const getMoodEmoji = (moodValue) => {
    if (!moodValue) return '○';
    const emojis = { 1: '😰', 2: '😞', 3: '😐', 4: '😊', 5: '😄' };
    return emojis[moodValue] || '○';
  };

  const handleSelectEntry = (entry) => {
    onSelectDate(entry.dateKey, entry.journal);
    onClose();
  };

  const goToPreviousMonth = () => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const renderCalendarDay = (dayData) => {
    const { date, hasEntry, mood, journal } = dayData;
    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    const dayNumber = format(date, 'd');

    return (
      <TouchableOpacity
        key={dayData.dateKey}
        style={[
          styles.calendarDay,
          hasEntry && styles.calendarDayWithEntry,
          isToday && styles.calendarDayToday
        ]}
        onPress={() => hasEntry && handleSelectEntry(dayData)}
        disabled={!hasEntry}
      >
        <Text style={[
          styles.calendarDayNumber,
          hasEntry && styles.calendarDayNumberWithEntry,
          isToday && styles.calendarDayNumberToday
        ]}>
          {dayNumber}
        </Text>
        
        {hasEntry && (
          <View style={[
            styles.moodIndicator,
            { backgroundColor: getMoodColor(mood?.value) }
          ]} />
        )}
        
        {hasEntry && (
          <Text style={styles.moodEmoji}>
            {getMoodEmoji(mood?.value)}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderListEntry = ({ item }) => {
    const { dateKey, date, journal, mood } = item;
    const preview = journal?.text?.slice(0, 100) || journal?.goodThing || '';

    return (
      <TouchableOpacity
        style={styles.listEntry}
        onPress={() => handleSelectEntry(item)}
      >
        <View style={styles.entryHeader}>
          <View style={styles.entryDate}>
            <Text style={styles.entryDateText}>
              {format(date, 'EEEE d', { locale: es })}
            </Text>
            <Text style={styles.entryMonthText}>
              {format(date, 'MMMM yyyy', { locale: es })}
            </Text>
          </View>
          
          {mood?.value && (
            <View style={styles.entryMood}>
              <View style={[
                styles.entryMoodDot,
                { backgroundColor: getMoodColor(mood.value) }
              ]} />
              <Text style={styles.entryMoodEmoji}>
                {getMoodEmoji(mood.value)}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.entryPreview} numberOfLines={2}>
          {preview || 'Sin contenido'}
        </Text>

        {journal?.goodThing && (
          <View style={styles.goodThingPreview}>
            <Ionicons name="heart" size={12} color={colors.success} />
            <Text style={styles.goodThingText} numberOfLines={1}>
              {journal.goodThing}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getMonthStats = () => {
    const monthEntries = getEntriesForMonth().filter(day => day.hasEntry);
    const totalEntries = monthEntries.length;
    const avgMood = monthEntries
      .filter(day => day.mood?.value)
      .reduce((sum, day, _, arr) => sum + day.mood.value / arr.length, 0);

    return { totalEntries, avgMood };
  };

  const stats = getMonthStats();

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
          <Text style={styles.headerTitle}>Historial del Diario</Text>
          <TouchableOpacity 
            onPress={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
            style={styles.viewModeButton}
          >
            <Ionicons 
              name={viewMode === 'calendar' ? 'list' : 'calendar'} 
              size={20} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>

        {viewMode === 'calendar' ? (
          /* Calendar View */
          <ScrollView style={styles.content}>
            {/* Month Navigation */}
            <View style={styles.monthNavigation}>
              <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthButton}>
                <Ionicons name="chevron-back" size={24} color={colors.primary} />
              </TouchableOpacity>

              <View style={styles.monthInfo}>
                <Text style={styles.monthTitle}>
                  {format(selectedMonth, 'MMMM yyyy', { locale: es })}
                </Text>
                <Text style={styles.monthStats}>
                  {stats.totalEntries} entradas
                  {stats.avgMood > 0 && ` • Ánimo promedio: ${stats.avgMood.toFixed(1)}`}
                </Text>
              </View>

              <TouchableOpacity onPress={goToNextMonth} style={styles.monthButton}>
                <Ionicons name="chevron-forward" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendar}>
              {/* Week days */}
              <View style={styles.weekDays}>
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                  <Text key={day} style={styles.weekDay}>{day}</Text>
                ))}
              </View>

              {/* Calendar Days */}
              <View style={styles.calendarGrid}>
                {getEntriesForMonth().map(renderCalendarDay)}
              </View>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              <Text style={styles.legendTitle}>Leyenda:</Text>
              <View style={styles.legendItems}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                  <Text style={styles.legendText}>Día con entrada</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                  <Text style={styles.legendText}>Hoy</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        ) : (
          /* List View */
          <View style={styles.content}>
            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar en entradas..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor={colors.textLight}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Entries List */}
            <FlatList
              data={getRecentEntries()}
              renderItem={renderListEntry}
              keyExtractor={item => item.dateKey}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="book-outline" size={48} color={colors.textLight} />
                  <Text style={styles.emptyTitle}>
                    {searchText ? 'No se encontraron entradas' : 'No hay entradas aún'}
                  </Text>
                  <Text style={styles.emptyText}>
                    {searchText 
                      ? 'Prueba con diferentes palabras de búsqueda'
                      : 'Comienza escribiendo en tu diario para ver tu historial aquí'
                    }
                  </Text>
                </View>
              }
            />
          </View>
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
  viewModeButton: {
    width: 60,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
  },

  // Calendar View
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
    marginBottom: 8,
  },
  monthButton: {
    padding: 8,
  },
  monthInfo: {
    flex: 1,
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  monthStats: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  calendar: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%', // 7 days
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
    position: 'relative',
  },
  calendarDayWithEntry: {
    backgroundColor: colors.primary + '10',
  },
  calendarDayToday: {
    backgroundColor: colors.warning + '20',
    borderWidth: 2,
    borderColor: colors.warning,
  },
  calendarDayNumber: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  calendarDayNumberWithEntry: {
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  calendarDayNumberToday: {
    color: colors.warning,
    fontWeight: typography.weights.bold,
  },
  moodIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  moodEmoji: {
    position: 'absolute',
    bottom: 2,
    fontSize: 10,
  },
  legend: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
  },
  legendTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },

  // List View
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    paddingVertical: 12,
  },
  listEntry: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryDate: {
    flex: 1,
  },
  entryDateText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  entryMonthText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  entryMood: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  entryMoodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  entryMoodEmoji: {
    fontSize: typography.sizes.base,
  },
  entryPreview: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 8,
  },
  goodThingPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },
  goodThingText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.success,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default JournalHistory;