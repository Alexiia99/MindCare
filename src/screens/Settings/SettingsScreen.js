import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography, spacing } from '../../constants/colors';
import { getSettings, saveSettings, clearAllData, exportData } from '../../utils/storage';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    currentLevel: 2,
    notifications: { enabled: true, moodReminder: '20:00' },
    customTasks: [],
    emergencyContacts: [],
  });

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    // Recargar configuración cuando se vuelve a la pantalla
    const unsubscribe = navigation.addListener('focus', () => {
      loadSettings();
    });

    return unsubscribe;
  }, [navigation]);

  const loadSettings = async () => {
    try {
      const currentSettings = await getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await saveSettings({ [key]: value });
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const handleNotificationsToggle = async (enabled) => {
    const newNotifications = { ...settings.notifications, enabled };
    await updateSetting('notifications', newNotifications);
  };

  const handleLevelChange = () => {
    Alert.alert(
      'Cambiar nivel por defecto',
      'Selecciona tu nivel habitual. Siempre puedes cambiarlo según cómo te sientas cada día.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Supervivencia (días difíciles)', 
          onPress: () => updateSetting('currentLevel', 1)
        },
        { 
          text: 'Estabilización (días normales)', 
          onPress: () => updateSetting('currentLevel', 2)
        },
        { 
          text: 'Progreso (días buenos)', 
          onPress: () => updateSetting('currentLevel', 3)
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Eliminar todos los datos',
      '⚠️ Esta acción eliminará permanentemente:\n\n• Todos tus registros de ánimo\n• Todas las tareas completadas\n• Todas las entradas del diario\n• Configuración personalizada\n\n¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar todo',
          style: 'destructive',
          onPress: async () => {
            const success = await clearAllData();
            if (success) {
              Alert.alert('Completado', 'Todos los datos han sido eliminados');
              navigation.goBack();
            } else {
              Alert.alert('Error', 'No se pudieron eliminar los datos');
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const data = await exportData();
      if (data) {
        Alert.alert(
          'Datos exportados',
          'Tus datos han sido preparados para exportación.\n\nEn una versión futura podrás enviarlos por email o guardarlos en archivos.',
          [{ text: 'Entendido' }]
        );
        console.log('Exported data:', data); // Para desarrollo
      } else {
        Alert.alert('Error', 'No se pudieron exportar los datos');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al exportar los datos');
    }
  };

  const getLevelName = (level) => {
    const levels = {
      1: 'Supervivencia',
      2: 'Estabilización',
      3: 'Progreso'
    };
    return levels[level] || 'Desconocido';
  };

  const menuItems = [
    {
      section: 'Configuración General',
      items: [
        {
          icon: 'notifications-outline',
          title: 'Recordatorios',
          subtitle: settings.notifications.enabled ? 'Activados' : 'Desactivados',
          type: 'toggle',
          value: settings.notifications.enabled,
          onToggle: handleNotificationsToggle,
        },
        {
          icon: 'layers-outline',
          title: 'Nivel por defecto',
          subtitle: `Nivel ${settings.currentLevel} - ${getLevelName(settings.currentLevel)}`,
          type: 'navigate',
          onPress: handleLevelChange,
        },
      ],
    },
    {
      section: 'Personalización',
      items: [
        {
          icon: 'checkmark-circle-outline',
          title: 'Tareas personalizadas',
          subtitle: `${settings.customTasks.length} tareas creadas`,
          type: 'navigate',
          onPress: () => navigation.navigate('CustomTasks'),
        },
        {
          icon: 'call-outline',
          title: 'Contactos de emergencia',
          subtitle: `${settings.emergencyContacts.length} contactos`,
          type: 'navigate',
          onPress: () => Alert.alert('Próximamente', 'Función de contactos personalizados en desarrollo'),
        },
        {
          icon: 'notifications-outline',
          title: 'Recordatorios',
          subtitle: 'Configura notificaciones inteligentes',
          type: 'navigation',
          onPress: () => navigation.navigate('NotificationSettings'),
        },
      ],
    },
    {
      section: 'Datos y Privacidad',
      items: [
        {
          icon: 'download-outline',
          title: 'Exportar mis datos',
          subtitle: 'Descarga una copia de tu información',
          type: 'action',
          onPress: handleExportData,
        },
        {
          icon: 'trash-outline',
          title: 'Eliminar todos los datos',
          subtitle: 'Borrar permanentemente toda la información',
          type: 'destructive',
          onPress: handleClearData,
        },
      ],
    },
    {
      section: 'Acerca de MindCare',
      items: [
        {
          icon: 'heart-outline',
          title: 'Sobre esta app',
          subtitle: 'Versión 1.0.0 - Gratuita para siempre',
          type: 'info',
          onPress: () => Alert.alert(
            'MindCare',
            'Una app de bienestar mental 100% gratuita.\n\nCreada con amor para apoyar tu salud mental diaria.\n\n💙 Siempre gratuita\n🔒 Datos privados y locales\n🚀 Código abierto'
          ),
        },
        {
          icon: 'help-circle-outline',
          title: 'Ayuda y soporte',
          subtitle: 'Preguntas frecuentes y contacto',
          type: 'info',
          onPress: () => Alert.alert(
            'Ayuda',
            'Si necesitas ayuda:\n\n• Revisa los consejos en cada pantalla\n• Usa el panel SOS para crisis\n• Contacta profesionales si necesitas apoyo\n• Recuerda: esta app no reemplaza ayuda profesional'
          ),
        },
      ],
    },
  ];

  const renderMenuItem = (item, index) => {
    return (
      <TouchableOpacity
        key={index}
        style={styles.menuItem}
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
      >
        <View style={styles.menuItemLeft}>
          <View style={[
            styles.menuItemIcon,
            item.type === 'destructive' && styles.destructiveIcon,
          ]}>
            <Ionicons
              name={item.icon}
              size={24}
              color={item.type === 'destructive' ? colors.danger : colors.primary}
            />
          </View>
          <View style={styles.menuItemText}>
            <Text style={[
              styles.menuItemTitle,
              item.type === 'destructive' && styles.destructiveText,
            ]}>
              {item.title}
            </Text>
            <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
          </View>
        </View>

        {item.type === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: colors.textLight, true: colors.primaryLight }}
            thumbColor={item.value ? colors.primary : colors.white}
          />
        ) : (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textLight}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {menuItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => renderMenuItem(item, itemIndex))}
            </View>
          </View>
        ))}

        {/* Información adicional */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            MindCare mantiene todos tus datos en tu dispositivo.{'\n'}
            Nada se envía a servidores externos.
          </Text>
          <Text style={styles.versionText}>
            Versión 1.0.0 - Build {Date.now().toString().slice(-6)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  destructiveIcon: {
    backgroundColor: colors.danger + '20',
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  destructiveText: {
    color: colors.danger,
  },
  menuItemSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  versionText: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    textAlign: 'center',
  },
});

export default SettingsScreen;