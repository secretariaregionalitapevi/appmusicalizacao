/**
 * Tela inicial do aplicativo - Dashboard estilo MBX Academy
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import { AdminLayout } from '@/components/common/AdminLayout';

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
  const screenWidth = Dimensions.get('window').width;
  const isMobileChart = screenWidth < 768;
  const size = isMobileChart ? Math.min(120, screenWidth * 0.4) : 120;
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
  const { profile } = useAuth();
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
  const [previousStats, setPreviousStats] = useState({
    totalStudents: 0,
    attendanceRate: 0,
    upcomingClasses: 0,
    totalClasses: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [recentClasses, setRecentClasses] = useState<any[]>([]);
  const [studentsWithConsecutiveAbsences, setStudentsWithConsecutiveAbsences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Definir título da página na web quando a tela recebe foco
  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.title = 'Dashboard | CCB';
      }
    }, [])
  );

  // Também definir no mount para garantir
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Dashboard | CCB';
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

  // Função separada para carregar faltas consecutivas (não bloqueia o carregamento principal)
  const loadConsecutiveAbsences = useCallback(async () => {
    try {
        const { data: completedClassesForAbsences, error: completedClassesError } = await supabase
          .from('musicalizacao_classes')
          .select('id, class_date, title, status')
          .eq('status', 'completed')
          .order('class_date', { ascending: true });

      if (completedClassesError || !completedClassesForAbsences || completedClassesForAbsences.length === 0) {
        setStudentsWithConsecutiveAbsences([]);
        return;
      }

          const classIds = completedClassesForAbsences.map((c: any) => c.id);
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

      if (attendanceError || !allAttendance || allAttendance.length === 0) {
        setStudentsWithConsecutiveAbsences([]);
        return;
      }

      // Criar mapa de datas
            const classDateMap = new Map<string, string>();
            completedClassesForAbsences.forEach((c: any) => {
              classDateMap.set(c.id, c.class_date);
            });

      // Agrupar por aluno
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

      // Verificar faltas consecutivas
            const studentsWithAbsences: any[] = [];
            studentsMap.forEach((attendances, studentId) => {
              attendances.sort((a, b) => {
                const dateA = a.classDate ? new Date(a.classDate).getTime() : 0;
                const dateB = b.classDate ? new Date(b.classDate).getTime() : 0;
                return dateA - dateB;
              });

              let consecutiveAbsences = 0;
              for (let i = attendances.length - 1; i >= 0; i--) {
                if (attendances[i].isAbsent) {
                  consecutiveAbsences++;
                } else {
                  break;
                }
              }

        if (consecutiveAbsences >= 3 && attendances[0]?.student) {
                  studentsWithAbsences.push({
                    studentId,
            studentName: attendances[0].student.full_name,
            consecutiveAbsences,
                  });
              }
            });

            setStudentsWithConsecutiveAbsences(studentsWithAbsences);
    } catch (error) {
      console.error('Erro ao carregar faltas consecutivas:', error);
            setStudentsWithConsecutiveAbsences([]);
          }
  }, []);

  // Função para carregar dados do dashboard
  const loadDashboardData = useCallback(async () => {
    if (!profile) {
        setLoading(false);
      return;
    }

    let timeoutId: NodeJS.Timeout | null = null;

      try {
        setLoading(true);

      // Timeout reduzido para 5 segundos
      timeoutId = setTimeout(() => {
        console.warn('⏱️ Timeout no carregamento - desativando loading');
        setLoading(false);
        timeoutId = null;
      }, 5000);

      // Verificar sessão antes de fazer requisições
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('❌ Erro de sessão:', sessionError);
        if (timeoutId) clearTimeout(timeoutId);
        setLoading(false);
        return;
      }

      // Calcular períodos
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
      const fourteenDaysAgoStr = fourteenDaysAgo.toISOString().split('T')[0];
      const sevenDaysAgoISO = sevenDaysAgo.toISOString();
      const fourteenDaysAgoISO = fourteenDaysAgo.toISOString();

      // Fazer todas as requisições principais em paralelo
      const [
        { data: studentsData, error: studentsError },
        { data: classesData, error: classesError },
        { data: attendanceData, error: attendanceError },
        { data: previousClassesData },
        { data: previousAttendanceData },
        { data: recentClassesData },
        { data: recentAttendance },
      ] = await Promise.all([
        supabase
          .from('musicalizacao_students')
          .select('id, is_active, gender'),
        supabase
          .from('musicalizacao_classes')
          .select('id, status, class_date')
          .gte('class_date', sevenDaysAgoStr),
        supabase
          .from('musicalizacao_attendance')
          .select(`
            id,
            is_present,
            recorded_at,
            student:musicalizacao_students!student_id (gender)
          `)
          .gte('recorded_at', sevenDaysAgoISO),
        supabase
          .from('musicalizacao_classes')
          .select('id, status, class_date')
          .gte('class_date', fourteenDaysAgoStr)
          .lt('class_date', sevenDaysAgoStr),
        supabase
          .from('musicalizacao_attendance')
          .select('id, is_present, recorded_at')
          .gte('recorded_at', fourteenDaysAgoISO)
          .lt('recorded_at', sevenDaysAgoISO),
        supabase
          .from('musicalizacao_classes')
          .select('id, title, class_date, status')
          .order('class_date', { ascending: false })
          .limit(5),
        supabase
          .from('musicalizacao_attendance')
          .select(`
            id,
            recorded_at,
            is_present,
            class:musicalizacao_classes!class_id (title),
            student:musicalizacao_students!student_id (full_name)
          `)
          .order('recorded_at', { ascending: false })
          .limit(10),
      ]);

      // Tratar erros
      if (studentsError) console.error('Erro ao buscar alunos:', studentsError);
      if (classesError) console.error('Erro ao buscar aulas:', classesError);
      if (attendanceError) console.error('Erro ao buscar presenças:', attendanceError);

      // Processar dados de alunos
        const totalStudents = studentsData?.length || 0;
        const activeStudents = studentsData?.filter(s => {
          const isActive = s.is_active === true || s.is_active === 'true' || s.is_active === 1;
          return isActive;
        }).length || 0;
        const maleStudents = studentsData?.filter(s => s.gender === 'male').length || 0;
        const femaleStudents = studentsData?.filter(s => s.gender === 'female').length || 0;

      // Processar dados de aulas
        const totalClasses = classesData?.length || 0;
        const completedClasses = classesData?.filter(c => c.status === 'completed').length || 0;
        const upcomingClasses = classesData?.filter(c => c.status === 'scheduled').length || 0;

      // Processar dados de presença
        const totalAttendance = attendanceData?.length || 0;
        const presentCount = attendanceData?.filter(a => {
          const isPresent = a.is_present === true || a.is_present === 'true' || a.is_present === 1;
          return isPresent;
        }).length || 0;
        const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

      // Processar dados do período anterior
      const previousTotalClasses = previousClassesData?.length || 0;
      const previousUpcomingClasses = previousClassesData?.filter(c => c.status === 'scheduled').length || 0;
      const previousTotalAttendance = previousAttendanceData?.length || 0;
      const previousPresentCount = previousAttendanceData?.filter(a => {
        const isPresent = a.is_present === true || a.is_present === 'true' || a.is_present === 1;
        return isPresent;
      }).length || 0;
      const previousAttendanceRate = previousTotalAttendance > 0 ? (previousPresentCount / previousTotalAttendance) * 100 : 0;

      setPreviousStats({
        totalStudents,
        attendanceRate: previousAttendanceRate,
        upcomingClasses: previousUpcomingClasses,
        totalClasses: previousTotalClasses,
      });

        // Calcular presença por gênero
        const maleAttendance = attendanceData?.filter(a => {
          const gender = (a.student as any)?.gender;
          return gender === 'male' && (a.is_present === true || a.is_present === 'true' || a.is_present === 1);
        }).length || 0;

        const femaleAttendance = attendanceData?.filter(a => {
          const gender = (a.student as any)?.gender;
          return gender === 'female' && (a.is_present === true || a.is_present === 'true' || a.is_present === 1);
        }).length || 0;

      // Definir estatísticas principais
      setStats({
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
      });

      // Definir dados recentes
      setRecentClasses(recentClassesData || []);
      setRecentActivities(recentAttendance || []);

      // Carregar faltas consecutivas de forma assíncrona (não bloqueia a UI)
      loadConsecutiveAbsences();
    } catch (error) {
      console.error('❌ Erro ao carregar dados do dashboard:', error);
      if (error instanceof Error) {
        console.error('❌ Mensagem:', error.message);
        console.error('❌ Stack:', error.stack);
      }
      
      // Mesmo com erro, definir valores padrão para não travar a tela
      setStats({
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
      setPreviousStats({
        totalStudents: 0,
        attendanceRate: 0,
        upcomingClasses: 0,
        totalClasses: 0,
      });
      setRecentActivities([]);
      setRecentClasses([]);
            setStudentsWithConsecutiveAbsences([]);
      } finally {
      // Limpar timeout se ainda estiver ativo
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // Garantir que o loading sempre seja desativado
        setLoading(false);
      }
  }, [profile, loadConsecutiveAbsences]);

  // Carregar dados quando o perfil estiver disponível
  useEffect(() => {
    if (profile) {
      loadDashboardData();
    }
  }, [profile, loadDashboardData]);

  return (
    <AdminLayout 
      currentScreen="Home" 
      showPageTitle={false}
      onRefresh={loadDashboardData}
      refreshing={loading}
    >
      <View style={[
        styles.dashboardContainer,
        isMobile && styles.dashboardContainerMobile
      ]}>
          {/* Header Section */}
          <View style={[
            styles.dashboardHeader,
            isMobile && {
              flexDirection: 'column',
              gap: spacing.md,
              paddingHorizontal: spacing.md,
            }
          ]}>
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
            <View style={[
              styles.dateRange,
              isMobile && {
                alignItems: 'flex-start',
                width: '100%',
                marginTop: spacing.sm,
              }
            ]}>
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
            <View style={isMobile ? styles.metricCardMobile : styles.metricCard}>
              <View style={styles.metricCardHeader}>
                <Text 
                  style={[
                    styles.metricCardTitle, 
                    isMobile && { fontSize: 11 }
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >TOTAL DE ALUNOS</Text>
                <Ionicons name="people" size={isMobile ? 20 : 24} color="#033D60" />
              </View>
              <Text 
                style={[
                  styles.metricCardValue,
                  isMobile && { fontSize: 24 }
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit={!isMobile}
              >{stats.totalStudents}</Text>
              <View style={styles.metricCardFooter}>
                <Text style={styles.metricCardSubtitle}>
                  {stats.activeStudents} ativos
                </Text>
                <View style={styles.metricCardChangeContainer}>
                  <Text style={[styles.metricCardChange, { color: '#10B981' }]}>
                    {stats.totalStudents > 0 ? `${Math.round((stats.activeStudents / stats.totalStudents) * 100)}%` : '0%'}
                  </Text>
                  <Ionicons name="arrow-up" size={14} color="#10B981" />
                </View>
              </View>
            </View>

            <View style={isMobile ? styles.metricCardMobile : styles.metricCard}>
              <View style={styles.metricCardHeader}>
                <Text 
                  style={[
                    styles.metricCardTitle, 
                    isMobile && { fontSize: 11 }
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >TAXA DE PRESENÇA</Text>
                <Ionicons name="checkmark-circle" size={isMobile ? 20 : 24} color="#033D60" />
              </View>
              <Text 
                style={[
                  styles.metricCardValue,
                  isMobile && { fontSize: 24 }
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit={!isMobile}
              >{stats.attendanceRate.toFixed(1)}%</Text>
              <View style={styles.metricCardFooter}>
                <Text style={styles.metricCardSubtitle}>
                  {stats.totalAttendance} registros
                </Text>
                <View style={styles.metricCardChangeContainer}>
                  {(() => {
                    const change = previousStats.attendanceRate > 0 
                      ? stats.attendanceRate - previousStats.attendanceRate 
                      : 0;
                    const isPositive = change >= 0;
                    return (
                      <>
                        <Text style={[styles.metricCardChange, { color: isPositive ? '#10B981' : '#EF4444' }]}>
                          {change !== 0 ? `${Math.abs(change).toFixed(1)}%` : '0.0%'}
                        </Text>
                        <Ionicons 
                          name={isPositive ? "arrow-up" : "arrow-down"} 
                          size={14} 
                          color={isPositive ? '#10B981' : '#EF4444'} 
                        />
                      </>
                    );
                  })()}
                </View>
              </View>
            </View>

            <View style={isMobile ? styles.metricCardMobile : styles.metricCard}>
              <View style={styles.metricCardHeader}>
                <Text 
                  style={[
                    styles.metricCardTitle, 
                    isMobile && { fontSize: 11 }
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >AULAS AGENDADAS</Text>
                <Ionicons name="calendar" size={isMobile ? 20 : 24} color="#033D60" />
              </View>
              <Text 
                style={[
                  styles.metricCardValue,
                  isMobile && { fontSize: 24 }
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit={!isMobile}
              >{stats.upcomingClasses}</Text>
              <View style={styles.metricCardFooter}>
                <Text style={styles.metricCardSubtitle}>
                  {stats.completedClasses} completadas
                </Text>
                <View style={styles.metricCardChangeContainer}>
                  {(() => {
                    const change = previousStats.upcomingClasses > 0
                      ? ((stats.upcomingClasses - previousStats.upcomingClasses) / previousStats.upcomingClasses) * 100
                      : stats.upcomingClasses > 0 ? 100 : 0;
                    const isPositive = change >= 0;
                    return (
                      <>
                        <Text style={[styles.metricCardChange, { color: isPositive ? '#10B981' : '#EF4444' }]}>
                          {change !== 0 ? `${Math.abs(change).toFixed(1)}%` : '0.0%'}
                        </Text>
                        <Ionicons 
                          name={isPositive ? "arrow-up" : "arrow-down"} 
                          size={14} 
                          color={isPositive ? '#10B981' : '#EF4444'} 
                        />
                      </>
                    );
                  })()}
                </View>
              </View>
            </View>

            <View style={isMobile ? styles.metricCardMobile : styles.metricCard}>
              <View style={styles.metricCardHeader}>
                <Text 
                  style={[
                    styles.metricCardTitle, 
                    isMobile && { fontSize: 11 }
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >TOTAL DE AULAS</Text>
                <Ionicons name="book" size={isMobile ? 20 : 24} color="#033D60" />
              </View>
              <Text 
                style={[
                  styles.metricCardValue,
                  isMobile && { fontSize: 24 }
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit={!isMobile}
              >{stats.totalClasses}</Text>
              <View style={styles.metricCardFooter}>
                <Text style={styles.metricCardSubtitle}>
                  {stats.completedClasses} completadas
                </Text>
                <View style={styles.metricCardChangeContainer}>
                  {(() => {
                    const change = previousStats.totalClasses > 0
                      ? ((stats.totalClasses - previousStats.totalClasses) / previousStats.totalClasses) * 100
                      : stats.totalClasses > 0 ? 100 : 0;
                    const isPositive = change >= 0;
                    // Limitar a 100% para evitar valores absurdos
                    const limitedChange = Math.min(Math.abs(change), 100);
                    return (
                      <>
                        <Text style={[styles.metricCardChange, { color: isPositive ? '#10B981' : '#EF4444' }]}>
                          {change !== 0 ? `${limitedChange.toFixed(1)}%` : '0.0%'}
                        </Text>
                        <Ionicons 
                          name={isPositive ? "arrow-up" : "arrow-down"} 
                          size={14} 
                          color={isPositive ? '#10B981' : '#EF4444'} 
                        />
                      </>
                    );
                  })()}
                </View>
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

            <View style={[styles.analyticsCard, isMobile && styles.analyticsCardMobile]}>
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

            <View style={[styles.analyticsCard, isMobile && styles.analyticsCardMobile]}>
              <Text style={styles.analyticsCardTitle}>AULAS POR STATUS</Text>
              <View style={styles.analyticsContent}>
                <View style={styles.genderChartWrapper}>
                  {/* Pie Chart */}
                  <View style={styles.donutChartContainer}>
                    <PieChart
                      completed={stats.completedClasses}
                      scheduled={stats.upcomingClasses}
                      total={stats.totalClasses}
                    />
                    <View style={styles.donutChartCenter}>
                      <Text style={styles.donutChartTotal}>{stats.totalClasses}</Text>
                      <Text style={styles.donutChartLabel}>Total de Aulas</Text>
                    </View>
                  </View>
                  
                  {/* Legend */}
                  <View style={styles.genderChartLegend}>
                    <View style={styles.genderChartItem}>
                      <View style={styles.genderChartHeader}>
                        <View style={[styles.genderChartDot, { backgroundColor: '#10B981' }]} />
                        <Text style={styles.genderChartLabel}>Completadas</Text>
                      </View>
                      <View style={styles.genderChartStats}>
                        <Text style={styles.genderChartValue}>{stats.completedClasses}</Text>
                        {stats.totalClasses > 0 && (
                          <Text style={styles.genderChartPercentage}>
                            {Math.round((stats.completedClasses / stats.totalClasses) * 100)}% do total
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.genderChartDivider} />
                    
                    <View style={styles.genderChartItem}>
                      <View style={styles.genderChartHeader}>
                        <View style={[styles.genderChartDot, { backgroundColor: '#F59E0B' }]} />
                        <Text style={styles.genderChartLabel}>Agendadas</Text>
                      </View>
                      <View style={styles.genderChartStats}>
                        <Text style={styles.genderChartValue}>{stats.upcomingClasses}</Text>
                        {stats.totalClasses > 0 && (
                          <Text style={styles.genderChartPercentage}>
                            {Math.round((stats.upcomingClasses / stats.totalClasses) * 100)}% do total
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.genderChartSummary}>
                      <View style={styles.genderChartSummaryItem}>
                        <Text style={styles.genderChartSummaryLabel}>Taxa de Conclusão</Text>
                        <Text style={styles.genderChartSummaryValue}>
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

            <View style={[styles.activitiesCard, isMobile && styles.activitiesCardMobile]}>
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
      </View>
    </AdminLayout>
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
  dashboardContainer: {
    width: '100%',
    flex: 1,
    minWidth: 0,
    maxWidth: '100%',
    paddingHorizontal: spacing.lg,
    marginHorizontal: 0,
    alignSelf: 'stretch',
    minHeight: 0,
  },
  dashboardContainerMobile: {
    paddingHorizontal: spacing.md,
    minHeight: 'auto',
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
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    marginHorizontal: 0,
    paddingHorizontal: 0,
    marginLeft: 0,
    marginRight: 0,
    alignSelf: 'stretch',
    flexShrink: 0,
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
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: spacing.md,
    alignSelf: 'stretch',
    overflow: 'visible',
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
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    width: '100%',
    minWidth: 0,
  },
  metricCardTitle: {
    fontSize: isWeb ? 13 : 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flexShrink: 1,
    flex: 1,
  },
  metricCardTitleMobile: {
    fontSize: 11,
  },
  metricCardValue: {
    fontSize: isWeb ? 36 : 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
    flexShrink: 0,
    minWidth: 0,
  },
  metricCardValueMobile: {
    fontSize: 24,
  },
  metricCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    minWidth: 0,
    flexWrap: 'wrap',
  },
  metricCardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  metricCardChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricCardChange: {
    fontSize: 14,
    fontWeight: '600',
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
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    marginHorizontal: 0,
    paddingHorizontal: 0,
    alignSelf: 'stretch',
    flexShrink: 0,
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
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    marginBottom: spacing.md,
    overflow: 'hidden',
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
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
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
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
  },
  analyticsProgressItemLast: {
    marginBottom: 0,
    paddingBottom: 0,
  },
  classStatusWrapper: {
    flexDirection: isWeb ? 'row' : 'column',
    alignItems: isWeb ? 'flex-start' : 'center',
    justifyContent: 'space-between',
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    gap: spacing.lg,
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
  classStatusChart: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: isWeb ? 'auto' : '100%',
    maxWidth: '100%',
    alignSelf: 'center',
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
    flex: isWeb ? 1 : 0,
    gap: spacing.md,
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    paddingHorizontal: 0,
    marginHorizontal: 0,
    ...(isWeb ? { paddingLeft: spacing.md } : { paddingTop: spacing.md }),
  },
  classStatusLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
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
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
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
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
  },
  classStatusSummaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    minWidth: 0,
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
    width: '100%',
    minWidth: 0,
  },
  analyticsProgressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    flexShrink: 1,
    flex: 1,
    minWidth: 0,
  },
  analyticsProgressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flexShrink: 0,
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
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    marginHorizontal: 0,
    paddingHorizontal: 0,
    alignSelf: 'stretch',
    flexShrink: 0,
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
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    marginBottom: spacing.md,
    overflow: 'hidden',
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
