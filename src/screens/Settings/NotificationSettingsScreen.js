import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { colors, typography } from '../../constants/colors';
import {
  requestNotificationPermissions,
  getNotificationSettings,
  applyNotificationSettings,
  cancelAllNotifications
} from '../../utils/notifications';

const NotificationSettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    moodReminder: { enabled: true, hour: 20, minute: 0 },
    taskReminder: { enabled: true, hour: 10, minute: 0 },
    journalReminder: { enabled: true, hour: 21, minute: 30 },
    motivationalEnabled: true,
    breathingEnabled: true
  });
  
  const [showTimePicker, setShowTimePicker] = useState(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await getNotificationSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const checkPermissions = async () => {
    const granted = await requestNotificationPermissions();
    setPermissionsGranted(granted);
    
    if (!granted) {
      Alert.alert(
        'Permisos necesarios',
        'Para recibir recordatorios, necesitas activar las notificaciones en Configuración del sistema.',
        [
          { text: 'Entendido', style: 'default' }
        ]
      );
    }
  };

  const handleToggle = (type, enabled) => {
    setSettings(prev => ({
      ...prev,
      [type]: typeof prev[type] === 'object' 
        ? { ...prev[type], enabled }
        : enabled
    }));
    setHasChanges(true);
  };

  const handleTimeChange = (type, event, selectedTime) => {
    setShowTimePicker(null);
    
    if (selectedTime) {
      const hour = selectedTime.getHours();
      const minute = selectedTime.getMinutes();
      
      setSettings(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          hour,
          minute
        }
      }));
      setHasChanges(true);
    }
  };

  const formatTime = (hour, minute) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const createTimeDate = (hour, minute) => {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  };

  const handleSave = async () => {
    if (!permissionsGranted) {
      Alert.alert(
        'Permisos necesarios',
        'Activa las notificaciones en Configuración del sistema para usar esta función.'
      );
      return;
    }

    try {
      await applyNotificationSettings(settings);
      setHasChanges(false);
      Alert.alert(
        '¡Guardado! ✨',
        'Tus recordatorios han sido configurados correctamente.'
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar las configuraciones');
      console.error('Error saving notification settings:', error);
    }
  };

  const handleDisableAll = () => {
    Alert.alert(
      'Desactivar todos los recordatorios',
      '¿Estás seguro? Esto cancelará todas las notificaciones programadas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, desactivar',
          style: 'destructive',
          onPress: async () => {
            await cancelAllNotifications();
            setSettings(prev => ({
              moodReminder: { ...prev.moodReminder, enabled: false },
              taskReminder: { ...prev.taskReminder, enabled: false },
              journalReminder: { ...prev.journalReminder, enabled: false },
              motivationalEnabled: false,
              breathingEnabled: false
            }));
            setHasChanges(true);
            Alert.alert('Listo', 'Todos los recordatorios han sido desactivados');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Recordatorios</Text>
          <Text style={styles.subtitle}>
            Configura cuando quieres recibir recordatorios amables para cuidar tu bienestar
          </Text>
        </View>

        {!permissionsGranted && (
          <View style={styles.warningCard}>
            <Ionicons name="warning-outline" size={24} color={colors.warning} />
            <View style={styles.warningText}>
              <Text style={styles.warningTitle}>Permisos necesarios</Text>
              <Text style={styles.warningDescription}>
                Las notificaciones están desactivadas. Ve a Configuración del sistema para activarlas.
              </Text>
            </View>
          </View>
        )}

        {/* Recordatorios principales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recordatorios diarios</Text>
          
          {/* Recordatorio de ánimo */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <Ionicons name="happy-outline" size={20} color={colors.primary} />
                <Text style={styles.settingTitle}>Registro de ánimo</Text>
              </View>
              <Text style={styles.settingDescription}>
                Te recordamos registrar cómo te sientes
              </Text>
              {settings.moodReminder.enabled && (
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowTimePicker('moodReminder')}
                >
                  <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.timeText}>
                    {formatTime(settings.moodReminder.hour, settings.moodReminder.minute)}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <Switch
              value={settings.moodReminder.enabled}
              onValueChange={(enabled) => handleToggle('moodReminder', enabled)}
              trackColor={{ false: colors.textLight, true: colors.primaryLight }}
              thumbColor={settings.moodReminder.enabled ? colors.primary : colors.white}
            />
          </View>

          {/* Recordatorio de tareas */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
                <Text style={styles.settingTitle}>Tareas del día</Text>
              </View>
              <Text style={styles.settingDescription}>
                Un recordatorio matutino para comenzar el día
              </Text>
              {settings.taskReminder.enabled && (
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowTimePicker('taskReminder')}
                >
                  <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.timeText}>
                    {formatTime(settings.taskReminder.hour, settings.taskReminder.minute)}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <Switch
              value={settings.taskReminder.enabled}
              onValueChange={(enabled) => handleToggle('taskReminder', enabled)}
              trackColor={{ false: colors.textLight, true: colors.primaryLight }}
              thumbColor={settings.taskReminder.enabled ? colors.primary : colors.white}
            />
          </View>

          {/* Recordatorio de diario */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <Ionicons name="book-outline" size={20} color={colors.info} />
                <Text style={styles.settingTitle}>Momento de escribir</Text>
              </View>
              <Text style={styles.settingDescription}>
                Tiempo para reflexionar en tu diario personal
              </Text>
              {settings.journalReminder.enabled && (
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowTimePicker('journalReminder')}
                >
                  <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.timeText}>
                    {formatTime(settings.journalReminder.hour, settings.journalReminder.minute)}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <Switch
              value={settings.journalReminder.enabled}
              onValueChange={(enabled) => handleToggle('journalReminder', enabled)}
              trackColor={{ false: colors.textLight, true: colors.primaryLight }}
              thumbColor={settings.journalReminder.enabled ? colors.primary : colors.white}
            />
          </View>
        </View>

        {/* Recordatorios inteligentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recordatorios inteligentes</Text>
          <Text style={styles.sectionDescription}>
            Estos se activan automáticamente según tu estado y patrones
          </Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <Ionicons name="heart-outline" size={20} color={colors.danger} />
                <Text style={styles.settingTitle}>Mensajes motivacionales</Text>
              </View>
              <Text style={styles.settingDescription}>
                Recordatorios amables personalizados según tu ánimo
              </Text>
            </View>
            <Switch
              value={settings.motivationalEnabled}
              onValueChange={(enabled) => handleToggle('motivationalEnabled', enabled)}
              trackColor={{ false: colors.textLight, true: colors.primaryLight }}
              thumbColor={settings.motivationalEnabled ? colors.primary : colors.white}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <Ionicons name="leaf-outline" size={20} color={colors.success} />
                <Text style={styles.settingTitle}>Momentos de respiración</Text>
              </View>
              <Text style={styles.settingDescription}>
                Sugerencias de ejercicios de respiración en momentos difíciles
              </Text>
            </View>
            <Switch
              value={settings.breathingEnabled}
              onValueChange={(enabled) => handleToggle('breathingEnabled', enabled)}
              trackColor={{ false: colors.textLight, true: colors.primaryLight }}
              thumbColor={settings.breathingEnabled ? colors.primary : colors.white}
            />
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionSection}>
          {hasChanges && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Ionicons name="save-outline" size={20} color={colors.white} />
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.disableAllButton}
            onPress={handleDisableAll}
          >
            <Ionicons name="notifications-off-outline" size={20} color={colors.danger} />
            <Text style={styles.disableAllButtonText}>Desactivar todos</Text>
          </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 Sobre los recordatorios</Text>
          <Text style={styles.infoText}>
            • Los recordatorios son locales y privados{'\n'}
            • Puedes cambiar los horarios en cualquier momento{'\n'}
            • Los recordatorios inteligentes se adaptan a tu estado{'\n'}
            • Siempre puedes desactivarlos si lo necesitas
          </Text>
        </View>
      </ScrollView>

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={createTimeDate(
            settings[showTimePicker].hour,
            settings[showTimePicker].minute
          )}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, time) => handleTimeChange(showTimePicker, event, time)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.warning,
    marginBottom: 4,
  },
  warningDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  settingDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  timeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  actionSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  saveButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  disableAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger,
    gap: 8,
  },
  disableAllButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.danger,
  },
  infoSection: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default NotificationSettingsScreen;