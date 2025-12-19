/**
 * Sistema de espaçamento do aplicativo
 * Baseado em múltiplos de 4px
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export type SpacingTheme = typeof spacing;

/**
 * Helper function para criar espaçamento consistente
 */
export const getSpacing = (multiplier: number): number => {
  return multiplier * 4;
};

