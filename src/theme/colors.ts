/**
 * Sistema de cores do aplicativo
 * Baseado no Material Design com adaptações para CCB
 */
export const colors = {
  primary: {
    main: '#1976D2',
    light: '#42A5F5',
    dark: '#1565C0',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#43A047',
    light: '#66BB6A',
    dark: '#2E7D32',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#D32F2F',
    light: '#EF5350',
    dark: '#C62828',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#FFA000',
    light: '#FFB300',
    dark: '#FF8F00',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#388E3C',
    light: '#4CAF50',
    dark: '#2E7D32',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#0288D1',
    light: '#03A9F4',
    dark: '#01579B',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#F5F5F5',
    paper: '#FFFFFF',
    disabled: '#E0E0E0',
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    hint: '#9E9E9E',
  },
  divider: '#E0E0E0',
  border: '#E0E0E0',
  shadow: 'rgba(0, 0, 0, 0.1)',
} as const;

export type ColorTheme = typeof colors;

