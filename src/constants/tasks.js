export const predefinedTasks = [
  {
    id: 'basic_1',
    title: 'Levantarse de la cama',
    description: 'Pequeño pero importante primer paso del día',
    category: 'basic',
    level: 1, // Disponible desde nivel supervivencia
    icon: 'bed-outline',
    isActive: true,
    orderIndex: 1,
  },
  {
    id: 'basic_2', 
    title: 'Beber un vaso de agua',
    description: 'Hidratarse es fundamental para el bienestar',
    category: 'basic',
    level: 1,
    icon: 'water-outline',
    isActive: true,
    orderIndex: 2,
  },
  {
    id: 'basic_3',
    title: 'Ducharse o lavarse la cara',
    description: 'Cuidado personal básico para sentirse mejor',
    category: 'basic', 
    level: 1,
    icon: 'rainy-outline',
    isActive: true,
    orderIndex: 3,
  },
  {
    id: 'basic_4',
    title: 'Tomar sol/aire fresco 10-15 min',
    description: 'La luz natural y el aire fresco mejoran el ánimo',
    category: 'basic',
    level: 2, // Nivel básico
    icon: 'sunny-outline',
    isActive: true,
    orderIndex: 4,
  },
  {
    id: 'basic_5',
    title: 'Caminar 10 minutos',
    description: 'Movimiento suave para activar el cuerpo',
    category: 'basic',
    level: 2,
    icon: 'walk-outline',
    isActive: true,
    orderIndex: 5,
  },
  {
    id: 'basic_6',
    title: 'Enviar mensaje a alguien querido',
    description: 'Mantener conexión social, aunque sea breve',
    category: 'basic',
    level: 2,
    icon: 'chatbubble-outline',
    isActive: true,
    orderIndex: 6,
  },
  {
    id: 'basic_7',
    title: '5 respiraciones profundas',
    description: 'Técnica simple para calmar la mente',
    category: 'basic',
    level: 1,
    icon: 'flower-outline',
    isActive: true,
    orderIndex: 7,
  }
];

export const taskLevels = {
  1: {
    name: 'Supervivencia',
    description: 'Para días muy difíciles - solo lo esencial',
    maxTasks: 3,
    message: 'Está bien si solo puedes hacer lo básico hoy. Cada pequeño paso cuenta.',
    color: '#ff6b6b'
  },
  2: {
    name: 'Estabilización', 
    description: 'Día normal - equilibrio y autocuidado',
    maxTasks: 7,
    message: 'Vas bien. Estos pasos te ayudarán a mantener el equilibrio.',
    color: '#42a5f5'
  },
  3: {
    name: 'Progreso',
    description: 'Días buenos - crecimiento y metas',
    maxTasks: 10,
    message: '¡Genial que tengas energía hoy! Aprovecha este momento positivo.',
    color: '#66bb6a'
  }
};

// Función para obtener tareas según el nivel
export const getTasksForLevel = (level) => {
  if (level === 1) {
    // Solo tareas de supervivencia (nivel 1)
    return predefinedTasks.filter(task => task.level === 1).slice(0, 3);
  } else if (level === 2) {
    // Tareas de supervivencia + básicas (nivel 1 y 2)
    return predefinedTasks.filter(task => task.level <= 2);
  } else {
    // Todas las tareas
    return predefinedTasks;
  }
};

// Función para agregar tarea personalizada
export const addCustomTask = (customTask) => {
  const newTask = {
    id: `custom_${Date.now()}`,
    title: customTask.title,
    description: customTask.description || '',
    category: 'custom',
    level: customTask.level || 2,
    icon: customTask.icon || 'star-outline',
    isActive: true,
    orderIndex: 100 + Date.now(), // Para que aparezcan al final
  };
  
  return newTask;
};

export const getAllTasksForLevel = (level, customTasks = []) => {
  const predefined = getTasksForLevel(level);
  const custom = customTasks.filter(task => task.level <= level && task.isActive);
  
  return [...predefined, ...custom];
};