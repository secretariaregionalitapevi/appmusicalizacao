/**
 * Componente para preservar a rota ao recarregar a página
 */
import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';

const getRouteFromUrl = (): string | null => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }

  const path = window.location.pathname;
  const hash = window.location.hash;

  // Verificar hash primeiro
  if (hash) {
    if (hash.includes('Reports') || hash.includes('relatorios')) return 'Reports';
    if (hash.includes('Calendar') || hash.includes('calendario')) return 'Calendar';
    if (hash.includes('Classes') || hash.includes('aulas')) return 'Classes';
    if (hash.includes('Students') || hash.includes('alunos')) return 'Students';
    if (hash.includes('Attendance') || hash.includes('presenca')) return 'Attendance';
    if (hash.includes('Profile') || hash.includes('perfil')) return 'Profile';
    if (hash.includes('Home') || hash.includes('inicio')) return 'Home';
  }

  // Verificar pathname
  if (path.includes('/reports') || path.includes('/relatorios')) return 'Reports';
  if (path.includes('/calendar') || path.includes('/calendario')) return 'Calendar';
  if (path.includes('/classes') || path.includes('/aulas')) return 'Classes';
  if (path.includes('/students') || path.includes('/alunos')) return 'Students';
  if (path.includes('/attendance') || path.includes('/presenca')) return 'Attendance';
  if (path.includes('/profile') || path.includes('/perfil')) return 'Profile';

  return null;
};

export const RoutePreserver: React.FC = () => {
  const navigation = useNavigation();
  const hasNavigatedRef = useRef(false);
  const navigationState = useNavigationState((state) => state);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && !hasNavigatedRef.current) {
      // Aguardar o navigator estar pronto
      const timer = setTimeout(() => {
        const routeFromUrl = getRouteFromUrl();
        
        if (routeFromUrl) {
          try {
            // Verificar se já estamos na rota correta
            let activeRoute: string | null = null;
            
            if (navigationState) {
              const currentRoute = navigationState.routes[navigationState.index];
              
              // Verificar se é navegação aninhada (Stack > Tab)
              if (currentRoute?.state?.routes) {
                const nestedState = currentRoute.state;
                const nestedRoute = nestedState.routes[nestedState.index || 0];
                
                // Se o nested route tem state (Tab Navigator)
                if (nestedRoute?.state?.routes) {
                  const tabState = nestedRoute.state;
                  activeRoute = tabState.routes[tabState.index || 0]?.name;
                } else {
                  activeRoute = nestedRoute?.name;
                }
              } else {
                activeRoute = currentRoute?.name;
              }
            }

            // Se a rota atual não corresponde à URL, navegar
            if (activeRoute !== routeFromUrl) {
              // Navegar para a rota da URL através do Tab Navigator
              (navigation as any).navigate('Main', { screen: routeFromUrl });
              hasNavigatedRef.current = true;
            } else {
              hasNavigatedRef.current = true;
            }
          } catch (error) {
            console.warn('Erro ao preservar rota:', error);
            hasNavigatedRef.current = true; // Evitar loops
          }
        } else {
          hasNavigatedRef.current = true;
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [navigation, navigationState]);

  return null;
};

