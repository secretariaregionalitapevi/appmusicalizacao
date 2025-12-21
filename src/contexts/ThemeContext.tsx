/**
 * Contexto de Tema para gerenciar modo dark/light
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  // Carregar tema salvo ao inicializar
  useEffect(() => {
    const loadTheme = async () => {
      try {
        if (Platform.OS === 'web') {
          const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
          if (savedTheme) {
            setTheme(savedTheme);
            applyTheme(savedTheme);
          }
        } else {
          const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
          if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            setTheme(savedTheme as Theme);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar tema:', error);
      }
    };

    loadTheme();
  }, []);

  // Aplicar tema no DOM (web) e atualizar estilos
  const applyTheme = (newTheme: Theme) => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme);
      if (newTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
      } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
      }
    }
  };

  const toggleTheme = async () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);

    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      } else {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      }
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  // Aplicar tema quando mudar
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
};

