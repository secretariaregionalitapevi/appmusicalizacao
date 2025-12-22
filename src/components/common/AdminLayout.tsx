/**
 * Layout administrativo reutilizável para todas as páginas
 * Inclui header, menu lateral e área de conteúdo
 */
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks/useAuth';
import { spacing } from '@/theme';
import type { RootStackParamList } from '@/types/navigation';
import { supabase } from '@/api/supabase';
import { useTheme } from '@/contexts/ThemeContext';

const isWeb = Platform.OS === 'web';

interface MenuItem {
  icon: string;
  label: string;
  screen: 'Home' | 'Calendar' | 'Classes' | 'Students' | 'Attendance' | 'Reports' | 'Profile';
  active?: boolean;
}

interface AdminLayoutProps {
  title?: string;
  children: React.ReactNode;
  currentScreen?: 'Home' | 'Calendar' | 'Classes' | 'Students' | 'Attendance' | 'Reports' | 'Profile';
  showPageTitle?: boolean;
  onRefresh?: () => Promise<void> | void;
  refreshing?: boolean;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  title,
  children,
  currentScreen = 'Home',
  showPageTitle = true,
  onRefresh,
  refreshing = false,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  // Inicializar com o tamanho da tela atual
  const initialWidth = Dimensions.get('window').width;
  const initialIsMobile = initialWidth < 768;
  
  const [screenWidth, setScreenWidth] = useState(initialWidth);
  const isMobile = useMemo(() => screenWidth < 768, [screenWidth]);
  // No mobile, menu começa fechado; no desktop, começa aberto
  const [sidebarOpen, setSidebarOpen] = useState(!initialIsMobile);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [poloName, setPoloName] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const userMenuRef = useRef<View>(null);
  const messagesRef = useRef<View>(null);
  const notificationsRef = useRef<View>(null);
  const sidebarAnimation = useRef(new Animated.Value(!initialIsMobile ? 1 : 0)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;

  // Função de refresh
  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Usar refreshing prop se fornecida, caso contrário usar estado interno
  const refreshingState = refreshing !== undefined ? refreshing : isRefreshing;
  
  // Mensagens e notificações simuladas do ambiente de administração da escola musical
  const mockMessages = [
    {
      id: '1',
      userImage: require('../../img/user/Ricardo.png'),
      userName: 'Ricardo Silva',
      title: 'Nova aula de Violão agendada',
      message: 'Aula de Violão Básico foi agendada para amanhã às 14h. Confirme sua presença.',
      time: '5 min atrás',
    },
    {
      id: '2',
      userImage: require('../../img/user/user-1.jpg'),
      userName: 'Maria Santos',
      title: 'Treinamento de instrutores',
      message: 'Reunião de treinamento para novos instrutores agendada para próxima segunda-feira às 9h.',
      time: '15 min atrás',
    },
    {
      id: '3',
      userImage: require('../../img/user/user-11.jpg'),
      userName: 'João Oliveira',
      title: 'Material didático disponível',
      message: 'Novos materiais de Teoria Musical chegaram. Podem ser retirados na secretaria.',
      time: '1 hora atrás',
    },
    {
      id: '4',
      userImage: require('../../img/user/user-12.jpg'),
      userName: 'Ana Costa',
      title: 'Relatório de presenças',
      message: 'Relatório mensal de presenças de dezembro está disponível para análise.',
      time: '2 horas atrás',
    },
    {
      id: '5',
      userImage: require('../../img/user/user-13.jpg'),
      userName: 'Carlos Mendes',
      title: 'Aula cancelada',
      message: 'Aula de Piano Intermediário de hoje foi cancelada. Alunos serão notificados.',
      time: '3 horas atrás',
    },
    {
      id: '6',
      userImage: require('../../img/user/user-4.jpg'),
      userName: 'Patricia Lima',
      title: 'Workshop de técnicas avançadas',
      message: 'Workshop sobre técnicas avançadas de ensino musical será realizado no próximo sábado às 10h.',
      time: '4 horas atrás',
    },
    {
      id: '7',
      userImage: require('../../img/user/user-6.jpg'),
      userName: 'Fernando Alves',
      title: 'Nova turma formada',
      message: 'Nova turma de Teclado Iniciante foi formada. Início das aulas na próxima semana.',
      time: '5 horas atrás',
    },
  ];

  const mockNotifications = [
    {
      id: '1',
      icon: 'warning-outline',
      iconColor: '#EF4444',
      iconBg: '#FEE2E2',
      title: 'Aluno com faltas consecutivas',
      message: 'Maria Silva faltou 3 aulas consecutivas de Violão Básico. Ação necessária.',
      time: '10 min atrás',
    },
    {
      id: '2',
      icon: 'person-add-outline',
      iconColor: '#3B82F6',
      iconBg: '#DBEAFE',
      title: 'Novo instrutor cadastrado',
      message: 'Pedro Alves foi cadastrado como instrutor de Teclado. Aguardando aprovação.',
      time: '30 min atrás',
    },
    {
      id: '3',
      icon: 'alert-circle-outline',
      iconColor: '#F59E0B',
      iconBg: '#FEF3C7',
      title: 'Capacidade máxima atingida',
      message: 'Turma de Violão Básico atingiu capacidade máxima. Novas matrículas em lista de espera.',
      time: '1 hora atrás',
    },
  ];

  const messagesCount = mockMessages.length;
  const notificationsCount = mockNotifications.length;

  const userFullName = profile?.fullName || 'Usuário';
  const firstName = userFullName.split(' ')[0];
  const userInitials = userFullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Obter saudação baseada no horário
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Bom dia';
    } else if (hour >= 12 && hour < 18) {
      return 'Boa tarde';
    } else {
      return 'Boa noite';
    }
  };

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

  // Detectar mudanças no tamanho da tela
  useEffect(() => {
    const updateLayout = ({ window }: { window: { width: number } }) => {
      const width = window.width;
      const previousMobile = screenWidth < 768;
      const currentMobile = width < 768;
      
      setScreenWidth(width);
      
      // Se mudou de desktop para mobile, fechar o menu
      if (!previousMobile && currentMobile) {
        setSidebarOpen(false);
        sidebarAnimation.setValue(0);
        overlayAnimation.setValue(0);
      }
      // Se mudou de mobile para desktop, abrir o menu
      if (previousMobile && !currentMobile) {
        setSidebarOpen(true);
        sidebarAnimation.setValue(1);
        overlayAnimation.setValue(0);
      }
    };

    const subscription = Dimensions.addEventListener('change', updateLayout);

    return () => {
      subscription?.remove();
    };
  }, [screenWidth, sidebarAnimation, overlayAnimation]);

  const menuItems: MenuItem[] = [
    {
      icon: 'home',
      label: 'Início',
      screen: 'Home',
    },
    {
      icon: 'calendar',
      label: 'Calendário',
      screen: 'Calendar',
    },
    {
      icon: 'book',
      label: 'Aulas',
      screen: 'Classes',
    },
    {
      icon: 'people',
      label: 'Cadastro de Alunos',
      screen: 'Students',
    },
    {
      icon: 'checkmark-circle',
      label: 'Registro de Presença',
      screen: 'Attendance',
    },
    {
      icon: 'document-text',
      label: 'Relatórios',
      screen: 'Reports',
    },
  ];

  const getIcon = (iconName: string, isActive: boolean) => {
    const iconProps = { 
      size: 20, 
      color: isActive ? '#1F2937' : '#6B7280' 
    };
    
    switch (iconName) {
      case 'home':
        return <Ionicons name="home" {...iconProps} />;
      case 'calendar':
        return <Ionicons name="calendar" {...iconProps} />;
      case 'book':
        return <Ionicons name="book" {...iconProps} />;
      case 'people':
        return <Ionicons name="people" {...iconProps} />;
      case 'checkmark-circle':
        return <Ionicons name="checkmark-circle" {...iconProps} />;
      case 'document-text':
        return <Ionicons name="document-text" {...iconProps} />;
      case 'settings':
        return <Ionicons name="settings" {...iconProps} />;
      default:
        return <Ionicons name="ellipse" {...iconProps} />;
    }
  };

  const handleMenuPress = (item: MenuItem) => {
    if (isMobile) {
      setSidebarOpen(false);
    }
    navigation.navigate('Main', { screen: item.screen });
  };

  // Animar sidebar
  useEffect(() => {
    if (isMobile) {
      // No mobile, usar animação de slide
      Animated.parallel([
        Animated.timing(sidebarAnimation, {
          toValue: sidebarOpen ? 1 : 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(overlayAnimation, {
          toValue: sidebarOpen ? 1 : 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // No desktop, usar animação de largura
      Animated.timing(sidebarAnimation, {
        toValue: sidebarOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      overlayAnimation.setValue(0);
    }
  }, [sidebarOpen, isMobile, sidebarAnimation, overlayAnimation]);

  // Fechar sidebar ao clicar no overlay (mobile)
  const handleOverlayPress = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  // Fechar menus ao clicar fora (apenas web)
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (userMenuOpen && userMenuRef.current && !(userMenuRef.current as any).contains(target)) {
          setUserMenuOpen(false);
        }
        if (messagesOpen && messagesRef.current && !(messagesRef.current as any).contains(target)) {
          setMessagesOpen(false);
        }
        if (notificationsOpen && notificationsRef.current && !(notificationsRef.current as any).contains(target)) {
          setNotificationsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [userMenuOpen, messagesOpen, notificationsOpen]);

  return (
    <SafeAreaView style={styles.container} edges={isMobile ? ['top', 'bottom'] : ['top', 'bottom', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {isWeb ? (
            <View
              {...({
              onClick: (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                setSidebarOpen(!sidebarOpen);
              },
                onMouseDown: (e: MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                },
              } as any)}
              style={[styles.menuButton, { cursor: 'pointer' }]}
            >
              <Ionicons name="menu" size={24} color="#1F2937" />
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setSidebarOpen(!sidebarOpen);
              }}
              style={styles.menuButton}
              activeOpacity={0.7}
            >
              <Ionicons name="menu" size={24} color="#1F2937" />
            </TouchableOpacity>
          )}
          {(!isMobile && sidebarOpen) || isMobile ? (
            <Image 
              source={require('../../img/logo-ccb-light.png')} 
              style={styles.logo} 
              resizeMode="contain" 
            />
          ) : null}
        </View>
        <View style={styles.headerRight}>
          {!isMobile && (
            <Text style={styles.welcomeText}>
              {getGreeting()}, <Text style={styles.welcomeName}>{firstName}</Text>!
            </Text>
          )}
          
          {/* Messages Icon with Badge */}
          <View style={styles.iconContainer}>
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => {
                setMessagesOpen(!messagesOpen);
                setNotificationsOpen(false);
                setUserMenuOpen(false);
              }}
            >
              <Ionicons name="mail-outline" size={22} color="#6B7280" />
              {messagesCount > 0 && (
                <View style={[styles.badge, styles.badgeBlue]}>
                  <Text style={styles.badgeText}>{messagesCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            
            {/* Messages Dropdown */}
            {messagesOpen && (
              <View style={styles.dropdownContainer} ref={messagesRef}>
                <View style={styles.dropdown}>
                  <View style={styles.dropdownHeader}>
                    <Text style={styles.dropdownTitle}>MENSAGENS ({messagesCount})</Text>
                  </View>
                  <View style={styles.dropdownContent}>
                    {mockMessages.slice(0, 4).map((message) => (
                      <TouchableOpacity key={message.id} style={styles.dropdownItem}>
                        <View style={styles.dropdownItemIcon}>
                          <Image 
                            source={message.userImage} 
                            style={styles.dropdownUserImage}
                            resizeMode="cover"
                          />
                        </View>
                        <View style={styles.dropdownItemContent}>
                          <Text style={styles.dropdownItemTitle}>{message.title}</Text>
                          <Text style={styles.dropdownItemText} numberOfLines={1}>
                            {message.userName}: {message.message}
                          </Text>
                          <Text style={styles.dropdownItemTime}>{message.time}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity style={styles.dropdownFooter}>
                    <Text style={styles.dropdownFooterText}>Ver todas as mensagens</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Notifications Icon with Badge */}
          <View style={styles.iconContainer}>
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => {
                setNotificationsOpen(!notificationsOpen);
                setMessagesOpen(false);
                setUserMenuOpen(false);
              }}
            >
              <Ionicons name="notifications-outline" size={22} color="#6B7280" />
              {notificationsCount > 0 && (
                <View style={[styles.badge, styles.badgeRed]}>
                  <Text style={styles.badgeText}>{notificationsCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            
            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <View style={styles.dropdownContainer} ref={notificationsRef}>
                <View style={styles.dropdown}>
                  <View style={styles.dropdownHeader}>
                    <Text style={styles.dropdownTitle}>NOTIFICAÇÕES ({notificationsCount})</Text>
                  </View>
                  <View style={styles.dropdownContent}>
                    {mockNotifications.map((notification) => (
                      <TouchableOpacity key={notification.id} style={styles.dropdownItem}>
                        <View style={[styles.notificationIconContainer, { backgroundColor: notification.iconBg }]}>
                          <Ionicons 
                            name={notification.icon as any} 
                            size={20} 
                            color={notification.iconColor} 
                          />
                        </View>
                        <View style={styles.dropdownItemContent}>
                          <Text style={styles.dropdownItemTitle}>{notification.title}</Text>
                          <Text style={styles.dropdownItemText} numberOfLines={2}>
                            {notification.message}
                          </Text>
                          <Text style={styles.dropdownItemTime}>{notification.time}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity style={styles.dropdownFooter}>
                    <Text style={styles.dropdownFooterText}>Ver todas as notificações</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => {
              setUserMenuOpen(!userMenuOpen);
              setMessagesOpen(false);
              setNotificationsOpen(false);
            }}
            style={styles.userInitials}
          >
            <Text style={styles.userInitialsText}>{userInitials}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[
        styles.contentContainer,
        isMobile && styles.contentContainerMobile,
      ]}>
        {/* Overlay para mobile - SEMPRE renderizar mas controlar visibilidade */}
        {isMobile && (
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity: overlayAnimation,
                zIndex: sidebarOpen ? 999 : -1,
              },
            ]}
            pointerEvents={sidebarOpen ? 'auto' : 'none'}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={handleOverlayPress}
              accessible={true}
              accessibilityLabel="Fechar menu"
            />
          </Animated.View>
        )}

        {/* Sidebar */}
        {isMobile ? (
          <Animated.View
            style={[
              styles.sidebar,
              styles.sidebarMobile,
              {
                transform: [
                  {
                    translateX: sidebarAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-280, 0],
                    }),
                  },
                ],
                width: 280,
                zIndex: sidebarOpen ? 1000 : -1,
              },
            ]}
            pointerEvents={sidebarOpen ? 'auto' : 'none'}
            collapsable={false}
          >
            <ScrollView style={styles.sidebarScroll}>
              {menuItems.map((item, index) => {
                const isActive = item.screen === currentScreen;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.menuItem, isActive && styles.menuItemActive]}
                    onPress={() => handleMenuPress(item)}
                  >
                    <View style={styles.menuItemContent}>
                      {getIcon(item.icon, isActive)}
                      <Text
                        style={[
                          styles.menuItemText,
                          isActive && styles.menuItemTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              styles.sidebar,
              {
                width: sidebarAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [70, 280], // 70px quando recolhido (só ícones), 280px quando expandido
                }),
                overflow: 'hidden',
              },
            ]}
          >
            <ScrollView 
              style={[
                styles.sidebarScroll,
                {
                  paddingTop: sidebarOpen ? spacing.sm : 0,
                  paddingBottom: sidebarOpen ? spacing.sm : 0,
                }
              ]}
            >
              {menuItems.map((item, index) => {
                const isActive = item.screen === currentScreen;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.menuItem,
                      isActive && styles.menuItemActive,
                      {
                        justifyContent: sidebarOpen ? 'flex-start' : 'center',
                        paddingHorizontal: sidebarOpen ? spacing.lg : 0,
                        paddingVertical: sidebarOpen ? spacing.md : 0,
                        marginVertical: 0,
                        marginHorizontal: sidebarOpen ? spacing.xs : 0,
                        minHeight: sidebarOpen ? 44 : 36,
                        height: sidebarOpen ? undefined : 36,
                      },
                    ]}
                    onPress={() => handleMenuPress(item)}
                  >
                    <View style={[
                      styles.menuItemContent,
                      {
                        justifyContent: sidebarOpen ? 'flex-start' : 'center',
                        width: '100%',
                      },
                    ]}>
                      {getIcon(item.icon, isActive)}
                      <Animated.View
                        style={{
                          opacity: sidebarAnimation,
                          overflow: 'hidden',
                          marginLeft: spacing.md,
                          width: sidebarAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 200],
                          }),
                        }}
                      >
                        <Text
                          style={[
                            styles.menuItemText,
                            isActive && styles.menuItemTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </Animated.View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}

        {/* Main Content */}
        <View style={[
          styles.mainContent,
          isMobile && styles.mainContentMobile,
          isMobile && sidebarOpen && styles.mainContentMobileWithSidebar,
          !isMobile && !sidebarOpen && {
            marginLeft: 0,
          },
        ]}>
          <ScrollView 
            style={[
              styles.mainContentScroll,
              isMobile && styles.mainContentScrollMobile,
            ]} 
            contentContainerStyle={[
              styles.scrollContent,
              isMobile && styles.scrollContentMobile,
            ]}
            showsVerticalScrollIndicator={true}
            bounces={!isWeb}
            scrollEnabled={!isMobile || !sidebarOpen}
            nestedScrollEnabled={!isWeb}
            keyboardShouldPersistTaps="handled"
            // Habilitar pull-to-refresh em todas as plataformas mobile
            alwaysBounceVertical={!isWeb && onRefresh ? true : false}
            // Otimizações para Android/HyperOS
            removeClippedSubviews={Platform.OS !== 'ios' && Platform.OS !== 'web' ? true : false}
            scrollEventThrottle={16}
            refreshControl={
              !isWeb && onRefresh ? (
                <RefreshControl
                  refreshing={refreshingState}
                  onRefresh={handleRefresh}
                  // iOS: tintColor para a cor do spinner
                  tintColor={Platform.OS === 'ios' ? '#033D60' : undefined}
                  // Android/HyperOS: colors para a cor do spinner
                  colors={Platform.OS !== 'ios' && Platform.OS !== 'web' ? ['#033D60'] : undefined}
                  // Android/HyperOS: offset para não sobrepor o header
                  progressViewOffset={Platform.OS !== 'ios' && Platform.OS !== 'web' ? 0 : undefined}
                  // Android/HyperOS: título do refresh
                  title={Platform.OS !== 'ios' && Platform.OS !== 'web' ? 'Puxe para atualizar' : undefined}
                  titleColor={Platform.OS !== 'ios' && Platform.OS !== 'web' ? '#6B7280' : undefined}
                  progressBackgroundColor={Platform.OS !== 'ios' && Platform.OS !== 'web' ? '#F9FAFB' : undefined}
                  // Android/HyperOS: tamanho do spinner
                  size={Platform.OS !== 'ios' && Platform.OS !== 'web' ? 'default' : undefined}
                  enabled={true}
                />
              ) : undefined
            }
          >
            {showPageTitle && title && <Text style={styles.pageTitle}>{title}</Text>}
            {children}
          </ScrollView>
        </View>
      </View>

      {/* User Menu Dropdown */}
      {userMenuOpen && (
        <View style={styles.userMenuContainer} ref={userMenuRef}>
          <View style={styles.userMenu}>
            {/* User Info Header */}
            <View style={styles.userMenuHeader}>
              <View style={styles.userMenuAvatar}>
                <Text style={styles.userMenuAvatarText}>{userInitials}</Text>
              </View>
              <View style={styles.userMenuInfo}>
                <Text style={styles.userMenuName}>{userFullName}</Text>
                <Text style={styles.userMenuRole}>
                  {poloName || 'Polo não informado'}
                </Text>
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
    ...(isWeb ? {} : {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      minWidth: '100%',
      maxWidth: '100%',
      position: 'relative',
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isWeb ? spacing.lg : spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    position: 'relative',
    zIndex: 1000,
    width: '100%',
    ...(isWeb && {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      overflow: 'visible',
    }),
    ...(!isWeb && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 3,
      minWidth: '100%',
      maxWidth: '100%',
    }),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuButton: {
    padding: spacing.xs,
    ...(isWeb && {
      outline: 'none',
      WebkitTapHighlightColor: 'transparent',
    }),
  },
  logo: {
    width: isWeb ? 120 : 100,
    height: isWeb ? 60 : 50,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginLeft: 'auto',
    position: 'relative',
    zIndex: 1001,
    ...(isWeb && {
      overflow: 'visible',
    }),
  },
  welcomeText: {
    fontSize: isWeb ? 14 : 13,
    fontWeight: '400',
    color: '#6B7280',
    marginRight: spacing.md,
  },
  welcomeName: {
    color: '#033D60',
    fontWeight: '600',
  },
  iconContainer: {
    position: 'relative',
    zIndex: 100,
    ...(isWeb && {
      overflow: 'visible',
    }),
  },
  headerIcon: {
    padding: spacing.xs,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeBlue: {
    backgroundColor: '#033D60',
  },
  badgeRed: {
    backgroundColor: '#EF4444',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 45,
    right: 0,
    zIndex: 3000,
    width: 300,
    ...(isWeb
      ? {}
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 10,
        }),
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    maxHeight: 350,
    ...(isWeb
      ? {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }),
  },
  dropdownHeader: {
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  dropdownTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownContent: {
    // Sem altura máxima fixa - mostra apenas as 5 mensagens sem scroll
  },
  dropdownItem: {
    flexDirection: 'row',
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  dropdownItemIcon: {
    marginRight: spacing.sm,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  dropdownUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  notificationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  dropdownItemContent: {
    flex: 1,
  },
  dropdownItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  dropdownItemText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
    lineHeight: 16,
  },
  dropdownItemTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  dropdownFooter: {
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  dropdownFooterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
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
    position: 'relative',
    ...(isWeb ? {} : {
      width: '100%',
      overflow: 'hidden',
      minWidth: '100%',
      maxWidth: '100%',
      height: '100%',
    }),
  },
  contentContainerMobile: {
    flexDirection: 'row',
    position: 'relative',
    width: '100%',
    minWidth: '100%',
    maxWidth: '100%',
    alignItems: 'stretch',
    overflow: 'hidden',
    height: '100%',
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    ...(isWeb ? {} : {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
    }),
  },
  sidebar: {
    backgroundColor: '#F3F4F6',
    ...(isWeb ? {
      position: 'relative',
      zIndex: 1,
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    } : {}),
  },
  sidebarMobile: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    // Garantir que quando fechado, não interfira com o layout
    width: 280,
  },
  sidebarScroll: {
    flex: 1,
  },
  sidebarOpen: {
    width: 280,
  },
  sidebarClosed: {
    width: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xs,
    marginVertical: spacing.xs,
    borderRadius: 8,
    minHeight: 44,
  },
  menuItemActive: {
    backgroundColor: '#E5E7EB',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    ...(isWeb ? {} : { 
      width: '100%',
      minWidth: '100%',
      maxWidth: '100%',
    }),
  },
  mainContentMobile: {
    width: '100%',
    minWidth: '100%',
    maxWidth: '100%',
    flex: 1,
    position: 'relative',
    zIndex: 1,
    marginLeft: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  mainContentMobileWithSidebar: {
    // Quando sidebar está aberto, conteúdo fica atrás mas ainda visível
    opacity: 0.4,
    pointerEvents: 'none',
  },
  mainContentScroll: {
    flex: 1,
  },
  mainContentScrollMobile: {
    width: '100%',
    minWidth: '100%',
    maxWidth: '100%',
    flex: 1,
  },
  scrollContent: {
    padding: isWeb ? spacing.xl : spacing.md,
    ...(isWeb ? {} : {
      width: '100%',
      minWidth: '100%',
      maxWidth: '100%',
    }),
  },
  scrollContentMobile: {
    padding: spacing.md,
    paddingBottom: 20,
    width: '100%',
    minWidth: '100%',
    maxWidth: '100%',
    flexGrow: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: spacing.xl,
  },
  userMenuContainer: {
    position: 'absolute',
    top: 60,
    right: spacing.lg,
    zIndex: 2000,
    ...(isWeb
      ? {}
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }),
  },
  userMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 280,
    ...(isWeb
      ? {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
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
  userMenuRole: {
    fontSize: 14,
    color: '#6B7280',
  },
  userMenuItems: {
    padding: spacing.xs,
  },
  userMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 8,
    gap: spacing.md,
  },
  userMenuItemText: {
    fontSize: 15,
    color: '#6B7280',
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

