import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/appNavigator';

// Importar SafeAreaProvider de forma condicional
let SafeAreaProvider;
try {
  const safeAreaModule = require('react-native-safe-area-context');
  SafeAreaProvider = safeAreaModule.SafeAreaProvider;
} catch (e) {
  console.warn('SafeAreaProvider no disponible, usando View normal');
  SafeAreaProvider = ({ children }) => children;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}