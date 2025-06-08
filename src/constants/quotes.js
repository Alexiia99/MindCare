export const quotes = [
  // Citas para días difíciles (mood 1-2)
  {
    id: 1,
    text: "Está bien no estar bien. Lo que importa es que sigues aquí.",
    author: "Anónimo",
    category: "hope",
    moodTarget: 1,
  },
  {
    id: 2, 
    text: "Los días difíciles no duran, pero las personas resilientes sí.",
    author: "Robert H. Schuller",
    category: "hope",
    moodTarget: 1,
  },
  {
    id: 3,
    text: "No tienes que ser positivo todo el tiempo. Está bien sentir lo que sientes.",
    author: "Anónimo", 
    category: "calm",
    moodTarget: 2,
  },
  
  // Citas para días neutros/normales (mood 3)
  {
    id: 4,
    text: "El progreso, no la perfección, es lo que deberíamos buscar.",
    author: "Anónimo",
    category: "motivation", 
    moodTarget: 3,
  },
  {
    id: 5,
    text: "Cada día es una nueva oportunidad para ser amable contigo mismo.",
    author: "Anónimo",
    category: "calm",
    moodTarget: 3,
  },
  {
    id: 6,
    text: "Pequeños pasos cada día llevan a grandes cambios a lo largo del tiempo.",
    author: "Anónimo",
    category: "motivation",
    moodTarget: 3,
  },
  
  // Citas para días buenos (mood 4-5)
  {
    id: 7,
    text: "Tu potencial es infinito. Celebra cada paso hacia adelante.",
    author: "Anónimo",
    category: "motivation",
    moodTarget: 4,
  },
  {
    id: 8,
    text: "Los momentos de alegría son regalos. Permítete disfrutarlos plenamente.",
    author: "Anónimo", 
    category: "motivation",
    moodTarget: 5,
  },
  {
    id: 9,
    text: "Hoy tienes la energía para crear algo hermoso.",
    author: "Anónimo",
    category: "motivation",
    moodTarget: 5,
  },
  
  // Citas generales/motivacionales
  {
    id: 10,
    text: "La autocompasión no es autoindulgencia, es una necesidad.",
    author: "Kristin Neff",
    category: "calm",
    moodTarget: null,
  },
  {
    id: 11,
    text: "Cuidarte no es egoísta. Es esencial.",
    author: "Anónimo",
    category: "motivation", 
    moodTarget: null,
  },
  {
    id: 12,
    text: "Eres más fuerte de lo que crees y más valioso de lo que imaginas.",
    author: "Anónimo",
    category: "hope",
    moodTarget: null,
  },
  {
    id: 13,
    text: "La sanación no es lineal. Algunos días serán mejores que otros.",
    author: "Anónimo",
    category: "calm",
    moodTarget: null,
  },
  {
    id: 14,
    text: "Tu mente es un jardín. Puedes elegir qué pensamientos cultivar.",
    author: "Anónimo",
    category: "motivation",
    moodTarget: null,
  }
];

// Función para obtener cita según el estado de ánimo
export const getQuoteForMood = (moodValue) => {
  // Filtrar citas que coincidan con el mood o sean generales
  const relevantQuotes = quotes.filter(quote => 
    quote.moodTarget === moodValue || quote.moodTarget === null
  );
  
  // Si no hay citas específicas, usar todas
  const quotesToUse = relevantQuotes.length > 0 ? relevantQuotes : quotes;
  
  // Devolver una cita aleatoria basada en la fecha para consistencia
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const index = dayOfYear % quotesToUse.length;
  
  return quotesToUse[index];
};

// Función para obtener cita diaria (basada en fecha para consistencia)
export const getDailyQuote = (date = new Date()) => {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const index = dayOfYear % quotes.length;
  return quotes[index];
};

// Función para obtener cita contextual (según ánimo si existe, sino diaria)
export const getContextualQuote = async (getTodayMood) => {
  try {
    const todayMood = await getTodayMood();
    
    if (todayMood && todayMood.value) {
      return getQuoteForMood(todayMood.value);
    } else {
      return getDailyQuote();
    }
  } catch (error) {
    return getDailyQuote();
  }
};