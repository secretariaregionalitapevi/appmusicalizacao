/**
 * Tela inicial do aplicativo - Dashboard estilo MBX Academy
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks/useAuth';
import { spacing } from '@/theme';
import type { RootStackParamList } from '@/types/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/api/supabase';

const isWeb = Platform.OS === 'web';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Componente de Barra Animada
interface AnimatedBarProps {
  percentage: number;
  color: string;
  height?: number;
}

const AnimatedBar: React.FC<AnimatedBarProps> = ({ percentage, color, height = 24 }) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const width = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.analyticsBarFill,
        {
          width,
          height,
          backgroundColor: color,
          borderRadius: height / 2,
        },
      ]}
    />
  );
};

// Componente de Pie Chart para Aulas por Status
interface PieChartProps {
  completed: number;
  scheduled: number;
  total: number;
}

const PieChart: React.FC<PieChartProps> = ({ completed, scheduled, total }) => {
  const size = 120;
  const strokeWidth = 18;
  
  const completedPercentage = total > 0 ? (completed / total) : 0;
  const scheduledPercentage = total > 0 ? (scheduled / total) : 0;
  
  // Calcular ângulos
  const completedAngle = completedPercentage * 360;
  
  // Para web, usar uma div com SVG inline
  if (Platform.OS === 'web') {
    return (
      <View style={styles.classStatusChartContainer}>
        <div
          style={{
            width: size,
            height: size,
            position: 'relative',
          }}
          dangerouslySetInnerHTML={{
            __html: `
              <svg width="${size}" height="${size}" style="transform: rotate(-90deg)">
                <circle
                  cx="${size / 2}"
                  cy="${size / 2}"
                  r="${(size - strokeWidth) / 2}"
                  fill="none"
                  stroke="#F3F4F6"
                  stroke-width="${strokeWidth}"
                />
                ${completedPercentage > 0 ? `
                  <circle
                    cx="${size / 2}"
                    cy="${size / 2}"
                    r="${(size - strokeWidth) / 2}"
                    fill="none"
                    stroke="#10B981"
                    stroke-width="${strokeWidth}"
                    stroke-dasharray="${2 * Math.PI * (size - strokeWidth) / 2}"
                    stroke-dashoffset="${2 * Math.PI * (size - strokeWidth) / 2 * (1 - completedPercentage)}"
                    stroke-linecap="round"
                  />
                ` : ''}
                ${scheduledPercentage > 0 ? `
                  <circle
                    cx="${size / 2}"
                    cy="${size / 2}"
                    r="${(size - strokeWidth) / 2}"
                    fill="none"
                    stroke="#F59E0B"
                    stroke-width="${strokeWidth}"
                    stroke-dasharray="${2 * Math.PI * (size - strokeWidth) / 2}"
                    stroke-dashoffset="${2 * Math.PI * (size - strokeWidth) / 2 * (1 - scheduledPercentage)}"
                    stroke-linecap="round"
                    style="transform: rotate(${completedAngle}deg); transform-origin: ${size / 2}px ${size / 2}px;"
                  />
                ` : ''}
              </svg>
            `,
          }}
        />
      </View>
    );
  }

  // Para mobile, usar Views com bordas
  return (
    <View style={[styles.classStatusChartView, { width: size, height: size }]}>
      {/* Background circle */}
      <View style={[styles.classStatusChartSegment, {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: '#F3F4F6',
        position: 'absolute',
      }]} />
      
      {/* Completed segment */}
      {completedPercentage > 0 && (
        <View style={[styles.classStatusChartSegment, {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: '#10B981',
          borderTopColor: '#10B981',
          borderRightColor: completedPercentage > 0.25 ? '#10B981' : 'transparent',
          borderBottomColor: completedPercentage > 0.5 ? '#10B981' : 'transparent',
          borderLeftColor: completedPercentage > 0.75 ? '#10B981' : 'transparent',
          position: 'absolute',
        }]} />
      )}
      
      {/* Scheduled segment */}
      {scheduledPercentage > 0 && (
        <View style={[styles.classStatusChartSegment, {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: '#F59E0B',
          borderTopColor: completedPercentage > 0.25 ? '#F59E0B' : 'transparent',
          borderRightColor: completedPercentage > 0.5 ? '#F59E0B' : 'transparent',
          borderBottomColor: completedPercentage > 0.75 ? '#F59E0B' : 'transparent',
          borderLeftColor: '#F59E0B',
          position: 'absolute',
          transform: [{ rotate: `${completedAngle}deg` }],
        }]} />
      )}
    </View>
  );
};

// Componente de Donut Chart
interface DonutChartProps {
  male: number;
  female: number;
  total: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ male, female, total }) => {
  const size = 120;
  const strokeWidth = 20;
  
  const malePercentage = total > 0 ? (male / total) : 0;
  const femalePercentage = total > 0 ? (female / total) : 0;
  
  // Calcular ângulos
  const maleAngle = malePercentage * 360;

  // Para web, usar uma div com SVG inline
  if (Platform.OS === 'web') {
    return (
      <View style={styles.donutChartContainer}>
        <div
          style={{
            width: size,
            height: size,
            position: 'relative',
          }}
          dangerouslySetInnerHTML={{
            __html: `
              <svg width="${size}" height="${size}" style="transform: rotate(-90deg)">
                <circle
                  cx="${size / 2}"
                  cy="${size / 2}"
                  r="${(size - strokeWidth) / 2}"
                  fill="none"
                  stroke="#F3F4F6"
                  stroke-width="${strokeWidth}"
                />
                ${malePercentage > 0 ? `
                  <circle
                    cx="${size / 2}"
                    cy="${size / 2}"
                    r="${(size - strokeWidth) / 2}"
                    fill="none"
                    stroke="#3B82F6"
                    stroke-width="${strokeWidth}"
                    stroke-dasharray="${2 * Math.PI * (size - strokeWidth) / 2}"
                    stroke-dashoffset="${2 * Math.PI * (size - strokeWidth) / 2 * (1 - malePercentage)}"
                    stroke-linecap="round"
                  />
                ` : ''}
                ${femalePercentage > 0 ? `
                  <circle
                    cx="${size / 2}"
                    cy="${size / 2}"
                    r="${(size - strokeWidth) / 2}"
                    fill="none"
                    stroke="#EC4899"
                    stroke-width="${strokeWidth}"
                    stroke-dasharray="${2 * Math.PI * (size - strokeWidth) / 2}"
                    stroke-dashoffset="${2 * Math.PI * (size - strokeWidth) / 2 * (1 - femalePercentage)}"
                    stroke-linecap="round"
                    style="transform: rotate(${maleAngle}deg); transform-origin: ${size / 2}px ${size / 2}px;"
                  />
                ` : ''}
              </svg>
            `,
          }}
        />
      </View>
    );
  }

  // Para mobile, usar Views com bordas
  return (
    <View style={[styles.donutChartView, { width: size, height: size }]}>
      {/* Background circle */}
      <View style={[styles.donutChartSegment, {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: '#F3F4F6',
        position: 'absolute',
      }]} />
      
      {/* Male segment */}
      {malePercentage > 0 && (
        <View style={[styles.donutChartSegment, {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: '#3B82F6',
          borderTopColor: '#3B82F6',
          borderRightColor: malePercentage > 0.25 ? '#3B82F6' : 'transparent',
          borderBottomColor: malePercentage > 0.5 ? '#3B82F6' : 'transparent',
          borderLeftColor: malePercentage > 0.75 ? '#3B82F6' : 'transparent',
          position: 'absolute',
        }]} />
      )}
      
      {/* Female segment */}
      {femalePercentage > 0 && (
        <View style={[styles.donutChartSegment, {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: '#EC4899',
          borderTopColor: malePercentage > 0.25 ? '#EC4899' : 'transparent',
          borderRightColor: malePercentage > 0.5 ? '#EC4899' : 'transparent',
          borderBottomColor: malePercentage > 0.75 ? '#EC4899' : 'transparent',
          borderLeftColor: '#EC4899',
          position: 'absolute',
          transform: [{ rotate: `${maleAngle}deg` }],
        }]} />
      )}
    </View>
  );
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [poloName, setPoloName] = useState<string | null>(null);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const isMobile = screenWidth < 768;
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalClasses: 0,
    completedClasses: 0,
    upcomingClasses: 0,
    totalAttendance: 0,
    attendanceRate: 0,
    maleStudents: 0,
    femaleStudents: 0,
    maleAttendance: 0,
    femaleAttendance: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [recentClasses, setRecentClasses] = useState<any[]>([]);
  const [studentsWithConsecutiveAbsences, setStudentsWithConsecutiveAbsences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Definir título da página na web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Musicalização Infantil | CCB';
    }
  }, []);

  // Detectar mudanças no tamanho da tela
  useEffect(() => {
    const updateLayout = ({ window }: { window: { width: number } }) => {
      setScreenWidth(window.width);
    };

    const subscription = Dimensions.addEventListener('change', updateLayout);
    
    return () => {
      subscription?.remove();
    };
  }, []);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<View>(null);

  const userName = profile?.fullName?.split(' ')[0] || 'Usuário';
  const userFullName = profile?.fullName || 'Usuário';
  const userInitials = userFullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Buscar nome do polo
  useEffect(() => {
    const fetchPoloName = async () => {
      if (profile?.poloId) {
        try {
          const { data, error } = await supabase
            .from('musicalizacao_polos')
            .select('nome')
            .eq('id', profile.poloId)
            .single();

          if (!error && data) {
            setPoloName(data.nome);
          }
        } catch (error) {
          console.error('Erro ao buscar nome do polo:', error);
        }
      }
    };

    fetchPoloName();
  }, [profile?.poloId]);

  // Carregar estatísticas e dados do dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Buscar estatísticas de alunos
        const { data: studentsData, error: studentsError } = await supabase
          .from('musicalizacao_students')
          .select('id, is_active, gender');

        if (studentsError) {
          console.error('Erro ao buscar alunos:', studentsError);
        } else {
          console.log('Alunos carregados:', studentsData?.length || 0);
        }

        const totalStudents = studentsData?.length || 0;
        const activeStudents = studentsData?.filter(s => {
          const isActive = s.is_active === true || s.is_active === 'true' || s.is_active === 1;
          return isActive;
        }).length || 0;
        const maleStudents = studentsData?.filter(s => s.gender === 'male').length || 0;
        const femaleStudents = studentsData?.filter(s => s.gender === 'female').length || 0;

        console.log('Estatísticas de alunos:', { totalStudents, activeStudents, maleStudents, femaleStudents });

        // Buscar estatísticas de aulas
        const { data: classesData, error: classesError } = await supabase
          .from('musicalizacao_classes')
          .select('id, status, class_date');

        if (classesError) {
          console.error('Erro ao buscar aulas:', classesError);
        } else {
          console.log('Aulas carregadas:', classesData?.length || 0);
        }

        const totalClasses = classesData?.length || 0;
        const completedClasses = classesData?.filter(c => c.status === 'completed').length || 0;
        const upcomingClasses = classesData?.filter(c => c.status === 'scheduled').length || 0;

        console.log('Estatísticas de aulas:', { totalClasses, completedClasses, upcomingClasses });

        // Buscar estatísticas de presença
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('musicalizacao_attendance')
          .select(`
            id,
            is_present,
            student:musicalizacao_students!student_id (gender)
          `);

        if (attendanceError) {
          console.error('Erro ao buscar presenças:', attendanceError);
        } else {
          console.log('Presenças carregadas:', attendanceData?.length || 0);
        }

        const totalAttendance = attendanceData?.length || 0;
        const presentCount = attendanceData?.filter(a => {
          const isPresent = a.is_present === true || a.is_present === 'true' || a.is_present === 1;
          return isPresent;
        }).length || 0;
        const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

        console.log('Estatísticas de presença:', { totalAttendance, presentCount, attendanceRate });

        // Calcular presença por gênero
        const maleAttendance = attendanceData?.filter(a => {
          const gender = (a.student as any)?.gender;
          return gender === 'male' && (a.is_present === true || a.is_present === 'true' || a.is_present === 1);
        }).length || 0;

        const femaleAttendance = attendanceData?.filter(a => {
          const gender = (a.student as any)?.gender;
          return gender === 'female' && (a.is_present === true || a.is_present === 'true' || a.is_present === 1);
        }).length || 0;

        const finalStats = {
          totalStudents,
          activeStudents,
          totalClasses,
          completedClasses,
          upcomingClasses,
          totalAttendance,
          attendanceRate: Math.round(attendanceRate * 100) / 100,
          maleStudents,
          femaleStudents,
          maleAttendance,
          femaleAttendance,
        };

        console.log('📊 Definindo estatísticas finais:', finalStats);
        setStats(finalStats);

        // Buscar aulas recentes
        const { data: recentClassesData } = await supabase
          .from('musicalizacao_classes')
          .select('id, title, class_date, status')
          .order('class_date', { ascending: false })
          .limit(5);

        setRecentClasses(recentClassesData || []);

        // Buscar atividades recentes (presenças registradas)
        const { data: recentAttendance } = await supabase
          .from('musicalizacao_attendance')
          .select(`
            id,
            recorded_at,
            is_present,
            class:musicalizacao_classes!class_id (title),
            student:musicalizacao_students!student_id (full_name)
          `)
          .order('recorded_at', { ascending: false })
          .limit(10);

        setRecentActivities(recentAttendance || []);

        // Buscar alunos com 3+ faltas consecutivas
        // Primeiro, buscar todas as aulas completadas ordenadas por data
        const { data: completedClassesForAbsences, error: completedClassesError } = await supabase
          .from('musicalizacao_classes')
          .select('id, class_date, title, status')
          .eq('status', 'completed')
          .order('class_date', { ascending: true });

        console.log('Aulas completadas encontradas:', completedClassesForAbsences?.length || 0);
        if (completedClassesError) {
          console.error('Erro ao buscar aulas completadas:', completedClassesError);
        }
        if (completedClassesForAbsences) {
          console.log('Detalhes das aulas completadas:', completedClassesForAbsences.map((c: any) => ({
            id: c.id,
            title: c.title,
            date: c.class_date,
            status: c.status
          })));
        }

        if (completedClassesForAbsences && completedClassesForAbsences.length > 0) {
          // Buscar todas as presenças para essas aulas
          const classIds = completedClassesForAbsences.map((c: any) => c.id);
          console.log('IDs das aulas completadas:', classIds);
          
          const { data: allAttendance, error: attendanceError } = await supabase
            .from('musicalizacao_attendance')
            .select(`
              id,
              student_id,
              is_present,
              class_id,
              student:musicalizacao_students!student_id (full_name, id)
            `)
            .in('class_id', classIds);

          console.log('Presenças encontradas:', allAttendance?.length || 0);
          if (attendanceError) {
            console.error('Erro ao buscar presenças:', attendanceError);
          }

          if (allAttendance && allAttendance.length > 0) {
            // Criar um mapa de class_id -> class_date para ordenação
            const classDateMap = new Map<string, string>();
            completedClassesForAbsences.forEach((c: any) => {
              classDateMap.set(c.id, c.class_date);
            });

            // Agrupar por aluno e verificar faltas consecutivas
            const studentsMap = new Map<string, any[]>();
            
            allAttendance.forEach((attendance: any) => {
              const studentId = attendance.student_id;
              if (!studentsMap.has(studentId)) {
                studentsMap.set(studentId, []);
              }
              const classDate = classDateMap.get(attendance.class_id);
              studentsMap.get(studentId)?.push({
                ...attendance,
                classDate: classDate || '',
                isAbsent: !(attendance.is_present === true || attendance.is_present === 'true' || attendance.is_present === 1),
              });
            });

            console.log('Total de alunos com presenças:', studentsMap.size);

            // Verificar cada aluno por faltas consecutivas
            const studentsWithAbsences: any[] = [];
            
            studentsMap.forEach((attendances, studentId) => {
              // Ordenar por data da aula
              attendances.sort((a, b) => {
                const dateA = a.classDate ? new Date(a.classDate).getTime() : 0;
                const dateB = b.classDate ? new Date(b.classDate).getTime() : 0;
                return dateA - dateB;
              });

              // Verificar sequência de faltas consecutivas nas ÚLTIMAS aulas
              // Verificar do final para o início para pegar as faltas mais recentes
              let consecutiveAbsences = 0;
              
              // Log para debug - mostrar todas as presenças ordenadas
              const student = attendances[0].student;
              console.log(`\n=== Verificando aluno: ${student?.full_name || 'Desconhecido'} ===`);
              console.log('Todas as presenças ordenadas por data:', attendances.map((a: any) => ({
                date: a.classDate,
                isAbsent: a.isAbsent,
                classId: a.class_id
              })));
              
              // Verificar do final para o início (últimas faltas consecutivas)
              for (let i = attendances.length - 1; i >= 0; i--) {
                if (attendances[i].isAbsent) {
                  consecutiveAbsences++;
                  console.log(`  Falta ${consecutiveAbsences} na aula de ${attendances[i].classDate}`);
                } else {
                  // Se encontrou uma presença, parar de contar (só conta faltas consecutivas no final)
                  console.log(`  Presença encontrada na aula de ${attendances[i].classDate} - parando contagem`);
                  break;
                }
              }

              console.log(`Total de faltas consecutivas: ${consecutiveAbsences}`);

              // Se tiver 3 ou mais faltas consecutivas nas últimas aulas, adicionar à lista
              if (consecutiveAbsences >= 3) {
                if (student) {
                  console.log(`✅ Aluno ${student.full_name} adicionado à lista com ${consecutiveAbsences} faltas consecutivas`);
                  studentsWithAbsences.push({
                    studentId,
                    studentName: student.full_name,
                    consecutiveAbsences: consecutiveAbsences,
                  });
                }
              }
            });

            console.log('Alunos com 3+ faltas consecutivas:', studentsWithAbsences);
            console.log('Total de alunos encontrados:', studentsWithAbsences.length);
            setStudentsWithConsecutiveAbsences(studentsWithAbsences);
          } else {
            console.log('Nenhuma presença encontrada para aulas completadas');
            setStudentsWithConsecutiveAbsences([]);
          }
        } else {
          console.log('Nenhuma aula completada encontrada');
          setStudentsWithConsecutiveAbsences([]);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      loadDashboardData();
    }
  }, [profile]);

  // Fechar menu ao clicar fora (apenas web)
  useEffect(() => {
    if (Platform.OS === 'web' && userMenuOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (userMenuRef.current && !(userMenuRef.current as any).contains(event.target)) {
          setUserMenuOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [userMenuOpen]);

  interface MenuItem {
    icon: string;
    label: string;
    active: boolean;
    onPress: () => void;
    hasArrow?: boolean;
  }

  const menuItems: MenuItem[] = [
    { 
      icon: 'home', 
      label: 'Início', 
      active: true,
      onPress: () => {
        setSidebarOpen(false);
        // Já está na tela inicial
      }
    },
    { 
      icon: 'calendar', 
      label: 'Calendário', 
      active: false,
      onPress: () => {
        setSidebarOpen(false);
        navigation.navigate('Main', { screen: 'Calendar' });
      }
    },
    { 
      icon: 'book', 
      label: 'Aulas', 
      active: false,
      onPress: () => {
        setSidebarOpen(false);
        navigation.navigate('Main', { screen: 'Classes' });
      }
    },
    { 
      icon: 'people', 
      label: 'Cadastro de Alunos', 
      active: false,
      onPress: () => {
        setSidebarOpen(false);
        navigation.navigate('Main', { screen: 'Students' });
      }
    },
    { 
      icon: 'checkmark-circle', 
      label: 'Registro de Presença', 
      active: false,
      onPress: () => {
        setSidebarOpen(false);
        navigation.navigate('Main', { screen: 'Attendance' });
      }
    },
    { 
      icon: 'document-text', 
      label: 'Relatórios', 
      active: false,
      onPress: () => {
        setSidebarOpen(false);
        navigation.navigate('Main', { screen: 'Reports' });
      }
    },
  ];

  const getIcon = (iconName: string) => {
    const iconProps = { size: 20, color: '#6B7280' };
    switch (iconName) {
      case 'home':
        return <Ionicons name="home" {...iconProps} />;
      case 'calendar':
        return <Ionicons name="calendar" {...iconProps} />;
      case 'book':
        return <Ionicons name="book" {...iconProps} />;
      case 'clipboard-check':
        return <FontAwesome5 name="clipboard-check" {...iconProps} />;
      case 'graduation-cap':
        return <FontAwesome5 name="graduation-cap" {...iconProps} />;
      case 'file-alt':
        return <FontAwesome5 name="file-alt" {...iconProps} />;
      case 'dollar-sign':
        return <FontAwesome5 name="dollar-sign" {...iconProps} />;
      case 'book-open':
        return <Ionicons name="library" {...iconProps} />;
      case 'library':
        return <Ionicons name="library-outline" {...iconProps} />;
      case 'gift':
        return <FontAwesome5 name="gift" {...iconProps} />;
      case 'people':
        return <Ionicons name="people" {...iconProps} />;
      case 'checkmark-circle':
        return <Ionicons name="checkmark-circle" {...iconProps} />;
      case 'document-text':
        return <Ionicons name="document-text" {...iconProps} />;
      default:
        return <MaterialIcons name="circle" {...iconProps} />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => setSidebarOpen(!sidebarOpen)}
            style={styles.menuButton}
          >
            <Ionicons name="menu" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Image 
            source={require('../../img/logo-ccb-light.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="chatbubble-outline" size={20} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="notifications-outline" size={20} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="help-circle-outline" size={20} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setUserMenuOpen(!userMenuOpen)}
            style={styles.userInitials}
          >
            <Text style={styles.userInitialsText}>{userInitials}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {/* Sidebar */}
        <View style={[styles.sidebar, sidebarOpen && styles.sidebarOpen]}>
          {menuItems.map((item, index) => {
            const handlePress = () => {
              if (item.onPress) {
                item.onPress();
              }
            };
            
            return (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, item.active && styles.menuItemActive]}
                onPress={handlePress}
              >
                <View style={styles.menuItemContent}>
                  {getIcon(item.icon)}
                  <Text
                    style={[
                      styles.menuItemText,
                      item.active && styles.menuItemTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
                {item.hasArrow && (
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Main Content */}
        <ScrollView
          style={styles.mainContent}
          contentContainerStyle={[styles.mainContentScroll, isMobile && styles.mainContentScrollMobile]}
          showsHorizontalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.dashboardHeader}>
            <View>
              <Text style={styles.dashboardTitle}>Dashboard</Text>
              <Text style={styles.dashboardSubtitle}>
                {new Date().toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.dateRange}>
              <Text style={styles.dateRangeText}>
                {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
              </Text>
              <Text style={styles.dateRangeCompare}>
                comparado a {new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
          </View>

          {/* Main Metrics Cards */}
          <View style={[styles.metricsRow, isMobile && styles.metricsRowMobile]}>
            <View style={[styles.metricCard, isMobile && styles.metricCardMobile]}>
              <View style={styles.metricCardHeader}>
                <Text style={styles.metricCardTitle}>TOTAL DE ALUNOS</Text>
                <Ionicons name="people" size={24} color="#033D60" />
              </View>
              <Text style={styles.metricCardValue}>{stats.totalStudents}</Text>
              <View style={styles.metricCardFooter}>
                <Text style={styles.metricCardSubtitle}>
                  {stats.activeStudents} ativos
                </Text>
                <Text style={styles.metricCardChange}>0.00%</Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricCardHeader}>
                <Text style={styles.metricCardTitle}>TAXA DE PRESENÇA</Text>
                <Ionicons name="checkmark-circle" size={24} color="#033D60" />
              </View>
              <Text style={styles.metricCardValue}>{stats.attendanceRate.toFixed(1)}%</Text>
              <View style={styles.metricCardFooter}>
                <Text style={styles.metricCardSubtitle}>
                  {stats.totalAttendance} registros
                </Text>
                <Text style={styles.metricCardChange}>0.00%</Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricCardHeader}>
                <Text style={styles.metricCardTitle}>AULAS AGENDADAS</Text>
                <Ionicons name="calendar" size={24} color="#033D60" />
              </View>
              <Text style={styles.metricCardValue}>{stats.upcomingClasses}</Text>
              <View style={styles.metricCardFooter}>
                <Text style={styles.metricCardSubtitle}>
                  {stats.completedClasses} completadas
                </Text>
                <Text style={styles.metricCardChange}>0.00%</Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricCardHeader}>
                <Text style={styles.metricCardTitle}>TOTAL DE AULAS</Text>
                <Ionicons name="book" size={24} color="#033D60" />
              </View>
              <Text style={styles.metricCardValue}>{stats.totalClasses}</Text>
              <View style={styles.metricCardFooter}>
                <Text style={styles.metricCardSubtitle}>
                  {stats.completedClasses} completadas
                </Text>
                <Text style={styles.metricCardChange}>0.00%</Text>
              </View>
            </View>
          </View>

          {/* Analytics Section */}
          <View style={[styles.analyticsRow, isMobile && styles.analyticsRowMobile]}>
            <View style={[styles.analyticsCard, isMobile && styles.analyticsCardMobile]}>
              <Text style={styles.analyticsCardTitle}>ANÁLISE DE ALUNOS</Text>
              <View style={styles.analyticsContent}>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsValue}>{stats.activeStudents}</Text>
                  <Text style={styles.analyticsLabel}>Alunos Ativos</Text>
                  <View style={styles.analyticsBarContainer}>
                    <View style={styles.analyticsBar}>
                      <View 
                        style={[
                          styles.analyticsBarFill, 
                          { 
                            width: `${stats.totalStudents > 0 ? (stats.activeStudents / stats.totalStudents) * 100 : 0}%`,
                            backgroundColor: '#10B981'
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.analyticsBarText}>
                      {stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}%
                    </Text>
                  </View>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsValue}>{stats.totalStudents - stats.activeStudents}</Text>
                  <Text style={styles.analyticsLabel}>Alunos Inativos</Text>
                  <View style={styles.analyticsBarContainer}>
                    <View style={styles.analyticsBar}>
                      <View 
                        style={[
                          styles.analyticsBarFill, 
                          { 
                            width: `${stats.totalStudents > 0 ? ((stats.totalStudents - stats.activeStudents) / stats.totalStudents) * 100 : 0}%`,
                            backgroundColor: '#ed5565'
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.analyticsBarText}>
                      {stats.totalStudents > 0 ? Math.round(((stats.totalStudents - stats.activeStudents) / stats.totalStudents) * 100) : 0}%
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsCardTitle}>FREQUÊNCIA POR GÊNERO</Text>
              <View style={styles.analyticsContent}>
                <View style={styles.genderChartWrapper}>
                  {/* Donut Chart */}
                  <View style={styles.donutChartContainer}>
                    <DonutChart
                      male={stats.maleStudents}
                      female={stats.femaleStudents}
                      total={stats.totalStudents}
                    />
                    <View style={styles.donutChartCenter}>
                      <Text style={styles.donutChartTotal}>{stats.totalStudents}</Text>
                      <Text style={styles.donutChartLabel}>Total</Text>
                    </View>
                  </View>
                  
                  {/* Legend */}
                  <View style={styles.genderChartLegend}>
                    <View style={styles.genderChartItem}>
                      <View style={styles.genderChartHeader}>
                        <View style={[styles.genderChartDot, { backgroundColor: '#3B82F6' }]} />
                        <Text style={styles.genderChartLabel}>Meninos</Text>
                      </View>
                      <View style={styles.genderChartStats}>
                        <Text style={styles.genderChartValue}>{stats.maleStudents}</Text>
                        <Text style={styles.genderChartSubtext}>
                          {stats.maleAttendance} presenças
                        </Text>
                        {stats.totalStudents > 0 && (
                          <Text style={styles.genderChartPercentage}>
                            {Math.round((stats.maleStudents / stats.totalStudents) * 100)}%
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.genderChartDivider} />
                    
                    <View style={styles.genderChartItem}>
                      <View style={styles.genderChartHeader}>
                        <View style={[styles.genderChartDot, { backgroundColor: '#EC4899' }]} />
                        <Text style={styles.genderChartLabel}>Meninas</Text>
                      </View>
                      <View style={styles.genderChartStats}>
                        <Text style={styles.genderChartValue}>{stats.femaleStudents}</Text>
                        <Text style={styles.genderChartSubtext}>
                          {stats.femaleAttendance} presenças
                        </Text>
                        {stats.totalStudents > 0 && (
                          <Text style={styles.genderChartPercentage}>
                            {Math.round((stats.femaleStudents / stats.totalStudents) * 100)}%
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.genderChartSummary}>
                      <View style={styles.genderChartSummaryItem}>
                        <Text style={styles.genderChartSummaryLabel}>Total de Presenças</Text>
                        <Text style={styles.genderChartSummaryValue}>
                          {stats.maleAttendance + stats.femaleAttendance}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsCardTitle}>AULAS POR STATUS</Text>
              <View style={styles.analyticsContent}>
                <View style={styles.classStatusWrapper}>
                  {/* Pie Chart */}
                  <View style={styles.classStatusChart}>
                    <PieChart
                      completed={stats.completedClasses}
                      scheduled={stats.upcomingClasses}
                      total={stats.totalClasses}
                    />
                    <View style={styles.classStatusChartCenter}>
                      <Text style={styles.classStatusChartTotal}>{stats.totalClasses}</Text>
                      <Text style={styles.classStatusChartLabel}>Total de Aulas</Text>
                    </View>
                  </View>
                  
                  {/* Legend e Detalhes */}
                  <View style={styles.classStatusLegend}>
                    <View style={styles.analyticsProgressItem}>
                      <View style={styles.analyticsProgressHeader}>
                        <View style={styles.classStatusLegendItem}>
                          <View style={[styles.classStatusDot, { backgroundColor: '#10B981' }]} />
                          <Text style={styles.analyticsProgressLabel}>Completadas</Text>
                        </View>
                        <Text style={styles.analyticsProgressValue}>{stats.completedClasses}</Text>
                      </View>
                      {stats.totalClasses > 0 && (
                        <View style={styles.classStatusProgressBar}>
                          <View 
                            style={[
                              styles.classStatusProgressFill, 
                              { 
                                width: `${(stats.completedClasses / stats.totalClasses) * 100}%`,
                                backgroundColor: '#10B981'
                              }
                            ]} 
                          />
                        </View>
                      )}
                      {stats.totalClasses > 0 && (
                        <Text style={styles.classStatusPercentage}>
                          {Math.round((stats.completedClasses / stats.totalClasses) * 100)}% do total
                        </Text>
                      )}
                    </View>
                    
                    <View style={styles.classStatusDivider} />
                    
                    <View style={styles.analyticsProgressItem}>
                      <View style={styles.analyticsProgressHeader}>
                        <View style={styles.classStatusLegendItem}>
                          <View style={[styles.classStatusDot, { backgroundColor: '#F59E0B' }]} />
                          <Text style={styles.analyticsProgressLabel}>Agendadas</Text>
                        </View>
                        <Text style={styles.analyticsProgressValue}>{stats.upcomingClasses}</Text>
                      </View>
                      {stats.totalClasses > 0 && (
                        <View style={styles.classStatusProgressBar}>
                          <View 
                            style={[
                              styles.classStatusProgressFill, 
                              { 
                                width: `${(stats.upcomingClasses / stats.totalClasses) * 100}%`,
                                backgroundColor: '#F59E0B'
                              }
                            ]} 
                          />
                        </View>
                      )}
                      {stats.totalClasses > 0 && (
                        <Text style={styles.classStatusPercentage}>
                          {Math.round((stats.upcomingClasses / stats.totalClasses) * 100)}% do total
                        </Text>
                      )}
                    </View>

                    <View style={styles.classStatusDivider} />

                    <View style={styles.classStatusSummary}>
                      <View style={styles.classStatusSummaryItem}>
                        <Text style={styles.classStatusSummaryLabel}>Taxa de Conclusão</Text>
                        <Text style={styles.classStatusSummaryValue}>
                          {stats.totalClasses > 0 ? Math.round((stats.completedClasses / stats.totalClasses) * 100) : 0}%
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Alunos com Faltas Consecutivas */}
          {studentsWithConsecutiveAbsences.length > 0 && (
            <View style={styles.warningCard}>
              <View style={styles.warningCardHeader}>
                <View style={styles.warningCardTitleContainer}>
                  <Ionicons name="warning" size={24} color="#F59E0B" />
                  <Text style={styles.warningCardTitle}>Alunos com 3+ Faltas Consecutivas</Text>
                </View>
                <View style={styles.warningCardBadge}>
                  <Text style={styles.warningCardBadgeText}>{studentsWithConsecutiveAbsences.length}</Text>
                </View>
              </View>
              <View style={styles.warningCardList}>
                {studentsWithConsecutiveAbsences.map((item, index) => (
                  <View key={item.studentId || index} style={styles.warningCardItem}>
                    <View style={styles.warningCardItemContent}>
                      <Ionicons name="person-circle-outline" size={20} color="#F59E0B" />
                      <View style={styles.warningCardItemText}>
                        <Text style={styles.warningCardItemName}>{item.studentName}</Text>
                        <Text style={styles.warningCardItemSubtext}>{item.consecutiveAbsences} faltas consecutivas</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Main', { screen: 'Students' })}
                      style={styles.warningCardItemButton}
                    >
                      <Text style={styles.warningCardItemButtonText}>Ver</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Recent Activities and Classes */}
          <View style={[styles.activitiesRow, isMobile && styles.activitiesRowMobile]}>
            <View style={[styles.activitiesCard, isMobile && styles.activitiesCardMobile]}>
              <View style={styles.activitiesCardHeader}>
                <Text style={styles.activitiesCardTitle}>Atividades Recentes</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Attendance' })}>
                  <Text style={styles.activitiesCardLink}>Ver todas</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.activitiesList}>
                {loading ? (
                  <Text style={styles.activitiesEmpty}>Carregando...</Text>
                ) : recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <View key={activity.id || index} style={styles.activityItem}>
                      <View style={styles.activityIcon}>
                        <Ionicons 
                          name={activity.is_present ? "checkmark-circle" : "close-circle"} 
                          size={20} 
                          color={activity.is_present ? "#10B981" : "#ed5565"} 
                        />
                      </View>
                      <View style={styles.activityContent}>
                        <Text style={styles.activityText}>
                          <Text style={styles.activityBold}>{activity.student?.full_name || 'Aluno'}</Text>
                          {' '}
                          {activity.is_present ? 'esteve presente' : 'faltou'} em
                          {' '}
                          <Text style={styles.activityBold}>{activity.class?.title || 'Aula'}</Text>
                        </Text>
                        <Text style={styles.activityTime}>
                          {activity.recorded_at 
                            ? new Date(activity.recorded_at).toLocaleDateString('pt-BR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Data não disponível'}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.activitiesEmpty}>Nenhuma atividade recente</Text>
                )}
              </View>
            </View>

            <View style={styles.activitiesCard}>
              <View style={styles.activitiesCardHeader}>
                <Text style={styles.activitiesCardTitle}>Aulas Recentes</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Classes' })}>
                  <Text style={styles.activitiesCardLink}>Ver todas</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.activitiesList}>
                {loading ? (
                  <Text style={styles.activitiesEmpty}>Carregando...</Text>
                ) : recentClasses.length > 0 ? (
                  recentClasses.map((classItem, index) => (
                    <View key={classItem.id || index} style={styles.activityItem}>
                      <View style={styles.activityIcon}>
                        <Ionicons 
                          name={classItem.status === 'completed' ? "checkmark-circle" : "time"} 
                          size={20} 
                          color={classItem.status === 'completed' ? "#10B981" : "#F59E0B"} 
                        />
                      </View>
                      <View style={styles.activityContent}>
                        <Text style={styles.activityText}>
                          <Text style={styles.activityBold}>{classItem.title || 'Aula'}</Text>
                        </Text>
                        <Text style={styles.activityTime}>
                          {classItem.class_date 
                            ? new Date(classItem.class_date).toLocaleDateString('pt-BR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })
                            : 'Data não disponível'}
                          {' • '}
                          {classItem.status === 'completed' ? 'Completada' : classItem.status === 'scheduled' ? 'Agendada' : 'Cancelada'}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.activitiesEmpty}>Nenhuma aula recente</Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>


      {/* User Menu Dropdown */}
      {userMenuOpen && (
        <View style={styles.userMenuContainer} ref={userMenuRef}>
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setUserMenuOpen(false)}
          />
          <View style={styles.userMenu}>
              {/* User Info Header */}
              <View style={styles.userMenuHeader}>
                <View style={styles.userMenuAvatar}>
                  <Text style={styles.userMenuAvatarText}>{userInitials}</Text>
                </View>
                <View style={styles.userMenuInfo}>
                  <Text style={styles.userMenuName}>{userFullName}</Text>
                  <Text style={styles.userMenuRA}>{poloName || 'Polo não informado'}</Text>
                </View>
              </View>

              {/* Menu Items */}
              <View style={styles.userMenuItems}>
                <TouchableOpacity
                  style={styles.userMenuItem}
                  onPress={() => {
                    setUserMenuOpen(false);
                    navigation.navigate('Main', { screen: 'Profile' });
                  }}
                >
                  <Ionicons name="person-outline" size={20} color="#6B7280" />
                  <Text style={styles.userMenuItemText}>Perfil</Text>
                </TouchableOpacity>

                <View style={styles.userMenuDivider} />

                <TouchableOpacity
                  style={styles.userMenuItem}
                  onPress={toggleTheme}
                >
                  <Ionicons name="moon-outline" size={20} color="#6B7280" />
                  <Text style={styles.userMenuItemText}>Modo Escuro</Text>
                  <View style={[styles.toggleSwitch, isDark && styles.toggleSwitchOn]}>
                    <View style={[styles.toggleSwitchThumb, isDark && styles.toggleSwitchThumbOn]} />
                  </View>
                </TouchableOpacity>

                <View style={styles.userMenuDivider} />

                <TouchableOpacity
                  style={styles.userMenuItem}
                  onPress={async () => {
                    setUserMenuOpen(false);
                    await logout();
                  }}
                >
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                  <Text style={[styles.userMenuItemText, styles.userMenuItemLogout]}>
                    Sair
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    ...(isWeb && {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    }),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuButton: {
    padding: spacing.xs,
  },
  logo: {
    width: 120,
    height: 60,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIcon: {
    padding: spacing.xs,
  },
  userInitials: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitialsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: isWeb ? 280 : 0,
    backgroundColor: '#F3F4F6',
    paddingTop: spacing.lg,
    ...(isWeb
      ? {}
      : {
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          ...(Platform.OS === 'web'
            ? {}
            : {
                shadowColor: '#000',
                shadowOffset: { width: 2, height: 0 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }),
        }),
  },
  sidebarOpen: {
    width: 280,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.sm,
    marginVertical: spacing.xs,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: '#E5E7EB',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  menuItemTextActive: {
    color: '#1F2937',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  mainContentScroll: {
    padding: spacing.lg,
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
  },
  mainContentScrollMobile: {
    padding: spacing.md,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: spacing.xl,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: spacing.xs,
  },
  dashboardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  dateRange: {
    alignItems: 'flex-end',
  },
  dateRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: spacing.xs,
  },
  dateRangeCompare: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
    width: '100%',
    flexWrap: 'wrap',
  },
  metricsRowMobile: {
    flexDirection: 'column',
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: 200,
    maxWidth: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...(isWeb
      ? {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }),
  },
  metricCardMobile: {
    flex: 0,
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  metricCardTitle: {
    fontSize: isWeb ? 13 : 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  metricCardValue: {
    fontSize: isWeb ? 36 : 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  metricCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricCardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  metricCardChange: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  analyticsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
    width: '100%',
    flexWrap: 'wrap',
  },
  analyticsRowMobile: {
    flexDirection: 'column',
    gap: spacing.md,
  },
  analyticsCard: {
    flex: 1,
    minWidth: 280,
    maxWidth: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...(isWeb
      ? {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }),
  },
  analyticsCardMobile: {
    flex: 0,
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
  },
  analyticsCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  analyticsContent: {
    gap: 0,
  },
  analyticsItem: {
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  analyticsItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  analyticsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: spacing.xs,
  },
  analyticsBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  analyticsBar: {
    flex: 1,
    height: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
  },
  analyticsBarFill: {
    height: '100%',
    borderRadius: 12,
  },
  analyticsBarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    minWidth: 45,
    textAlign: 'right',
    marginLeft: spacing.xs,
  },
  analyticsChange: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  genderChartWrapper: {
    flexDirection: isWeb ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: spacing.md,
  },
  donutChartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutChartView: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutChartSegment: {
    position: 'absolute',
  },
  donutChartCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutChartTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  donutChartLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  genderChartLegend: {
    flex: 1,
    gap: spacing.sm,
    width: '100%',
    ...(isWeb ? { paddingLeft: spacing.sm } : { paddingTop: spacing.sm }),
  },
  genderChartContainer: {
    gap: spacing.lg,
  },
  genderChartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  genderChartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 6,
  },
  genderChartLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  genderChartBar: {
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  genderChartBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  genderChartStats: {
    flexDirection: 'column',
    gap: spacing.xs,
  },
  genderChartDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  genderChartValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  genderChartSubtext: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 3,
  },
  genderChartPercentage: {
    fontSize: 13,
    fontWeight: '500',
    color: '#10B981',
  },
  genderChartDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: spacing.xs,
  },
  genderChartSummary: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  genderChartSummaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  genderChartSummaryLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  genderChartSummaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  analyticsProgressItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
  },
  analyticsProgressItemLast: {
    marginBottom: 0,
    paddingBottom: 0,
  },
  classStatusWrapper: {
    flexDirection: isWeb ? 'row' : 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    gap: spacing.lg,
  },
  classStatusChart: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  classStatusChartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  classStatusChartView: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  classStatusChartSegment: {
    position: 'absolute',
  },
  classStatusChartCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  classStatusChartTotal: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  classStatusChartLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  classStatusLegend: {
    flex: 1,
    gap: spacing.md,
    width: '100%',
    ...(isWeb ? { paddingLeft: spacing.md } : { paddingTop: spacing.md }),
  },
  classStatusLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  classStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  classStatusPercentage: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: spacing.xs,
  },
  classStatusDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: spacing.sm,
  },
  classStatusProgressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  classStatusProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  classStatusSummary: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  classStatusSummaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classStatusSummaryLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  classStatusSummaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  analyticsProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  analyticsProgressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  analyticsProgressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  analyticsProgressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  analyticsProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  activitiesRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    flexWrap: 'wrap',
  },
  activitiesRowMobile: {
    flexDirection: 'column',
    gap: spacing.md,
  },
  activitiesCard: {
    flex: 1,
    minWidth: 300,
    maxWidth: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...(isWeb
      ? {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }),
  },
  activitiesCardMobile: {
    flex: 0,
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
  },
  activitiesCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  activitiesCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  activitiesCardLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#033D60',
  },
  activitiesList: {
    gap: spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    marginTop: spacing.xs,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  activityBold: {
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  activitiesEmpty: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: spacing.xl,
  },
  warningCard: {
    width: '100%',
    maxWidth: '100%',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    ...(isWeb
      ? {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }),
  },
  warningCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#FEF3C7',
  },
  warningCardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  warningCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  warningCardBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minWidth: 32,
    alignItems: 'center',
  },
  warningCardBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  warningCardList: {
    gap: spacing.md,
  },
  warningCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  warningCardItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  warningCardItemText: {
    flex: 1,
  },
  warningCardItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: spacing.xs,
  },
  warningCardItemSubtext: {
    fontSize: 12,
    color: '#92400E',
  },
  warningCardItemButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: '#F59E0B',
    borderRadius: 6,
  },
  warningCardItemButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contentRow: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: spacing.lg,
    ...(isWeb ? {} : { width: '100%' }),
  },
  leftColumn: {
    flex: isWeb ? 2 : 1,
    gap: spacing.lg,
    ...(isWeb ? {} : { width: '100%' }),
  },
  rightColumn: {
    flex: isWeb ? 1 : 1,
    ...(isWeb ? {} : { width: '100%' }),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.xl,
    ...(isWeb
      ? {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  navArrows: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  navArrow: {
    padding: spacing.xs,
  },
  cardContent: {
    alignItems: 'center',
  },
  statusIconContainer: {
    marginBottom: spacing.lg,
  },
  statusIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  statusDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  userMenuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  userMenu: {
    position: 'absolute',
    top: 70,
    right: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 280,
    maxWidth: 320,
    zIndex: 1001,
    ...(isWeb
      ? {
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 8,
        }),
  },
  userMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  userMenuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  userMenuAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  userMenuInfo: {
    flex: 1,
  },
  userMenuName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: spacing.xs,
  },
  userMenuRA: {
    fontSize: 13,
    color: '#6B7280',
  },
  userMenuItems: {
    paddingVertical: spacing.xs,
  },
  userMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  userMenuItemText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  userMenuItemLogout: {
    color: '#EF4444',
  },
  userMenuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: spacing.xs,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    paddingHorizontal: 2,
    marginLeft: 'auto',
    position: 'relative',
  },
  toggleSwitchOn: {
    backgroundColor: '#3B82F6',
  },
  toggleSwitchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    left: 2,
    ...(isWeb
      ? {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 2,
        }),
  },
  toggleSwitchThumbOn: {
    left: 22,
  },
});
