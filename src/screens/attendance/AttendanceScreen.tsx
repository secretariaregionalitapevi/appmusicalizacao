/**
 * Tela de Registro de Presença
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Platform, ScrollView, TouchableOpacity } from 'react-native';
import { AdminLayout, EmptyState, DashboardCard } from '@/components/common';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '@/theme';
import { supabase } from '@/api/supabase';
import { Ionicons } from '@expo/vector-icons';

interface AttendanceRecord {
  id: string;
  class_id: string;
  student_id: string;
  is_present: boolean;
  notes: string | null;
  recorded_at: string;
  class?: {
    title: string;
    class_date: string;
    start_time: string;
  };
  student?: {
    full_name: string;
  };
}

export const AttendanceScreen: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [pendingClasses, setPendingClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Definir título da página na web quando a tela recebe foco
  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.title = 'Registro de Presença | CCB';
      }
    }, [])
  );

  // Também definir no mount para garantir
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Registro de Presença | CCB';
    }
  }, []);

  // Carregar registros de presença
  const loadAttendanceRecords = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar registros de presença com informações da aula e do aluno
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('musicalizacao_attendance')
        .select(`
          *,
          class:musicalizacao_classes!class_id (
            title,
            class_date,
            start_time
          ),
          student:musicalizacao_students!student_id (
            full_name
          )
        `)
        .order('recorded_at', { ascending: false })
        .limit(50);

      if (attendanceError) throw attendanceError;

      // Buscar aulas completadas sem registro de presença
      const { data: completedClasses, error: classesError } = await supabase
        .from('musicalizacao_classes')
        .select('*')
        .eq('status', 'completed')
        .order('class_date', { ascending: false })
        .limit(20);

      if (classesError) throw classesError;

      // Verificar quais aulas completadas não têm registros de presença
      if (completedClasses) {
        const { data: allAttendance } = await supabase
          .from('musicalizacao_attendance')
          .select('class_id')
          .in('class_id', completedClasses.map(c => c.id));

        const classesWithAttendance = new Set(
          allAttendance?.map(a => a.class_id) || []
        );

        const pending = completedClasses.filter(
          c => !classesWithAttendance.has(c.id)
        );

        setPendingClasses(pending);
      }

      setAttendanceRecords(attendanceData || []);
    } catch (error) {
      console.error('Erro ao carregar registros de presença:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttendanceRecords();
  }, [loadAttendanceRecords]);

  return (
    <AdminLayout title="Registro de Presença" currentScreen="Attendance" showPageTitle={false}>
      {/* Título da Página */}
      <Text style={styles.pageTitle}>Registro de Presença</Text>

      {/* Cards de Dashboard */}
      <View style={styles.dashboardCards}>
        <View style={styles.dashboardCardsRow}>
          <View style={styles.dashboardCardContainer}>
            <DashboardCard
              title="Presenças Registradas"
              icon="checkmark-circle"
              iconColor="#033D60"
              statusTitle={`${attendanceRecords.length} registro${attendanceRecords.length !== 1 ? 's' : ''} do mês`}
              statusDescription="Visualize todas as presenças registradas"
              statusType="success"
            />
          </View>
          <View style={styles.dashboardCardContainer}>
            <DashboardCard
              title="Presenças Pendentes"
              icon="time"
              iconColor="#033D60"
              statusTitle={`${pendingClasses.length} aula${pendingClasses.length !== 1 ? 's' : ''} sem registro`}
              statusDescription="Aulas que ainda precisam ter presença registrada"
              statusType="warning"
            />
          </View>
        </View>
      </View>

      {/* Conteúdo Principal */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando registros...</Text>
        </View>
      ) : attendanceRecords.length === 0 ? (
        <EmptyState
          title="Nenhum registro encontrado"
          message="Os registros de presença aparecerão aqui quando forem cadastrados."
        />
      ) : (
        <ScrollView style={styles.recordsList} showsVerticalScrollIndicator={false}>
          {attendanceRecords.map((record) => (
            <TouchableOpacity key={record.id} style={styles.recordCard}>
              <View style={styles.recordCardHeader}>
                <View style={styles.recordCardTitleContainer}>
                  <Text style={styles.recordCardTitle}>
                    {record.class?.title || 'Aula sem título'}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: record.is_present ? '#10B981' : '#EF4444' },
                    ]}
                  >
                    <Text style={styles.statusBadgeText}>
                      {record.is_present ? 'Presente' : 'Falta'}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.recordCardContent}>
                <View style={styles.recordInfoRow}>
                  <Ionicons name="person-outline" size={16} color="#6B7280" />
                  <Text style={styles.recordInfoText}>
                    {record.student?.full_name || 'Aluno não encontrado'}
                  </Text>
                </View>
                <View style={styles.recordInfoRow}>
                  <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                  <Text style={styles.recordInfoText}>
                    {record.class?.class_date
                      ? new Date(record.class.class_date).toLocaleDateString('pt-BR')
                      : 'Data não informada'}
                    {record.class?.start_time && ` às ${record.class.start_time.substring(0, 5)}`}
                  </Text>
                </View>
                {record.notes && (
                  <View style={styles.recordInfoRow}>
                    <Ionicons name="document-text-outline" size={16} color="#6B7280" />
                    <Text style={styles.recordInfoText}>{record.notes}</Text>
                  </View>
                )}
                <View style={styles.recordInfoRow}>
                  <Ionicons name="time-outline" size={16} color="#6B7280" />
                  <Text style={styles.recordInfoText}>
                    Registrado em {new Date(record.recorded_at).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.xl,
  },
  dashboardCards: {
    marginBottom: spacing.xl,
  },
  dashboardCardsRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  dashboardCardContainer: {
    flex: Platform.OS === 'web' ? 1 : 1,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  recordsList: {
    flex: 1,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...(Platform.OS === 'web'
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
  recordCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  recordCardTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  recordCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recordCardContent: {
    gap: spacing.sm,
  },
  recordInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recordInfoText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
});

