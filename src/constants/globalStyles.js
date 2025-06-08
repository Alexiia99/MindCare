
import { Platform } from 'react-native';

// ESPACIADO OPTIMIZADO PARA TODA LA APP
export const globalStyles = {
  // CONTENEDOR PRINCIPAL - APLICAR A TODAS LAS PANTALLAS
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // SAFEAREAVIEW OPTIMIZADO
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
    // Reducir padding superior
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
  },
  
  // SCROLLVIEW OPTIMIZADO
  scrollContainer: {
    flexGrow: 1,
    // IMPORTANTE: Espacio inferior para el navbar
    paddingBottom: Platform.OS === 'ios' ? 85 : 75, // Ajustado al nuevo navbar
  },
  
  // HEADER OPTIMIZADO
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 8, // REDUCIDO
    paddingBottom: 8, // REDUCIDO
  },
  
  // SECCIÓN DE CONTENIDO OPTIMIZADA
  contentSection: {
    paddingHorizontal: 16,
    paddingVertical: 8, // REDUCIDO de 16 a 8
    marginBottom: 8, // REDUCIDO
  },
  
  // CARD OPTIMIZADA
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12, // REDUCIDO de 16 a 12
    padding: 12, // REDUCIDO de 16 a 12
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  // TÍTULOS OPTIMIZADOS
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4, // REDUCIDO
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8, // REDUCIDO
  },
  
  // ESPACIADO ENTRE ELEMENTOS
  spacing: {
    xs: 2, // REDUCIDO
    sm: 4, // REDUCIDO
    md: 8, // REDUCIDO
    lg: 12, // REDUCIDO
    xl: 16, // REDUCIDO
    xxl: 20, // REDUCIDO
  },
};
