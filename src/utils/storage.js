import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

// Claves para AsyncStorage
const STORAGE_KEYS = {
  MOODS: 'mindcare_moods',
  TASKS: 'mindcare_tasks', 
  JOURNAL: 'mindcare_journal',
  SETTINGS: 'mindcare_settings',
};

// Obtener fecha en formato YYYY-MM-DD
export const getDateKey = (date = new Date()) => {
  return format(date, 'yyyy-MM-dd');
};

// === FUNCIONES DE ÁNIMO ===
export const saveMoodEntry = async (moodData) => {
  try {
    const dateKey = getDateKey();
    const moods = await getMoods();
    
    moods[dateKey] = {
      ...moodData,
      timestamp: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(moods));
    return true;
  } catch (error) {
    console.error('Error saving mood:', error);
    return false;
  }
};

export const getMoods = async () => {
  try {
    const moodsJson = await AsyncStorage.getItem(STORAGE_KEYS.MOODS);
    return moodsJson ? JSON.parse(moodsJson) : {};
  } catch (error) {
    console.error('Error getting moods:', error);
    return {};
  }
};

export const getTodayMood = async () => {
  try {
    const moods = await getMoods();
    const today = getDateKey();
    return moods[today] || null;
  } catch (error) {
    console.error('Error getting today mood:', error);
    return null;
  }
};

// === FUNCIONES DE TAREAS ===
export const saveCompletedTasks = async (taskIds) => {
  try {
    const dateKey = getDateKey();
    const tasks = await getAllTasks();
    
    tasks[dateKey] = taskIds;
    
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error('Error saving tasks:', error);
    return false;
  }
};

export const getAllTasks = async () => {
  try {
    const tasksJson = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
    return tasksJson ? JSON.parse(tasksJson) : {};
  } catch (error) {
    console.error('Error getting tasks:', error);
    return {};
  }
};

export const getTodayTasks = async () => {
  try {
    const tasks = await getAllTasks();
    const today = getDateKey();
    return tasks[today] || [];
  } catch (error) {
    console.error('Error getting today tasks:', error);
    return [];
  }
};

// === FUNCIONES DE DIARIO ===
export const saveJournalEntry = async (journalData) => {
  try {
    const dateKey = getDateKey();
    const journals = await getAllJournals();
    
    journals[dateKey] = {
      ...journalData,
      timestamp: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(journals));
    return true;
  } catch (error) {
    console.error('Error saving journal:', error);
    return false;
  }
};

export const getAllJournals = async () => {
  try {
    const journalsJson = await AsyncStorage.getItem(STORAGE_KEYS.JOURNAL);
    return journalsJson ? JSON.parse(journalsJson) : {};
  } catch (error) {
    console.error('Error getting journals:', error);
    return {};
  }
};

export const getTodayJournal = async () => {
  try {
    const journals = await getAllJournals();
    const today = getDateKey();
    return journals[today] || null;
  } catch (error) {
    console.error('Error getting today journal:', error);
    return null;
  }
};

// === FUNCIONES DE CONFIGURACIÓN ===
export const saveSettings = async (settings) => {
  try {
    const currentSettings = await getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

export const getSettings = async () => {
  try {
    const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    const defaultSettings = {
      currentLevel: 2,
      customTasks: [],
      emergencyContacts: [],
      notifications: {
        moodReminder: '20:00',
        enabled: true,
      },
    };
    
    return settingsJson ? { ...defaultSettings, ...JSON.parse(settingsJson) } : defaultSettings;
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      currentLevel: 2,
      customTasks: [],
      emergencyContacts: [],
      notifications: { moodReminder: '20:00', enabled: true },
    };
  }
};

// === FUNCIONES DE UTILIDAD ===
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

export const exportData = async () => {
  try {
    const moods = await getMoods();
    const tasks = await getAllTasks();
    const journals = await getAllJournals();
    const settings = await getSettings();
    
    return {
      moods,
      tasks,
      journals,
      settings,
      exportDate: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
};

// === NUEVAS FUNCIONES PARA HISTORIAL DE DIARIO ===

// Obtener entrada de diario por fecha específica
export const getJournalByDate = async (dateKey) => {
  try {
    const journals = await getAllJournals();
    return journals[dateKey] || null;
  } catch (error) {
    console.error('Error getting journal by date:', error);
    return null;
  }
};

// Obtener todas las entradas de diario con sus fechas
export const getAllJournalsWithDates = async () => {
  try {
    const journals = await getAllJournals();
    return Object.entries(journals).map(([dateKey, entry]) => ({
      dateKey,
      date: new Date(dateKey),
      ...entry
    })).sort((a, b) => new Date(b.dateKey) - new Date(a.dateKey));
  } catch (error) {
    console.error('Error getting all journals with dates:', error);
    return [];
  }
};

// Buscar en entradas de diario
export const searchJournalEntries = async (searchTerm) => {
  try {
    const journals = await getAllJournals();
    const term = searchTerm.toLowerCase();
    
    return Object.entries(journals)
      .filter(([_, entry]) => 
        entry?.text?.toLowerCase().includes(term) ||
        entry?.goodThing?.toLowerCase().includes(term)
      )
      .map(([dateKey, entry]) => ({
        dateKey,
        date: new Date(dateKey),
        ...entry
      }))
      .sort((a, b) => new Date(b.dateKey) - new Date(a.dateKey));
  } catch (error) {
    console.error('Error searching journal entries:', error);
    return [];
  }
};

// Obtener estadísticas del diario
export const getJournalStats = async () => {
  try {
    const journals = await getAllJournals();
    const entries = Object.values(journals).filter(entry => entry?.text || entry?.goodThing);
    
    return {
      totalEntries: entries.length,
      entriesWithText: entries.filter(entry => entry?.text).length,
      entriesWithGoodThing: entries.filter(entry => entry?.goodThing).length,
      avgTextLength: entries.reduce((sum, entry) => sum + (entry?.text?.length || 0), 0) / entries.length || 0,
      firstEntry: entries.length > 0 ? Object.keys(journals).sort()[0] : null,
      lastEntry: entries.length > 0 ? Object.keys(journals).sort().pop() : null,
    };
  } catch (error) {
    console.error('Error getting journal stats:', error);
    return {
      totalEntries: 0,
      entriesWithText: 0,
      entriesWithGoodThing: 0,
      avgTextLength: 0,
      firstEntry: null,
      lastEntry: null,
    };
  }
};

// Exportar entradas de diario en formato legible
export const exportJournalData = async () => {
  try {
    const journals = await getAllJournals();
    const moods = await getMoods();
    
    const exportData = Object.entries(journals)
      .filter(([_, entry]) => entry?.text || entry?.goodThing)
      .map(([dateKey, entry]) => {
        const mood = moods[dateKey];
        return {
          fecha: dateKey,
          ánimo: mood?.value ? `${mood.value}/5` : 'No registrado',
          entrada: entry.text || '',
          cosaBuena: entry.goodThing || '',
          timestamp: entry.timestamp || ''
        };
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    return exportData;
  } catch (error) {
    console.error('Error exporting journal data:', error);
    return [];
  }
};