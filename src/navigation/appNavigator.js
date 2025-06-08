// src/navigation/appNavigator.js
import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform, AppState } from 'react-native';

// Importar pantallas principales
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import MoodScreen from '../screens/Mood/MoodScreen';
import TasksScreen from '../screens/Tasks/TasksScreen';
import JournalScreen from '../screens/Journal/JournalScreen';
import StatisticsScreen from '../screens/Statistics/StatisticsScreen';
import CrisisScreen from '../screens/Crisis/CrisisScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import CustomTasksScreen from '../screens/Settings/CustomTasksScreen';
import NotificationSettingsScreen from '../screens/Settings/NotificationSettingsScreen';

// Importar colores
import { colors } from '../constants/colors';

// Importar sistema de notificaciones
import { 
  setupReminderSystem, 
  initializeReminders, 
  checkPendingReminders 
} from '../utils/localNotifications';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator para Dashboard
const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="DashboardMain" 
      component={DashboardScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Crisis" 
      component={CrisisScreen}
      options={{ 
        title: 'Panel SOS',
        headerStyle: { backgroundColor: colors.danger },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
    <Stack.Screen 
      name="Settings" 
      component={SettingsScreen}
      options={{ 
        title: 'Configuración',
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
    <Stack.Screen 
      name="NotificationSettings" 
      component={NotificationSettingsScreen}
      options={{ 
        title: 'Recordatorios',
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
    <Stack.Screen 
      name="CustomTasks" 
      component={CustomTasksScreen}
      options={{ 
        title: 'Tareas Personalizadas',
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
  </Stack.Navigator>
);

// Stack Navigator para Mood
const MoodStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MoodMain" 
      component={MoodScreen}
      options={{ 
        title: 'Mi Ánimo',
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
  </Stack.Navigator>
);

// Stack Navigator para Tasks
const TasksStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="TasksMain" 
      component={TasksScreen}
      options={{ 
        title: 'Tareas Diarias',
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
  </Stack.Navigator>
);

// Stack Navigator para Journal
const JournalStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="JournalMain" 
      component={JournalScreen}
      options={{ 
        title: 'Mi Diario',
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
  </Stack.Navigator>
);

// Stack Navigator para Statistics
const StatisticsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="StatisticsMain" 
      component={StatisticsScreen}
      options={{ 
        title: 'Estadísticas',
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
  </Stack.Navigator>
);

// Tab Navigator principal - ANDROID CORREGIDO
const MainTabNavigator = () => {
  // VALORES CORREGIDOS para Android - más alto para no tapar botones
  const tabBarHeight = Platform.OS === 'ios' ? 75 : 95; // ANDROID: aumentado a 95
  const tabBarPaddingBottom = Platform.OS === 'ios' ? 20 : 15; // ANDROID: aumentado a 15
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Mood':
              iconName = focused ? 'happy' : 'happy-outline';
              break;
            case 'Tasks':
              iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
              break;
            case 'Journal':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'Statistics':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        // ESTILOS DE TAB BAR OPTIMIZADOS
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.background,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: Platform.OS === 'ios' ? 4 : 8, // ANDROID: más padding top
          elevation: 8,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          // POSICIONAMIENTO OPTIMIZADO
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: Platform.OS === 'ios' ? 2 : 10, // ANDROID: más margen bottom
          marginTop: Platform.OS === 'ios' ? 2 : 1, // ANDROID: menos margen top
        },
        headerShown: false,
        // CONFIGURACIÓN PARA EVITAR OVERLAPPING
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStack}
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen 
        name="Mood" 
        component={MoodStack}
        options={{ tabBarLabel: 'Ánimo' }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TasksStack}
        options={{ tabBarLabel: 'Tareas' }}
      />
      <Tab.Screen 
        name="Journal" 
        component={JournalStack}
        options={{ tabBarLabel: 'Diario' }}
      />
      <Tab.Screen 
        name="Statistics" 
        component={StatisticsStack}
        options={{ tabBarLabel: 'Stats' }}
      />
    </Tab.Navigator>
  );
};

// Navegador principal de la app con SISTEMA DE NOTIFICACIONES INTEGRADO
const AppNavigator = () => {
  const navigationRef = useRef();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Inicializar sistema de recordatorios al cargar la app
    console.log('🔔 Initializing reminder system...');
    initializeReminders();

    // Configurar sistema de verificación de recordatorios
    let cleanupFunction = null;
    
    // Esperar a que la navegación esté lista
    const timer = setTimeout(() => {
      if (navigationRef.current) {
        console.log('🚀 Setting up reminder system...');
        cleanupFunction = setupReminderSystem(navigationRef.current);
        
        // Verificar recordatorios inmediatamente
        checkPendingReminders(navigationRef.current);
      }
    }, 1000);

    // Escuchar cambios en el estado de la app
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // La app volvió al primer plano, verificar recordatorios
        console.log('📱 App came to foreground, checking reminders...');
        if (navigationRef.current) {
          checkPendingReminders(navigationRef.current);
        }
      }
      appState.current = nextAppState;
    });

    // Cleanup
    return () => {
      clearTimeout(timer);
      cleanupFunction && cleanupFunction();
      subscription?.remove();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <MainTabNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;