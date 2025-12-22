/**
 * Tela de relatórios
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { AdminLayout, EmptyState, DashboardCard } from '@/components/common';
import { supabase } from '@/api/supabase';
import { spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { exportToPDF, printContent } from '@/utils/pdfExport';

interface Report {
  id: string;
  title: string;
  report_type: string;
  parameters: any;
  regional: string;
  local: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface AttendanceData {
  student_name: string;
  class_title: string;
  class_date: string;
  is_present: boolean;
  notes: string | null;
}

export const ReportsScreen: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const isMobile = screenWidth < 768;

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

  // Definir título da página na web quando a tela recebe foco
  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.title = 'Relatórios | CCB';
      }
    }, [])
  );

  // Também definir no mount para garantir
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Relatórios | CCB';
    }
  }, []);

  // Carregar relatórios
  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Carregando relatórios...');
      const { data, error } = await supabase
        .from('musicalizacao_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar relatórios:', error);
        throw error;
      }
      
      console.log('Relatórios carregados:', data?.length || 0, data);
      setReports(data || []);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Carregar dados do relatório selecionado
  const loadReportData = useCallback(async (report: Report) => {
    try {
      if (report.report_type === 'attendance') {
        // Buscar dados de presença para o período do relatório
        const { data: attendanceData, error } = await supabase
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
          .gte('recorded_at', report.start_date)
          .lte('recorded_at', report.end_date)
          .order('recorded_at', { ascending: false });

        if (error) throw error;

        const formattedData = (attendanceData || []).map((item: any) => ({
          student_name: item.student?.full_name || 'Aluno não encontrado',
          class_title: item.class?.title || 'Aula não encontrada',
          class_date: item.class?.class_date || '',
          is_present: item.is_present,
          notes: item.notes,
        }));

        setReportData({
          type: 'attendance',
          title: report.title,
          period: `${new Date(report.start_date).toLocaleDateString('pt-BR')} a ${new Date(report.end_date).toLocaleDateString('pt-BR')}`,
          regional: report.regional,
          local: report.local,
          data: formattedData,
        });
      } else if (report.report_type === 'administrative') {
        // Buscar dados administrativos
        const { data: studentsData } = await supabase
          .from('musicalizacao_students')
          .select('*')
          .eq('regional', report.regional)
          .order('full_name', { ascending: true });

        const { data: classesData } = await supabase
          .from('musicalizacao_classes')
          .select('*')
          .eq('regional', report.regional)
          .gte('class_date', report.start_date)
          .lte('class_date', report.end_date);

        setReportData({
          type: 'administrative',
          title: report.title,
          period: `${new Date(report.start_date).toLocaleDateString('pt-BR')} a ${new Date(report.end_date).toLocaleDateString('pt-BR')}`,
          regional: report.regional,
          students: studentsData || [],
          classes: classesData || [],
        });
      } else if (report.report_type === 'student_progress') {
        // Buscar progresso dos alunos
        const { data: studentsData } = await supabase
          .from('musicalizacao_students')
          .select('*')
          .eq('local', report.local || '')
          .order('full_name', { ascending: true });

        const { data: attendanceData } = await supabase
          .from('musicalizacao_attendance')
          .select(`
            *,
            class:musicalizacao_classes!class_id (
              title,
              class_date
            ),
            student:musicalizacao_students!student_id (
              full_name
            )
          `)
          .gte('recorded_at', report.start_date)
          .lte('recorded_at', report.end_date);

        setReportData({
          type: 'student_progress',
          title: report.title,
          period: `${new Date(report.start_date).toLocaleDateString('pt-BR')} a ${new Date(report.end_date).toLocaleDateString('pt-BR')}`,
          local: report.local,
          students: studentsData || [],
          attendance: attendanceData || [],
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    }
  }, []);

  const handleViewReport = async (report: Report) => {
    setSelectedReport(report);
    await loadReportData(report);
    setShowReportModal(true);
  };

  const handleExportPDF = () => {
    if (Platform.OS === 'web') {
      exportToPDF('report-content', `${selectedReport?.title || 'relatorio'}.pdf`);
    }
  };

  const handlePrint = () => {
    if (Platform.OS === 'web') {
      printContent('report-content');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <AdminLayout title="Relatórios" currentScreen="Reports" showPageTitle={false}>
      {/* Título da Página */}
      <View style={styles.headerContainer}>
        <Text style={styles.pageTitle}>Relatórios</Text>
        {!loading && reports.length > 0 && (
          <Text style={styles.reportsCount}>
            {reports.length} relatório{reports.length !== 1 ? 's' : ''} encontrado{reports.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {/* Cards de Dashboard */}
      <View style={styles.dashboardCards}>
        <View style={[styles.dashboardCardsRow, isMobile && styles.dashboardCardsRowMobile]}>
          <View style={[styles.dashboardCardContainer, isMobile && styles.dashboardCardContainerMobile]}>
            <DashboardCard
              title="Relatórios Gerados"
              icon="document-text"
              iconColor="#033D60"
              statusTitle={`${reports.length} relatório${reports.length !== 1 ? 's' : ''} gerado${reports.length !== 1 ? 's' : ''}`}
              statusDescription="Relatórios disponíveis no sistema"
              statusType="info"
            />
          </View>
          <View style={[styles.dashboardCardContainer, isMobile && styles.dashboardCardContainerMobile]}>
            <DashboardCard
              title="Relatórios de Presença"
              icon="checkmark-circle"
              iconColor="#033D60"
              statusTitle={
                reports.filter((r) => r.report_type === 'attendance').length > 0
                  ? `${reports.filter((r) => r.report_type === 'attendance').length} relatório${reports.filter((r) => r.report_type === 'attendance').length !== 1 ? 's' : ''} de presença`
                  : 'Nenhum relatório de presença'
              }
              statusDescription="Relatórios de frequência dos alunos"
              statusType={
                reports.filter((r) => r.report_type === 'attendance').length > 0
                  ? 'success'
                  : 'info'
              }
            />
          </View>
        </View>
      </View>

      {/* Conteúdo Principal */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando relatórios...</Text>
        </View>
      ) : reports.length === 0 ? (
        <EmptyState
          title="Nenhum relatório disponível"
          message="Gere relatórios de presença e administrativos aqui."
        />
      ) : (
        <View style={styles.reportsContainer}>
          <ScrollView style={styles.reportsList} showsVerticalScrollIndicator={false}>
            {reports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={styles.reportCard}
                onPress={() => handleViewReport(report)}
              >
                <View style={styles.reportCardHeader}>
                  <View style={styles.reportCardTitleContainer}>
                    <Ionicons
                      name={
                        report.report_type === 'attendance'
                          ? 'checkmark-circle'
                          : report.report_type === 'administrative'
                          ? 'document-text'
                          : 'trending-up'
                      }
                      size={24}
                      color="#033D60"
                    />
                    <View style={styles.reportCardInfo}>
                      <Text style={styles.reportCardTitle}>{report.title}</Text>
                      <Text style={styles.reportCardSubtitle}>
                        {report.report_type === 'attendance'
                          ? 'Relatório de Presença'
                          : report.report_type === 'administrative'
                          ? 'Relatório Administrativo'
                          : 'Progresso dos Alunos'}
                        {' • '}
                        {report.regional}
                        {report.local && ` • ${report.local}`}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
                <View style={styles.reportCardFooter}>
                  <Text style={styles.reportCardDate}>
                    {formatDate(report.start_date)} - {formatDate(report.end_date)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Modal de Visualização do Relatório */}
      <Modal
        visible={showReportModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={[
              styles.modalHeaderTop,
              isMobile && {
                flexDirection: 'column',
                alignItems: 'stretch',
              }
            ]}>
              <View style={[
                styles.modalHeaderLeft,
                isMobile && {
                  flex: 0,
                  width: '100%',
                }
              ]}>
                <Text style={styles.modalTitle}>{selectedReport?.title || 'Relatório'}</Text>
                <Text style={styles.modalSubtitle}>header small text goes here...</Text>
              </View>
              <View style={[
                styles.modalHeaderRight,
                isMobile && {
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  width: '100%',
                }
              ]}>
                {Platform.OS === 'web' && (
                  <>
                    <TouchableOpacity
                      style={styles.actionButtonPDF}
                      onPress={handleExportPDF}
                    >
                      <Ionicons name="document-text" size={18} color="#EF4444" />
                      <Text style={styles.actionButtonTextPDF}>Exportar PDF</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButtonPrint}
                      onPress={handlePrint}
                    >
                      <Ionicons name="print" size={18} color="#1F2937" />
                      <Text style={styles.actionButtonTextPrint}>Imprimir</Text>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowReportModal(false)}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <ScrollView 
            style={styles.modalContentScroll}
            contentContainerStyle={styles.modalContent}
          >
            {reportData && (
              <View
                {...(Platform.OS === 'web' ? { id: 'report-content' } : {})}
                style={styles.reportContent}
              >
                {/* Cabeçalho do Relatório - Estilo Invoice */}
                <View style={styles.reportHeader}>
                  <View style={styles.reportHeaderMain}>
                    <Text style={styles.reportCompanyName}>CONGREGAÇÃO CRISTÃ NO BRASIL</Text>
                    <View style={styles.reportHeaderRight}>
                      <View style={styles.reportInfoBox}>
                        <Text style={styles.reportInfoLabel}>Relatório / {reportData.period}</Text>
                        <Text style={styles.reportInfoValue}>
                          {new Date().toLocaleDateString('pt-BR', { 
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </Text>
                        <Text style={styles.reportInfoNumber}>
                          #{selectedReport?.id.substring(0, 8).toUpperCase() || 'RELATORIO'}
                        </Text>
                        <Text style={styles.reportInfoType}>
                          {reportData.type === 'attendance' 
                            ? 'Relatório de Presença' 
                            : reportData.type === 'administrative'
                            ? 'Relatório Administrativo'
                            : 'Progresso dos Alunos'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.reportFromTo}>
                    <View style={styles.reportFrom}>
                      <Text style={styles.reportFromToLabel}>from</Text>
                      <Text style={styles.reportFromToTitle}>CONGREGAÇÃO CRISTÃ NO BRASIL</Text>
                      <Text style={styles.reportFromToText}>Sistema de Musicalização Infantil</Text>
                      <Text style={styles.reportFromToText}>
                        {reportData.regional || 'Regional'}
                      </Text>
                      {reportData.local && (
                        <Text style={styles.reportFromToText}>{reportData.local}</Text>
                      )}
                    </View>
                    
                    <View style={styles.reportTo}>
                      <Text style={styles.reportFromToLabel}>to</Text>
                      <Text style={styles.reportFromToTitle}>Relatório Gerado</Text>
                      <Text style={styles.reportFromToText}>
                        Período: {reportData.period}
                      </Text>
                      {reportData.regional && (
                        <Text style={styles.reportFromToText}>
                          Regional: {reportData.regional}
                        </Text>
                      )}
                      {reportData.local && (
                        <Text style={styles.reportFromToText}>
                          Local: {reportData.local}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* Conteúdo do Relatório de Presença */}
                {reportData.type === 'attendance' && (
                  <View style={styles.reportBody}>
                    <View style={styles.tableContainer}>
                      <View style={[
                        styles.tableHeader,
                        isMobile && {
                          flexDirection: 'column',
                        }
                      ]}>
                        <Text style={[styles.tableHeaderCell, styles.tableCellStudent, isMobile && { width: '100%' }]}>Aluno</Text>
                        <Text style={[styles.tableHeaderCell, styles.tableCellClass, isMobile && { width: '100%' }]}>Aula</Text>
                        <Text style={[styles.tableHeaderCell, styles.tableCellDate, isMobile && { width: '100%' }]}>Data</Text>
                        <Text style={[styles.tableHeaderCell, styles.tableCellStatus, isMobile && { width: '100%' }]}>Status</Text>
                        <Text style={[styles.tableHeaderCell, styles.tableCellNotes, isMobile && { width: '100%' }]}>Observações</Text>
                      </View>
                      {reportData.data && reportData.data.length > 0 ? (
                        reportData.data.map((item: AttendanceData, index: number) => (
                          <View key={index} style={[
                            styles.tableRow,
                            isMobile && {
                              flexDirection: 'column',
                            }
                          ]}>
                            <Text style={[styles.tableCell, styles.tableCellStudent, isMobile && { width: '100%' }]}>
                              {item.student_name}
                            </Text>
                            <Text style={[styles.tableCell, styles.tableCellClass, isMobile && { width: '100%' }]}>
                              {item.class_title}
                            </Text>
                            <Text style={[styles.tableCell, styles.tableCellDate, isMobile && { width: '100%' }]}>
                              {formatDate(item.class_date)}
                            </Text>
                            <Text
                              style={[
                                styles.tableCell,
                                styles.tableCellStatus,
                                { color: item.is_present ? '#10B981' : '#ed5565' },
                                isMobile && { width: '100%' },
                              ]}
                            >
                              {item.is_present ? 'Presente' : 'Falta'}
                            </Text>
                            <Text style={[styles.tableCell, styles.tableCellNotes, isMobile && { width: '100%' }]}>
                              {item.notes || '-'}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <View style={styles.tableRow}>
                          <Text style={styles.tableEmptyCell}>Nenhum registro encontrado</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.reportSummary}>
                      <View style={styles.reportSummaryLeft}>
                        <View style={{ marginBottom: spacing.md }}>
                          <Text style={styles.reportSummaryLabel}>SUBTOTAL</Text>
                          <Text style={styles.reportSummaryValue}>
                            {reportData.data?.length || 0} registro{reportData.data?.length !== 1 ? 's' : ''}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.reportSummaryLabel}>Presentes</Text>
                          <Text style={styles.reportSummaryValue}>
                            {reportData.data?.filter((d: AttendanceData) => d.is_present).length || 0}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.reportSummaryRight}>
                        <View style={styles.reportSummaryTotal}>
                          <Text style={styles.reportSummaryTotalLabel}>TOTAL</Text>
                          <Text style={styles.reportSummaryTotalValue}>
                            {reportData.data?.length || 0}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                {/* Conteúdo do Relatório Administrativo */}
                {reportData.type === 'administrative' && (
                  <View style={styles.reportBody}>
                    <Text style={styles.reportSectionTitle}>Resumo Administrativo</Text>
                    <View style={[
                      styles.summaryCards,
                      isMobile && {
                        flexDirection: 'column',
                      }
                    ]}>
                      <View style={styles.summaryCard}>
                        <Text style={styles.summaryCardTitle}>Total de Alunos</Text>
                        <Text style={styles.summaryCardValue}>
                          {reportData.students?.length || 0}
                        </Text>
                      </View>
                      <View style={styles.summaryCard}>
                        <Text style={styles.summaryCardTitle}>Total de Aulas</Text>
                        <Text style={styles.summaryCardValue}>
                          {reportData.classes?.length || 0}
                        </Text>
                      </View>
                      <View style={styles.summaryCard}>
                        <Text style={styles.summaryCardTitle}>Aulas Completadas</Text>
                        <Text style={styles.summaryCardValue}>
                          {reportData.classes?.filter((c: any) => c.status === 'completed').length ||
                            0}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Conteúdo do Relatório de Progresso */}
                {reportData.type === 'student_progress' && (
                  <View style={styles.reportBody}>
                    <Text style={styles.reportSectionTitle}>Progresso dos Alunos</Text>
                    <View style={styles.tableContainer}>
                      <View style={[
                        styles.tableHeader,
                        isMobile && {
                          flexDirection: 'column',
                        }
                      ]}>
                        <Text style={[styles.tableHeaderCell, styles.tableCellStudent, isMobile && { width: '100%' }]}>Aluno</Text>
                        <Text style={[styles.tableHeaderCell, styles.tableCellProgress, isMobile && { width: '100%' }]}>
                          Aulas Participadas
                        </Text>
                        <Text style={[styles.tableHeaderCell, styles.tableCellProgress, isMobile && { width: '100%' }]}>
                          Taxa de Presença
                        </Text>
                      </View>
                      {reportData.students && reportData.students.length > 0 ? (
                        reportData.students.map((student: any) => {
                          const studentAttendance = reportData.attendance?.filter(
                            (a: any) => a.student?.full_name === student.full_name
                          ) || [];
                          const presentCount = studentAttendance.filter((a: any) => a.is_present)
                            .length;
                          const totalCount = studentAttendance.length;
                          const attendanceRate =
                            totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : '0';

                          return (
                            <View key={student.id} style={[
                              styles.tableRow,
                              isMobile && {
                                flexDirection: 'column',
                              }
                            ]}>
                              <Text style={[styles.tableCell, styles.tableCellStudent, isMobile && { width: '100%' }]}>
                                {student.full_name}
                              </Text>
                              <Text style={[styles.tableCell, styles.tableCellProgress, isMobile && { width: '100%' }]}>
                                {presentCount} / {totalCount}
                              </Text>
                              <Text style={[styles.tableCell, styles.tableCellProgress, isMobile && { width: '100%' }]}>
                                {attendanceRate}%
                              </Text>
                            </View>
                          );
                        })
                      ) : (
                        <View style={styles.tableRow}>
                          <Text style={styles.tableEmptyCell}>Nenhum aluno encontrado</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Rodapé do Relatório */}
                <View style={styles.reportFooter}>
                  <Text style={styles.reportFooterText}>
                    Este relatório foi gerado automaticamente pelo Sistema de Musicalização Infantil
                    CCB
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: spacing.xl,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.xs,
  },
  reportsCount: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: spacing.xs,
  },
  dashboardCards: {
    marginBottom: spacing.xl,
  },
  dashboardCardsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
    width: '100%',
    flexWrap: 'wrap',
  },
  dashboardCardsRowMobile: {
    flexDirection: 'column',
    gap: spacing.md,
  },
  dashboardCardContainer: {
    flex: 1,
    minWidth: 280,
    maxWidth: '100%',
  },
  dashboardCardContainerMobile: {
    flex: 0,
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  reportsContainer: {
    flex: 1,
    width: '100%',
  },
  reportsList: {
    flex: 1,
    width: '100%',
  },
  reportCard: {
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
  reportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reportCardTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  reportCardInfo: {
    flex: 1,
  },
  reportCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: spacing.xs,
  },
  reportCardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  reportCardFooter: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  reportCardDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    ...(Platform.OS === 'web' ? { position: 'sticky', top: 0, zIndex: 10 } : {}),
  },
  modalHeaderTop: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: Platform.OS === 'web' ? 'flex-start' : 'stretch',
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalHeaderLeft: {
    flex: Platform.OS === 'web' ? 1 : 0,
    width: Platform.OS === 'web' ? 'auto' : '100%',
  },
  modalHeaderRight: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
    gap: spacing.md,
    width: Platform.OS === 'web' ? 'auto' : '100%',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  actionButtonPDF: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    } : {}),
  },
  actionButtonTextPDF: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },
  actionButtonPrint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    } : {}),
  },
  actionButtonTextPrint: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalContentScroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' ? {
      alignItems: 'center',
      padding: 0,
    } : {
      padding: spacing.xl,
    }),
  },
  reportContent: {
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' ? { 
      width: '100%',
      maxWidth: 900,
      margin: '0 auto',
      padding: spacing.xl * 2,
      paddingLeft: spacing.xl * 2,
      paddingRight: spacing.xl * 2,
    } : {
      width: '100%',
      padding: spacing.lg,
    }),
  },
  reportHeader: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.xl,
    width: '100%',
    ...(Platform.OS === 'web' ? { alignSelf: 'center' } : {}),
  },
  reportHeaderMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
    width: '100%',
  },
  reportCompanyName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    ...(Platform.OS === 'web' ? { 
      maxWidth: '60%',
      paddingRight: spacing.lg,
    } : {}),
  },
  reportHeaderRight: {
    alignItems: 'flex-end',
    ...(Platform.OS === 'web' ? { 
      flex: 1,
      maxWidth: '40%',
      paddingLeft: spacing.lg,
    } : {}),
  },
  reportInfoBox: {
    alignItems: 'flex-end',
  },
  reportInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: spacing.xs,
  },
  reportInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: spacing.xs,
  },
  reportInfoNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: spacing.xs,
  },
  reportInfoType: {
    fontSize: 14,
    color: '#6B7280',
  },
  reportFromTo: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    width: '100%',
    gap: spacing.lg,
    ...(Platform.OS === 'web' ? { alignSelf: 'center' } : {}),
  },
  reportFrom: {
    flex: Platform.OS === 'web' ? 1 : 0,
    width: Platform.OS === 'web' ? 'auto' : '100%',
    ...(Platform.OS === 'web' ? { 
      maxWidth: '48%',
      paddingRight: spacing.lg,
    } : {}),
  },
  reportTo: {
    flex: Platform.OS === 'web' ? 1 : 0,
    width: Platform.OS === 'web' ? 'auto' : '100%',
    ...(Platform.OS === 'web' ? { 
      maxWidth: '48%',
      paddingLeft: spacing.lg,
    } : {}),
  },
  reportFromToLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  reportFromToTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.xs,
  },
  reportFromToText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  reportBody: {
    marginBottom: spacing.xl,
  },
  reportSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: spacing.lg,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: spacing.md,
  },
  tableContainer: {
    ...(Platform.OS === 'web' ? { overflowX: 'auto' } : {}),
  },
  tableHeader: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    backgroundColor: '#F9FAFB',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    ...(Platform.OS === 'web' ? { display: 'table-header-group' } : {}),
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    gap: spacing.xs,
    ...(Platform.OS === 'web' ? { display: 'table-row' } : {}),
  },
  tableCell: {
    fontSize: 14,
    color: '#1F2937',
  },
  tableCellStudent: {
    flex: Platform.OS === 'web' ? 2 : 0,
    width: Platform.OS === 'web' ? '30%' : '100%',
  },
  tableCellClass: {
    flex: Platform.OS === 'web' ? 2 : 0,
    width: Platform.OS === 'web' ? '25%' : '100%',
  },
  tableCellDate: {
    flex: Platform.OS === 'web' ? 1 : 0,
    width: Platform.OS === 'web' ? '15%' : '100%',
  },
  tableCellStatus: {
    flex: Platform.OS === 'web' ? 1 : 0,
    fontWeight: '600',
    width: Platform.OS === 'web' ? '10%' : '100%',
  },
  tableCellNotes: {
    flex: Platform.OS === 'web' ? 2 : 0,
    width: Platform.OS === 'web' ? '20%' : '100%',
  },
  tableCellProgress: {
    flex: Platform.OS === 'web' ? 1 : 0,
    width: Platform.OS === 'web' ? '20%' : '100%',
  },
  tableEmptyCell: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: spacing.lg,
    flex: 1,
  },
  reportSummary: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  reportSummaryLeft: {
    flex: 1,
  },
  reportSummaryRight: {
    alignItems: 'flex-end',
  },
  reportSummaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  reportSummaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  reportSummaryTotal: {
    backgroundColor: '#1F2937',
    padding: spacing.lg,
    borderRadius: 4,
    minWidth: 200,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    } : {}),
  },
  reportSummaryTotalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  reportSummaryTotalValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reportSummaryText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  summaryCards: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryCardTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: spacing.sm,
  },
  summaryCardValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#033D60',
  },
  reportFooter: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  reportFooterText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

