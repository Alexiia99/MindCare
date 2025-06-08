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