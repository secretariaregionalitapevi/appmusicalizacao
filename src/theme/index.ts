/**
 * Exportação centralizada do theme
 */
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
} as const;

export type AppTheme = typeof theme;

export { colors, typography, spacing };

