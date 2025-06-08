import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getTodayMood, getTodayTasks, getSettings } from './storage';

// Configuración de tipos de notificación
const NOTIFICATION_TYPES = {
  MOOD_REMINDER: 'mood_reminder',
  TASK_REMINDER: 'task_reminder',
  JOURNAL_REMINDER: 'journal_reminder',
  MOTIVATIONAL: 'motivational',
  BREATHING_REMINDER: 'breathing_reminder',
};

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Solicitar permisos de notificación
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // Configurar canal para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('mindcare-default', {
        name: 'MindCare Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#667eea',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// === PROGRAMAR NOTIFICACIONES ===

// Recordatorio de ánimo
export const scheduleMoodReminder = async (hour = 20, minute = 0) => {
  try {
    // Cancelar recordatorio anterior
    await cancelNotificationsByType(NOTIFICATION_TYPES.MOOD_REMINDER);

    const messages = [
      "¿Cómo te sientes hoy? 💙",
      "Es momento de registrar tu ánimo 😊",
      "¿Qué tal ha sido tu día? Cuéntamelo 🌟",
      "Unos segundos para ti: ¿cómo estás? 🤗",
      "Tu bienestar importa. ¿Cómo te sientes? 💚"
    ];

    // Programar para los próximos 7 días
    for (let i = 1; i <= 7; i++) {
      const triggerDate = new Date();
      triggerDate.setDate(triggerDate.getDate() + i);
      triggerDate.setHours(hour, minute, 0, 0);

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'MindCare 💙',
          body: randomMessage,
          data: { type: NOTIFICATION_TYPES.MOOD_REMINDER },
        },
        trigger: triggerDate,
      });
    }

    console.log(`Mood reminders scheduled for ${hour}:${minute.toString().padStart(2, '0')}`);
  } catch (error) {
    console.error('Error scheduling mood reminder:', error);
  }
};

// Recordatorio de tareas
export const scheduleTaskReminder = async (hour = 10, minute = 0) => {
  try {
    await cancelNotificationsByType(NOTIFICATION_TYPES.TASK_REMINDER);

    const messages = [
      "¡Buenos días! ¿Listos para las tareas de hoy? 💪",
      "Pequeños pasos hacia el bienestar ✨",
      "Hoy es un buen día para cuidarte 🌟",
      "¿Empezamos con las tareas de hoy? 🚀",
      "Tu futuro yo te agradecerá estos pequeños pasos 💚"
    ];

    for (let i = 1; i <= 7; i++) {
      const triggerDate = new Date();
      triggerDate.setDate(triggerDate.getDate() + i);
      triggerDate.setHours(hour, minute, 0, 0);

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Tareas del día 📝',
          body: randomMessage,
          data: { type: NOTIFICATION_TYPES.TASK_REMINDER },
        },
        trigger: triggerDate,
      });
    }
  } catch (error) {
    console.error('Error scheduling task reminder:', error);
  }
};

// Recordatorio de diario
export const scheduleJournalReminder = async (hour = 21, minute = 30) => {
  try {
    await cancelNotificationsByType(NOTIFICATION_TYPES.JOURNAL_REMINDER);

    const messages = [
      "¿Qué tal si escribes sobre tu día? 📝",
      "Un momento para reflexionar en tu diario 💭",
      "Tu historia importa. ¿La escribimos? 📖",
      "Tiempo de conectar contigo en el diario ✨",
      "¿Qué cosa buena pasó hoy? Escríbelo 🌟"
    ];

    for (let i = 1; i <= 7; i++) {
      const triggerDate = new Date();
      triggerDate.setDate(triggerDate.getDate() + i);
      triggerDate.setHours(hour, minute, 0, 0);

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Momento de escribir 📝',
          body: randomMessage,
          data: { type: NOTIFICATION_TYPES.JOURNAL_REMINDER },
        },
        trigger: triggerDate,
      });
    }
  } catch (error) {
    console.error('Error scheduling journal reminder:', error);
  }
};

// Recordatorio de respiración (inteligente basado en ánimo)
export const scheduleBreathingReminder = async () => {
  try {
    const todayMood = await getTodayMood();
    
    // Solo si el ánimo es bajo o no registrado
    if (!todayMood || todayMood.value <= 2) {
      const messages = [
        "¿Te gustaría hacer unos ejercicios de respiración? 🫁",
        "Un momento para respirar y calmarte 💙",
        "La respiración consciente puede ayudarte ahora 🌸",
        "¿Respiramos juntos unos minutos? 🧘‍♀️"
      ];

      // Programar en 2-3 horas
      const triggerDate = new Date();
      triggerDate.setHours(triggerDate.getHours() + 2 + Math.random()); // 2-3 horas

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Momento de calma 🌸',
          body: randomMessage,
          data: { type: NOTIFICATION_TYPES.BREATHING_REMINDER },
        },
        trigger: triggerDate,
      });
    }
  } catch (error) {
    console.error('Error scheduling breathing reminder:', error);
  }
};

// Notificaciones motivacionales inteligentes
export const scheduleMotivationalNotification = async (moodValue = null) => {
  try {
    let messages = [];
    
    if (moodValue <= 2) {
      // Mensajes para días difíciles
      messages = [
        "Está bien tener días difíciles. Eres más fuerte de lo que crees 💪",
        "Este sentimiento es temporal. Tú eres permanente 🌟",
        "Cada día que superas es una victoria 👑",
        "Has superado el 100% de tus días difíciles hasta ahora 💙",
        "Eres valiente por seguir adelante 🦋"
      ];
    } else if (moodValue >= 4) {
      // Mensajes para días buenos
      messages = [
        "¡Qué bueno verte brillar hoy! ✨",
        "Tu energía positiva es contagiosa 🌟",
        "Días como hoy recuerdan lo hermosa que es la vida 🌈",
        "¡Celebra este momento de felicidad! 🎉",
        "Tu sonrisa ilumina el mundo 😊"
      ];
    } else {
      // Mensajes neutrales
      messages = [
        "Cada día es una oportunidad para crecer 🌱",
        "Pequeños pasos llevan a grandes cambios 👣",
        "Hoy es un buen día para ser amable contigo 💚",
        "Tu progreso cuenta, sin importar qué tan pequeño sea ⭐",
        "Eres exactamente donde necesitas estar 🗺️"
      ];
    }

    // Programar entre 30 minutos y 2 horas
    const triggerDate = new Date();
    const randomMinutes = 30 + Math.random() * 90; // 30-120 minutos
    triggerDate.setMinutes(triggerDate.getMinutes() + randomMinutes);

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Recordatorio amable 💙',
        body: randomMessage,
        data: { type: NOTIFICATION_TYPES.MOTIVATIONAL },
      },
      trigger: triggerDate,
    });
  } catch (error) {
    console.error('Error scheduling motivational notification:', error);
  }
};

// === GESTIÓN DE NOTIFICACIONES ===

// Cancelar notificaciones por tipo
export const cancelNotificationsByType = async (type) => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.type === type) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.error('Error canceling notifications by type:', error);
  }
};

// Cancelar todas las notificaciones
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications canceled');
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

// === CONFIGURACIÓN DESDE SETTINGS ===

// Aplicar configuración de notificaciones
export const applyNotificationSettings = async (settings) => {
  try {
    const {
      moodReminder,
      taskReminder,
      journalReminder,
      motivationalEnabled,
      breathingEnabled
    } = settings;

    // Cancelar todas primero
    await cancelAllNotifications();

    // Programar según configuración
    if (moodReminder.enabled) {
      await scheduleMoodReminder(moodReminder.hour, moodReminder.minute);
    }

    if (taskReminder.enabled) {
      await scheduleTaskReminder(taskReminder.hour, taskReminder.minute);
    }

    if (journalReminder.enabled) {
      await scheduleJournalReminder(journalReminder.hour, journalReminder.minute);
    }

    // Guardar configuración
    await AsyncStorage.setItem('notification_settings', JSON.stringify(settings));
    
    console.log('Notification settings applied successfully');
  } catch (error) {
    console.error('Error applying notification settings:', error);
  }
};

// Obtener configuración de notificaciones
export const getNotificationSettings = async () => {
  try {
    const data = await AsyncStorage.getItem('notification_settings');
    if (data) {
      return JSON.parse(data);
    }
    
    // Configuración por defecto
    return {
      moodReminder: {
        enabled: true,
        hour: 20,
        minute: 0
      },
      taskReminder: {
        enabled: true,
        hour: 10,
        minute: 0
      },
      journalReminder: {
        enabled: true,
        hour: 21,
        minute: 30
      },
      motivationalEnabled: true,
      breathingEnabled: true
    };
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return null;
  }
};

// === NOTIFICACIONES INTELIGENTES AUTOMÁTICAS ===

// Analizar y enviar notificaciones contextuals
export const triggerIntelligentNotifications = async () => {
  try {
    const todayMood = await getTodayMood();
    const todayTasks = await getTodayTasks();
    const settings = await getNotificationSettings();

    // Notificación de respiración si ánimo bajo
    if (settings.breathingEnabled) {
      await scheduleBreathingReminder();
    }

    // Notificación motivacional contextual
    if (settings.motivationalEnabled && todayMood) {
      await scheduleMotivationalNotification(todayMood.value);
    }

    // Recordatorio de tareas si no ha completado ninguna a las 2pm
    const currentHour = new Date().getHours();
    if (currentHour >= 14 && todayTasks.length === 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Pequeño recordatorio 😊',
          body: '¿Qué tal si hacemos una pequeña tarea de autocuidado?',
          data: { type: NOTIFICATION_TYPES.TASK_REMINDER },
        },
        trigger: { seconds: 60 }, // En 1 minuto
      });
    }

  } catch (error) {
    console.error('Error triggering intelligent notifications:', error);
  }
};

// === MANEJAR RESPUESTAS A NOTIFICACIONES ===

// Configurar listener para cuando se toca una notificación
export const setupNotificationListener = (navigation) => {
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    const { type } = response.notification.request.content.data || {};
    
    switch (type) {
      case NOTIFICATION_TYPES.MOOD_REMINDER:
        navigation.navigate('Mood');
        break;
      case NOTIFICATION_TYPES.TASK_REMINDER:
        navigation.navigate('Tasks');
        break;
      case NOTIFICATION_TYPES.JOURNAL_REMINDER:
        navigation.navigate('Journal');
        break;
      case NOTIFICATION_TYPES.BREATHING_REMINDER:
        navigation.navigate('Dashboard', { screen: 'Crisis' });
        break;
      default:
        navigation.navigate('Dashboard');
    }
  });

  return () => {
    Notifications.removeNotificationSubscription(responseListener);
  };
};