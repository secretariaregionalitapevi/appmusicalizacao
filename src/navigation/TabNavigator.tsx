/**
 * Navegador de abas (Bottom Tabs)
 */
import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { CalendarScreen } from '@/screens/calendar/CalendarScreen';
import { ClassesScreen } from '@/screens/classes/ClassesScreen';
import { StudentsScreen } from '@/screens/students/StudentsScreen';
import { AttendanceScreen } from '@/screens/attendance/AttendanceScreen';
import { ReportsScreen } from '@/screens/reports/ReportsScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { colors } from '@/theme';
import type { MainTabParamList } from '@/types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Mapear rotas da URL para nomes de telas
const getRouteFromUrl = (): keyof MainTabParamList | null => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }

  const path = window.location.pathname;
  const hash = window.location.hash;

  // Verificar hash primeiro (usado pelo React Navigation web)
  if (hash) {
    if (hash.includes('Reports') || hash.includes('relatorios')) return 'Reports';
    if (hash.includes('Calendar') || hash.includes('calendario')) return 'Calendar';
    if (hash.includes('Classes') || hash.includes('aulas')) return 'Classes';
    if (hash.includes('Students') || hash.includes('alunos')) return 'Students';
    if (hash.includes('Attendance') || hash.includes('presenca')) return 'Attendance';
    if (hash.includes('Profile') || hash.includes('perfil')) return 'Profile';
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

export const TabNavigator: React.FC = () => {
  const navigation = useNavigation();
  const currentRoute = useNavigationState((state) => {
    if (!state) return null;
    const route = state.routes[state.index];
    if (route.state) {
      // Navegação aninhada (Tab Navigator dentro de Stack)
      const nestedRoute = route.state.routes[route.state.index];
      return nestedRoute?.name as keyof MainTabParamList | null;
    }
    return route?.name as keyof MainTabParamList | null;
  });
  const hasNavigatedRef = useRef(false);

  // Atualizar título da página quando a rota muda
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined' && currentRoute) {
      const titles: Record<string, string> = {
        Home: 'Dashboard | CCB',
        Calendar: 'Calendário | CCB',
        Classes: 'Aulas | CCB',
        Students: 'Alunos | CCB',
        Attendance: 'Registro de Presença | CCB',
        Reports: 'Relatórios | CCB',
        Profile: 'Meu Perfil | CCB',
      };
      
      const title = titles[currentRoute] || 'Musicalização Infantil | CCB';
      document.title = title;
    }
  }, [currentRoute]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Aguardar um pouco para garantir que o navigator está pronto
      const timer = setTimeout(() => {
        const routeFromUrl = getRouteFromUrl();
        
        // Se há uma rota na URL e ainda não navegamos, ou se a rota atual não corresponde à URL
        if (routeFromUrl && (!currentRoute || currentRoute !== routeFromUrl)) {
          try {
            // Navegar para a rota detectada na URL
            (navigation as any).navigate(routeFromUrl);
            hasNavigatedRef.current = true;
          } catch (error) {
            console.warn('Erro ao navegar para rota da URL:', error);
          }
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [navigation, currentRoute]);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false, // Dashboard tem seu próprio header
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          display: 'none', // Ocultar menu inferior completamente
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Início',
          tabBarLabel: 'Início',
          headerShown: false, // Dashboard tem seu próprio header
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          title: 'Calendário',
          tabBarLabel: 'Calendário',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Classes"
        component={ClassesScreen}
        options={{
          title: 'Aulas',
          tabBarLabel: 'Aulas',
        }}
      />
      <Tab.Screen
        name="Students"
        component={StudentsScreen}
        options={{
          title: 'Alunos',
          tabBarLabel: 'Alunos',
        }}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          title: 'Registro de Presença',
          tabBarLabel: 'Presença',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: 'Relatórios',
          tabBarLabel: 'Relatórios',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Meu Perfil',
          tabBarLabel: 'Perfil',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

