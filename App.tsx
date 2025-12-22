/**
 * Componente principal do aplicativo
 */
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { NavigationContainer, LinkingOptions, useNavigationContainerRef } from '@react-navigation/native';
import { colors } from '@/theme';
import { AppNavigator } from '@/navigation/AppNavigator';
import { ErrorBoundary, RoutePreserver } from '@/components/common';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Tema compatível com React Native Paper
const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary.main,
    secondary: colors.secondary.main,
    error: colors.error.main,
    background: colors.background.default,
    surface: colors.background.paper,
    text: colors.text.primary,
  },
};

// Configuração de deep linking para preservar rotas ao recarregar
const linking: LinkingOptions<any> = Platform.OS === 'web' ? {
  enabled: true,
  prefixes: [],
  getInitialURL: async () => {
    // Retornar a URL atual para preservar a rota ao recarregar
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return undefined;
  },
  config: {
    screens: {
      Main: {
        screens: {
          Home: {
            path: '',
            exact: true,
          },
          Calendar: 'calendario',
          Classes: 'aulas',
          Students: 'alunos',
          Attendance: 'presenca',
          Reports: 'relatorios',
          Profile: 'perfil',
        },
      },
      Auth: {
        screens: {
          Login: 'login',
          SignUp: 'cadastro',
        },
      },
    },
  },
} : {};

export default function App() {
  const navigationRef = useNavigationContainerRef();

  // Definir título padrão quando o app carrega
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Definir título padrão imediatamente
      if (!document.title || document.title === 'undefined') {
        document.title = 'CCB | Musicalização Infantil';
      }
      
      // Verificar periodicamente se o título está undefined (fallback)
      const checkTitle = setInterval(() => {
        if (!document.title || document.title === 'undefined') {
          document.title = 'CCB | Musicalização Infantil';
        }
      }, 1000);

      return () => clearInterval(checkTitle);
    }
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <PaperProvider theme={paperTheme}>
            <NavigationContainer ref={navigationRef} linking={linking}>
              <AppNavigator />
              <RoutePreserver />
            </NavigationContainer>
            <StatusBar style="auto" />
          </PaperProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

