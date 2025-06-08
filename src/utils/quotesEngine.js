import { quotes } from '../constants/quotes';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  FAVORITE_QUOTES: 'mindcare_favorite_quotes',
  QUOTE_HISTORY: 'mindcare_quote_history',
  CUSTOM_QUOTES: 'mindcare_custom_quotes',
};

// Función principal para obtener cita inteligente
export const getSmartQuote = async (moodValue = null, forceNew = false) => {
  try {
    // Si es el mismo día y no se fuerza nueva cita, devolver la misma
    if (!forceNew) {
      const todayQuote = await getTodayQuote();
      if (todayQuote) return todayQuote;
    }

    // Obtener citas personalizadas
    const customQuotes = await getCustomQuotes();
    const allQuotes = [...quotes, ...customQuotes];

    // Filtrar por mood si existe
    let relevantQuotes = allQuotes;
    if (moodValue) {
      const moodFiltered = allQuotes.filter(quote => 
        quote.moodTarget === moodValue || quote.moodTarget === null
      );
      if (moodFiltered.length > 0) {
        relevantQuotes = moodFiltered;
      }
    }

    // Evitar repetir citas recientes
    const recentQuotes = await getRecentQuoteIds();
    const nonRecentQuotes = relevantQuotes.filter(
      quote => !recentQuotes.includes(quote.id)
    );

    const quotesToUse = nonRecentQuotes.length > 0 ? nonRecentQuotes : relevantQuotes;

    // Seleccionar cita basada en fecha + algo de aleatoriedad
    const today = new Date();
    const seed = today.getDate() + today.getMonth() * 31 + (moodValue || 0);
    const index = seed % quotesToUse.length;
    
    const selectedQuote = quotesToUse[index];

    // Guardar como cita del día
    await saveTodayQuote(selectedQuote);
    await addToQuoteHistory(selectedQuote.id);

    return selectedQuote;
  } catch (error) {
    console.error('Error getting smart quote:', error);
    return quotes[0]; // Fallback
  }
};

// Guardar cita del día
const saveTodayQuote = async (quote) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const data = {
      date: today,
      quote: quote,
      timestamp: new Date().toISOString()
    };
    await AsyncStorage.setItem(`mindcare_daily_quote_${today}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving today quote:', error);
  }
};

// Obtener cita del día si ya existe
const getTodayQuote = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const data = await AsyncStorage.getItem(`mindcare_daily_quote_${today}`);
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.quote;
    }
    return null;
  } catch (error) {
    console.error('Error getting today quote:', error);
    return null;
  }
};

// === SISTEMA DE FAVORITAS ===
export const toggleFavoriteQuote = async (quoteId) => {
  try {
    const favorites = await getFavoriteQuotes();
    const isFavorite = favorites.includes(quoteId);
    
    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter(id => id !== quoteId);
    } else {
      newFavorites = [...favorites, quoteId];
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_QUOTES, JSON.stringify(newFavorites));
    return !isFavorite;
  } catch (error) {
    console.error('Error toggling favorite quote:', error);
    return false;
  }
};

export const getFavoriteQuotes = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_QUOTES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting favorite quotes:', error);
    return [];
  }
};

export const getFavoriteQuoteObjects = async () => {
  try {
    const favoriteIds = await getFavoriteQuotes();
    const customQuotes = await getCustomQuotes();
    const allQuotes = [...quotes, ...customQuotes];
    
    return allQuotes.filter(quote => favoriteIds.includes(quote.id));
  } catch (error) {
    console.error('Error getting favorite quote objects:', error);
    return [];
  }
};

// === CITAS PERSONALIZADAS ===
export const addCustomQuote = async (text, author = 'Personal', category = 'custom') => {
  try {
    const customQuotes = await getCustomQuotes();
    const newQuote = {
      id: `custom_${Date.now()}`,
      text: text.trim(),
      author: author.trim(),
      category,
      moodTarget: null,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    
    const updatedQuotes = [...customQuotes, newQuote];
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_QUOTES, JSON.stringify(updatedQuotes));
    
    return newQuote;
  } catch (error) {
    console.error('Error adding custom quote:', error);
    return null;
  }
};

export const getCustomQuotes = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_QUOTES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting custom quotes:', error);
    return [];
  }
};

export const deleteCustomQuote = async (quoteId) => {
  try {
    const customQuotes = await getCustomQuotes();
    const filtered = customQuotes.filter(quote => quote.id !== quoteId);
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_QUOTES, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting custom quote:', error);
    return false;
  }
};

// === HISTORIAL DE CITAS ===
const addToQuoteHistory = async (quoteId) => {
  try {
    const history = await getQuoteHistory();
    const newHistory = [quoteId, ...history.slice(0, 19)]; // Mantener últimas 20
    await AsyncStorage.setItem(STORAGE_KEYS.QUOTE_HISTORY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Error adding to quote history:', error);
  }
};

const getQuoteHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.QUOTE_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting quote history:', error);
    return [];
  }
};

const getRecentQuoteIds = async () => {
  try {
    const history = await getQuoteHistory();
    return history.slice(0, 10); // Últimas 10 citas para evitar repetición
  } catch (error) {
    console.error('Error getting recent quote ids:', error);
    return [];
  }
};

// === UTILIDADES ===
export const getQuoteByCategory = async (category) => {
  try {
    const customQuotes = await getCustomQuotes();
    const allQuotes = [...quotes, ...customQuotes];
    const filtered = allQuotes.filter(quote => quote.category === category);
    
    if (filtered.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  } catch (error) {
    console.error('Error getting quote by category:', error);
    return null;
  }
};

export const searchQuotes = async (searchTerm) => {
  try {
    const customQuotes = await getCustomQuotes();
    const allQuotes = [...quotes, ...customQuotes];
    const term = searchTerm.toLowerCase();
    
    return allQuotes.filter(quote => 
      quote.text.toLowerCase().includes(term) ||
      quote.author.toLowerCase().includes(term) ||
      quote.category.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error searching quotes:', error);
    return [];
  }
};