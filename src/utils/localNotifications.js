// src/utils/localNotifications.js
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ ESTE SISTEMA FUNCIONA EN EXPO GO
// ✅ Las notificaciones aparecen INCLUSO CON LA APP CERRADA
// ✅ Son notificaciones REALES del sistema

// Configurar comportamiento
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// === CONFIGURACIÓN INICIAL ===
export const setupLocalNotifications = async () => {
  try {
    // Solicitar permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    // Configurar canal para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('mindcare-default', {
        name: 'MindCare Recordatorios',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#667eea',
        sound: 'default',
      });
    }

    console.log('✅ Local notifications setup completed');
    return true;
  } catch (error) {
    console.error('Error setting up local notifications:', error);
    return false;
  }
};

// === PROGRAMAR NOTIFICACIONES ===
export const scheduleNotification = async (title, body, triggerTime, data = {}) => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        badge: 1,
      },
      trigger: {
        date: triggerTime,
      },
    });

    console.log(`📅 Notification scheduled: ${notificationId} for ${triggerTime}`);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

// === PROGRAMAR RECORDATORIOS DE MINDCARE ===
export const scheduleMindCareNotifications = async (settings) => {
  try {
    // Cancelar notificaciones anteriores
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    const scheduledIds = [];
    const now = new Date();

    // Programar para los próximos 7 días
    for (let i = 1; i <= 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);

      // ✅ RECORDATORIO DE ÁNIMO
      if (settings.moodReminder?.enabled) {
        const moodTime = new Date(date);
        moodTime.setHours(settings.moodReminder.hour, settings.moodReminder.minute, 0, 0);

        const moodId = await scheduleNotification(
          'MindCare 💙',
          getMoodMessage(),
          moodTime,
          { type: 'mood', navigate: 'Mood' }
        );

        if (moodId) scheduledIds.push({ id: moodId, type: 'mood', time: moodTime });
      }

      // ✅ RECORDATORIO DE TAREAS
      if (settings.taskReminder?.enabled) {
        const taskTime = new Date(date);
        taskTime.setHours(settings.taskReminder.hour, settings.taskReminder.minute, 0, 0);

        const taskId = await scheduleNotification(
          'Tareas del día 📝',
          getTaskMessage(),
          taskTime,
          { type: 'tasks', navigate: 'Tasks' }
        );

        if (taskId) scheduledIds.push({ id: taskId, type: 'tasks', time: taskTime });
      }

      // ✅ RECORDATORIO DE DIARIO
      if (settings.journalReminder?.enabled) {
        const journalTime = new Date(date);
        journalTime.setHours(settings.journalReminder.hour, settings.journalReminder.minute, 0, 0);

        const journalId = await scheduleNotification(
          'Momento de escribir 📝',
          getJournalMessage(),
          journalTime,
          { type: 'journal', navigate: 'Journal' }
        );

        if (journalId) scheduledIds.push({ id: journalId, type: 'journal', time: journalTime });
      }
    }

    // Guardar IDs programados
    await AsyncStorage.setItem('local_notifications', JSON.stringify(scheduledIds));
    
    console.log(`🎉 Successfully scheduled ${scheduledIds.length} notifications!`);
    return scheduledIds;
  } catch (error) {
    console.error('Error scheduling MindCare notifications:', error);
    return [];
  }
};

// === MENSAJES ALEATORIOS ===
const getMoodMessage = () => {
  const messages = [
    "¿Cómo te sientes hoy? 💙",
    "Es momento de registrar tu ánimo 😊", 
    "¿Qué tal ha sido tu día? 🌟",
    "Tu bienestar importa ¿Cómo estás? 🤗",
    "Unos segundos para ti 💚"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

const getTaskMessage = () => {
  const messages = [
    "¡Buenos días! ¿Empezamos? 💪",
    "Pequeños pasos, grandes cambios ✨", 
    "Hoy es perfecto para cuidarte 🌟",
    "¿Qué tal unas tareas de bienestar? 🚀",
    "Tu futuro yo te lo agradecerá 💚"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

const getJournalMessage = () => {
  const messages = [
    "¿Escribimos sobre tu día? 📝",
    "Momento para reflexionar 💭",
    "Tu historia es importante 📖", 
    "Tiempo de conectar contigo ✨",
    "¿Qué cosa buena pasó hoy? 🌟"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

// === NOTIFICACIÓN INTELIGENTE ===
export const scheduleSmartNotification = async (type, moodValue = null) => {
  try {
    const triggerTime = new Date();
    triggerTime.setMinutes(triggerTime.getMinutes() + 30); // En 30 minutos

    let title, body;
    
    if (type === 'low_mood') {
      title = 'Recordatorio amable 💙';
      body = 'Está bien tener días difíciles. Eres fuerte 💪';
    } else if (type === 'breathing') {
      title = 'Momento de calma 🌸';
      body = '¿Unos ejercicios de respiración? 🫁';
    } else {
      title = 'Mensaje positivo ✨';
      body = moodValue >= 4 ? '¡Brillas hoy! ⭐' : 'Cada paso cuenta 👣';
    }

    const id = await scheduleNotification(title, body, triggerTime, { type: 'smart' });
    return id;
  } catch (error) {
    console.error('Error scheduling smart notification:', error);
    return null;
  }
};

// === MANEJO DE CLICS EN NOTIFICACIONES ===
export const setupNotificationListener = (navigation) => {
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    
    console.log('🔔 Notification clicked:', data);
    
    // Navegar según el tipo
    if (data?.navigate) {
      navigation.navigate(data.navigate);
    } else {
      navigation.navigate('Dashboard');
    }
  });

  return () => {
    Notifications.removeNotificationSubscription(responseListener);
  };
};

// === GESTIÓN ===
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem('local_notifications');
    console.log('🗑️ All notifications canceled');
    return true;
  } catch (error) {
    console.error('Error canceling notifications:', error);
    return false;
  }
};

export const getScheduledNotifications = async () => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`📊 Found ${scheduled.length} scheduled notifications`);
    return scheduled;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

// === CONFIGURACIÓN ===
export const saveNotificationSettings = async (settings) => {
  try {
    await AsyncStorage.setItem('notification_settings_local', JSON.stringify({
      ...settings,
      lastConfigured: new Date().toISOString()
    }));

    // Reprogramar notificaciones
    await scheduleMindCareNotifications(settings);
    
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

export const getNotificationSettings = async () => {
  try {
    const data = await AsyncStorage.getItem('notification_settings_local');
    if (data) return JSON.parse(data);
    
    // Configuración por defecto
    return {
      moodReminder: { enabled: true, hour: 20, minute: 0 },
      taskReminder: { enabled: true, hour: 10, minute: 0 },
      journalReminder: { enabled: true, hour: 21, minute: 30 },
      motivationalEnabled: true,
      breathingEnabled: true
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return null;
  }
};

export const getNotificationStatus = async () => {
  try {
    const permissions = await Notifications.getPermissionsAsync();
    const scheduled = await getScheduledNotifications();
    
    return {
      supported: true,
      enabled: permissions.status === 'granted',
      scheduled: scheduled.length,
      platform: Platform.OS,
      method: 'local_scheduled_notifications',
      permissions: permissions.status,
      message: `Notificaciones locales activas (${scheduled.length} programadas)`
    };
  } catch (error) {
    return {
      supported: false,
      enabled: false,
      error: error.message
    };
  }
};

// === PRUEBA DE NOTIFICACIÓN ===
export const testNotification = async () => {
  try {
    const triggerTime = new Date();
    triggerTime.setSeconds(triggerTime.getSeconds() + 5); // En 5 segundos

    const id = await scheduleNotification(
      'MindCare - Prueba ✨',
      '¡Las notificaciones funcionan perfectamente! 🎉',
      triggerTime,
      { type: 'test' }
    );

    console.log('🧪 Test notification scheduled for 5 seconds');
    return id;
  } catch (error) {
    console.error('Error testing notification:', error);
    return null;
  }
};

export default {
  setupLocalNotifications,
  scheduleMindCareNotifications,
  scheduleSmartNotification,
  setupNotificationListener,
  cancelAllNotifications,
  getScheduledNotifications,
  saveNotificationSettings,
  getNotificationSettings,
  getNotificationStatus,
  testNotification
};