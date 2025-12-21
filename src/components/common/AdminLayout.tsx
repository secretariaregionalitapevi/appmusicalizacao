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
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  title,
  children,
  currentScreen = 'Home',
  showPageTitle = true,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const isMobile = useMemo(() => screenWidth < 768, [screenWidth]);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [poloName, setPoloName] = useState<string | null>(null);
  const userMenuRef = useRef<View>(null);
  const sidebarAnimation = useRef(new Animated.Value(!isMobile ? 1 : 0)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;

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

  // Detectar mudanças no tamanho da tela
  useEffect(() => {
    const updateLayout = ({ window }: { window: { width: number } }) => {
      const width = window.width;
      setScreenWidth(width);
      const mobile = width < 768;
      
      // Se mudou para mobile, fechar o menu
      if (mobile) {
        setSidebarOpen(false);
      }
      // Se mudou para desktop, abrir o menu
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    const subscription = Dimensions.addEventListener('change', updateLayout);
    
    // Verificar tamanho inicial
    const initialWidth = Dimensions.get('window').width;
    const initialMobile = initialWidth < 768;
    setScreenWidth(initialWidth);
    if (initialMobile) {
      setSidebarOpen(false);
      sidebarAnimation.setValue(0);
      overlayAnimation.setValue(0);
    } else {
      setSidebarOpen(true);
      sidebarAnimation.setValue(1);
      overlayAnimation.setValue(0);
    }

    return () => {
      subscription?.remove();
    };
  }, []);

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
  }, [sidebarOpen, isMobile]);

  // Fechar sidebar ao clicar no overlay (mobile)
  const handleOverlayPress = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

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
            <Ionicons name="chatbubble-outline" size={22} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="notifications-outline" size={22} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="help-circle-outline" size={22} color="#6B7280" />
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
        {/* Overlay para mobile */}
        {isMobile && sidebarOpen && (
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity: overlayAnimation,
              },
            ]}
            pointerEvents={sidebarOpen ? 'auto' : 'none'}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={handleOverlayPress}
            />
          </Animated.View>
        )}

        {/* Sidebar */}
        <Animated.View
          style={[
            styles.sidebar,
            isMobile
              ? {
                  transform: [
                    {
                      translateX: sidebarAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-280, 0],
                      }),
                    },
                  ],
                  width: 280,
                }
              : {
                  width: sidebarOpen ? 280 : 0,
                  overflow: sidebarOpen ? 'visible' : 'hidden',
                },
          ]}
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

        {/* Main Content */}
        <View style={styles.mainContent}>
          <ScrollView style={styles.mainContentScroll} contentContainerStyle={styles.scrollContent}>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isWeb ? spacing.lg : spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    ...(isWeb && {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    }),
    ...(!isWeb && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 3,
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
    width: isWeb ? 120 : 100,
    height: isWeb ? 60 : 50,
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
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  sidebar: {
    backgroundColor: '#F3F4F6',
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
    ...(isWeb && {
      position: 'relative',
      zIndex: 1,
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    }),
  },
  sidebarScroll: {
    flex: 1,
    paddingTop: spacing.lg,
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
    ...(isWeb ? {} : { width: '100%' }),
  },
  mainContentScroll: {
    flex: 1,
  },
  scrollContent: {
    padding: isWeb ? spacing.xl : spacing.md,
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

