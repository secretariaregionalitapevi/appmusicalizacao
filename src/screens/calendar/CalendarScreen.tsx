/**
 * Tela de Calendário - Visualização de Aulas e Eventos
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminLayout, DashboardCard } from '@/components/common';
import { spacing } from '@/theme';
import { supabase } from '@/api/supabase';

type ViewMode = 'monthly' | 'weekly';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  color: string;
  type: 'class' | 'event' | 'meeting' | 'other';
  description?: string;
}

export const CalendarScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Calendário | CCB';
    }
  }, []);

  // Carregar eventos do banco de dados
  useEffect(() => {
    const loadEvents = async () => {
      try {
        
        // Buscar aulas
        const { data: classesData, error: classesError } = await supabase
          .from('musicalizacao_classes')
          .select('id, title, class_date, status, description')
          .order('class_date', { ascending: true });

        if (classesError) {
          console.error('Erro ao buscar aulas:', classesError);
        }

        const eventsList: CalendarEvent[] = [];

        // Mapear aulas para eventos
        if (classesData) {
          classesData.forEach((classItem) => {
            const classDate = new Date(classItem.class_date);
            let color = '#3B82F6'; // Azul padrão
            let type: 'class' | 'event' | 'meeting' | 'other' = 'class';

            // Definir cor baseado no status
            if (classItem.status === 'completed') {
              color = '#10B981'; // Verde para completadas
            } else if (classItem.status === 'scheduled') {
              color = '#F59E0B'; // Laranja para agendadas
            } else {
              color = '#3B82F6'; // Azul para outras
            }

            eventsList.push({
              id: classItem.id,
              title: classItem.title || 'Aula sem título',
              date: classDate,
              startTime: '14:00',
              endTime: '16:00',
              color,
              type,
              description: classItem.description,
            });
          });
        }

        // Adicionar eventos de exemplo para popular o calendário
        // Usar o mês atual do calendário (currentDate) para que os eventos apareçam no mês visualizado
        const viewMonth = currentDate.getMonth();
        const viewYear = currentDate.getFullYear();

        // Eventos de exemplo com cores diferentes - distribuídos ao longo do mês
        const exampleEvents: CalendarEvent[] = [
          {
            id: 'event-1',
            title: 'Reunião de Coordenação',
            date: new Date(viewYear, viewMonth, 5),
            startTime: '09:00',
            endTime: '10:30',
            color: '#8B5CF6', // Roxo
            type: 'meeting',
          },
          {
            id: 'event-2',
            title: 'Workshop de Musicalização',
            date: new Date(viewYear, viewMonth, 8),
            startTime: '14:00',
            endTime: '17:00',
            color: '#EC4899', // Rosa
            type: 'event',
          },
          {
            id: 'event-3',
            title: 'Avaliação de Alunos',
            date: new Date(viewYear, viewMonth, 12),
            startTime: '10:00',
            endTime: '12:00',
            color: '#EF4444', // Vermelho
            type: 'other',
          },
          {
            id: 'event-4',
            title: 'Ensaio Geral',
            date: new Date(viewYear, viewMonth, 15),
            startTime: '15:00',
            endTime: '17:00',
            color: '#06B6D4', // Ciano
            type: 'event',
          },
          {
            id: 'event-5',
            title: 'Reunião de Pais',
            date: new Date(viewYear, viewMonth, 18),
            startTime: '19:00',
            endTime: '20:30',
            color: '#F97316', // Laranja escuro
            type: 'meeting',
          },
          {
            id: 'event-6',
            title: 'Apresentação Musical',
            date: new Date(viewYear, viewMonth, 22),
            startTime: '18:00',
            endTime: '20:00',
            color: '#84CC16', // Verde limão
            type: 'event',
          },
        ];

        // Combinar eventos do banco com eventos de exemplo
        setEvents([...eventsList, ...exampleEvents]);
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      }
    };

    loadEvents();
  }, [currentDate]);

  const getMonthName = (date: Date) => {
    const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return monthName.charAt(0).toUpperCase() + monthName.slice(1);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, lastDay };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      const daysToAdd = direction === 'next' ? 7 : -7;
      newDate.setDate(prev.getDate() + daysToAdd);
      return newDate;
    });
  };

  const getWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startFormatted = startOfWeek.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
    const endFormatted = endOfWeek.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    return `${startFormatted} - ${endFormatted}`;
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const days: Array<{
      dayName: string;
      dayNumber: string;
      isToday: boolean;
      date: Date;
    }> = [];

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);

      const today = new Date();
      const isToday =
        currentDay.getDate() === today.getDate() &&
        currentDay.getMonth() === today.getMonth() &&
        currentDay.getFullYear() === today.getFullYear();

      days.push({
        dayName: currentDay.toLocaleDateString('pt-BR', { weekday: 'short' }),
        dayNumber: currentDay.getDate().toString().padStart(2, '0'),
        isToday,
        date: currentDay,
      });
    }

    return days;
  };

  const getTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Calcular dias do mês anterior para preencher a primeira semana
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
  const daysFromPrevMonth = startingDayOfWeek;

  // Calcular quantos dias do próximo mês precisamos
  const totalCells = startingDayOfWeek + daysInMonth;
  const weeksNeeded = Math.ceil(totalCells / 7);
  const daysFromNextMonth = weeksNeeded * 7 - totalCells;

  const weekDaysFull = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  // Função para obter eventos de um dia específico
  const getEventsForDay = (day: number, month: number, year: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      );
    });
  };

  const renderCalendarGrid = () => {
    const cells: JSX.Element[] = [];
    const today = new Date();

    // Dias do mês anterior
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      cells.push(
        <View key={`prev-${day}`} style={[styles.calendarCell, styles.calendarCellOtherMonth]}>
          <Text style={styles.calendarCellTextOtherMonth}>{day}</Text>
        </View>
      );
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentDay = 
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();
      
      const dayEvents = getEventsForDay(day, currentMonth, currentYear);
      
      cells.push(
        <TouchableOpacity
          key={`current-${day}`}
          style={[
            styles.calendarCell,
            isCurrentDay && styles.calendarCellToday,
          ]}
        >
          <Text
            style={[
              styles.calendarCellText,
              isCurrentDay && styles.calendarCellTextToday,
            ]}
          >
            {day.toString().padStart(2, '0')}
          </Text>
          
          {/* Renderizar eventos do dia */}
          <View style={styles.calendarCellEvents}>
            {dayEvents.slice(0, 3).map((event, index) => (
              <View
                key={event.id}
                style={[
                  styles.calendarEvent,
                  { backgroundColor: event.color },
                  index >= 2 && dayEvents.length > 3 && styles.calendarEventMore,
                ]}
              >
                {index < 2 ? (
                  <Text style={styles.calendarEventText} numberOfLines={1}>
                    {event.startTime} {event.title}
                  </Text>
                ) : (
                  <Text style={styles.calendarEventText}>
                    +{dayEvents.length - 2} mais
                  </Text>
                )}
              </View>
            ))}
          </View>
        </TouchableOpacity>
      );
    }

    // Dias do próximo mês
    for (let day = 1; day <= daysFromNextMonth; day++) {
      cells.push(
        <View key={`next-${day}`} style={[styles.calendarCell, styles.calendarCellOtherMonth]}>
          <Text style={styles.calendarCellTextOtherMonth}>{day}</Text>
        </View>
      );
    }

    return cells;
  };

  return (
    <AdminLayout title="Calendário" currentScreen="Calendar" showPageTitle={false}>
      {/* Título */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Calendário</Text>
      </View>

      {/* Cards de Dashboard */}
      <View style={styles.dashboardCards}>
        <View style={styles.dashboardCardsRow}>
          <View style={styles.dashboardCardContainer}>
            <DashboardCard
              title="Aulas do Mês"
              icon="calendar"
              iconColor="#3B82F6"
              statusTitle={`${currentDate.toLocaleDateString('pt-BR', { month: 'long' })} ${currentYear}`}
              statusDescription="Visualize todas as aulas agendadas"
              statusType="info"
            />
          </View>
          <View style={styles.dashboardCardContainer}>
            <DashboardCard
              title="Próximas Aulas"
              icon="time"
              iconColor="#10B981"
              statusTitle="Aulas desta semana"
              statusDescription="Aulas programadas para os próximos 7 dias"
              statusType="success"
            />
          </View>
        </View>
      </View>

      {/* Controles do Calendário */}
      <View style={styles.calendarControls}>
        <View style={styles.calendarControlsLeft}>
          <Text style={styles.monthYearText}>
            {getMonthName(currentDate)}
          </Text>
          <View style={styles.navButtons}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth('prev')}
            >
              <Ionicons name="chevron-back" size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth('next')}
            >
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <Text style={styles.todayButtonText}>Hoje</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.calendarControlsRight}>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === 'monthly' && styles.viewToggleButtonActive,
              ]}
              onPress={() => setViewMode('monthly')}
            >
              <Text
                style={[
                  styles.viewToggleText,
                  viewMode === 'monthly' && styles.viewToggleTextActive,
                ]}
              >
                Mensal
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === 'weekly' && styles.viewToggleButtonActive,
              ]}
              onPress={() => setViewMode('weekly')}
            >
              <Text
                style={[
                  styles.viewToggleText,
                  viewMode === 'weekly' && styles.viewToggleTextActive,
                ]}
              >
                Semanal
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <Text style={styles.filterButtonText}>Filtrar por</Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid do Calendário */}
      {viewMode === 'monthly' ? (
        <View style={styles.calendarWrapper}>
          {/* Sidebar com eventos */}
          <View style={styles.eventsSidebar}>
            <Text style={styles.eventsSidebarTitle}>Eventos</Text>
            
            {/* Eventos por tipo */}
            <View style={styles.eventsSection}>
              <Text style={styles.eventsSectionTitle}>Aulas</Text>
              {events
                .filter((e) => e.type === 'class')
                .slice(0, 5)
                .map((event) => (
                  <View key={event.id} style={styles.eventItem}>
                    <View style={[styles.eventDot, { backgroundColor: event.color }]} />
                    <View style={styles.eventItemContent}>
                      <Text style={styles.eventItemTitle} numberOfLines={1}>
                        {event.title}
                      </Text>
                      <Text style={styles.eventItemDate}>
                        {event.date.toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </Text>
                    </View>
                  </View>
                ))}
            </View>

            <View style={styles.eventsSection}>
              <Text style={styles.eventsSectionTitle}>Outros Eventos</Text>
              {events
                .filter((e) => e.type !== 'class')
                .slice(0, 5)
                .map((event) => (
                  <View key={event.id} style={styles.eventItem}>
                    <View style={[styles.eventDot, { backgroundColor: event.color }]} />
                    <View style={styles.eventItemContent}>
                      <Text style={styles.eventItemTitle} numberOfLines={1}>
                        {event.title}
                      </Text>
                      <Text style={styles.eventItemDate}>
                        {event.date.toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </Text>
                    </View>
                  </View>
                ))}
            </View>
          </View>

          {/* Calendário principal */}
          <View style={styles.calendarContainer}>
            {/* Cabeçalho dos dias da semana */}
            <View style={styles.calendarHeader}>
              {weekDaysFull.map((day, index) => (
                <View key={index} style={styles.calendarHeaderCell}>
                  <Text style={styles.calendarHeaderText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Grid do calendário */}
            <View style={styles.calendarGrid}>{renderCalendarGrid()}</View>
          </View>
        </View>
      ) : (
        <View style={styles.calendarContainer}>
          {/* Visualização Semanal */}
          <View style={styles.weeklyHeader}>
            <Text style={styles.weeklyHeaderText}>
              {getWeekRange(currentDate)}
            </Text>
            <View style={styles.weeklyNavButtons}>
              <TouchableOpacity
                style={styles.weeklyNavButton}
                onPress={() => navigateWeek('prev')}
              >
                <Ionicons name="chevron-back" size={20} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.weeklyNavButton}
                onPress={() => navigateWeek('next')}
              >
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Grid Semanal */}
          <View style={styles.weeklyGrid}>
            {/* Cabeçalho dos dias */}
            <View style={styles.weeklyDaysHeader}>
              {getWeekDays(currentDate).map((dayInfo, index) => (
                <View
                  key={index}
                  style={[
                    styles.weeklyDayHeader,
                    index === 6 && styles.weeklyDayHeaderLast,
                  ]}
                >
                  <Text style={styles.weeklyDayName}>{dayInfo.dayName}</Text>
                  <View
                    style={[
                      dayInfo.isToday && styles.weeklyDayNumberTodayContainer,
                    ]}
                  >
                    <Text
                      style={[
                        styles.weeklyDayNumber,
                        dayInfo.isToday && styles.weeklyDayNumberToday,
                      ]}
                    >
                      {dayInfo.dayNumber}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Colunas de horas */}
            <ScrollView style={styles.weeklyTimeSlotsContainer}>
              <View style={styles.weeklyTimeSlots}>
                {/* Coluna de horas */}
                <View style={styles.weeklyTimeColumn}>
                  {getTimeSlots().map((time, timeIndex) => (
                    <View key={timeIndex} style={styles.weeklyTimeLabel}>
                      <Text style={styles.weeklyTimeLabelText}>{time}</Text>
                    </View>
                  ))}
                </View>

                {/* Colunas dos dias */}
                {getWeekDays(currentDate).map((dayInfo, dayIndex) => {
                  const dayEvents = getEventsForDay(
                    dayInfo.date.getDate(),
                    dayInfo.date.getMonth(),
                    dayInfo.date.getFullYear()
                  );

                  return (
                    <View
                      key={dayIndex}
                      style={[
                        styles.weeklyDayColumn,
                        dayIndex === 6 && styles.weeklyDayColumnLast,
                      ]}
                    >
                      {getTimeSlots().map((_time, timeIndex) => {
                        // Encontrar eventos para este horário
                        const slotEvents = dayEvents.filter((event) => {
                          if (!event.startTime) {
                            // Se não tem horário, colocar no primeiro slot do dia
                            return timeIndex === 0;
                          }
                          const eventHour = parseInt(event.startTime.split(':')[0]);
                          return eventHour === timeIndex;
                        });

                        return (
                          <TouchableOpacity
                            key={timeIndex}
                            style={styles.weeklyTimeSlot}
                          >
                            {slotEvents.length > 0 ? (
                              slotEvents.map((event) => (
                                <View
                                  key={event.id}
                                  style={[
                                    styles.weeklyEvent,
                                    { backgroundColor: event.color },
                                  ]}
                                >
                                  <Text style={styles.weeklyEventText} numberOfLines={2}>
                                    {event.startTime || '00:00'} {event.title}
                                  </Text>
                                </View>
                              ))
                            ) : null}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
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
  calendarControls: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    marginBottom: spacing.xl,
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  calendarControlsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  navButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  navButton: {
    padding: spacing.xs,
  },
  todayButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  calendarControlsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  viewToggleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  viewToggleButtonActive: {
    backgroundColor: '#374151',
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  viewToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
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
  calendarHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  calendarHeaderCell: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  calendarHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarWrapper: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: spacing.lg,
  },
  eventsSidebar: {
    width: Platform.OS === 'web' ? 280 : '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: Platform.OS === 'web' ? 800 : 300,
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
  eventsSidebarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: spacing.lg,
  },
  eventsSection: {
    marginBottom: spacing.lg,
  },
  eventsSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    flexShrink: 0,
  },
  eventItemContent: {
    flex: 1,
  },
  eventItemTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  eventItemDate: {
    fontSize: 11,
    color: '#6B7280',
  },
  calendarCell: {
    width: `${100 / 7}%`,
    height: Platform.OS === 'web' ? 120 : 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: spacing.sm,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  calendarCellEvents: {
    width: '100%',
    marginTop: spacing.xs,
    gap: 2,
  },
  calendarEvent: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2,
  },
  calendarEventMore: {
    backgroundColor: '#6B7280',
  },
  calendarEventText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  calendarCellToday: {
    backgroundColor: '#374151',
  },
  calendarCellOtherMonth: {
    backgroundColor: '#F9FAFB',
  },
  calendarCellText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  calendarCellTextToday: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calendarCellTextOtherMonth: {
    color: '#9CA3AF',
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weeklyHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  weeklyNavButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  weeklyNavButton: {
    padding: spacing.xs,
  },
  weeklyGrid: {
    flex: 1,
  },
  weeklyDaysHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  weeklyDayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  weeklyDayHeaderLast: {
    borderRightWidth: 0,
  },
  weeklyDayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  weeklyDayNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  weeklyDayNumberTodayContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weeklyDayNumberToday: {
    color: '#FFFFFF',
  },
  weeklyTimeSlotsContainer: {
    maxHeight: 600,
  },
  weeklyTimeSlots: {
    flexDirection: 'row',
  },
  weeklyTimeColumn: {
    width: 60,
    borderRightWidth: 2,
    borderRightColor: '#E5E7EB',
  },
  weeklyTimeLabel: {
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.xs,
    alignItems: 'flex-end',
  },
  weeklyTimeLabelText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  weeklyDayColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    position: 'relative',
  },
  weeklyDayColumnLast: {
    borderRightWidth: 0,
  },
  weeklyTimeSlot: {
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    position: 'relative',
  },
  weeklyEvent: {
    borderRadius: 4,
    padding: spacing.xs,
    marginBottom: 2,
    minHeight: 40,
    justifyContent: 'center',
  },
  weeklyEventText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 14,
  },
});

