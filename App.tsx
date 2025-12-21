/**
 * Componente principal do aplicativo
 */
import React from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
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
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <PaperProvider theme={paperTheme}>
            <NavigationContainer linking={linking}>
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

