/**
 * Componente Logo da CCB
 */
import React from 'react';
import { View, Image, StyleSheet, ImageStyle } from 'react-native';
import { spacing } from '@/theme';

interface LogoProps {
  style?: ImageStyle;
  width?: number;
  height?: number;
}

export const Logo: React.FC<LogoProps> = ({ style, width = 200, height = 120 }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/img/logo-ccb-light.png')}
        style={[
          styles.logo,
          { width, height },
          style,
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    // Estilos serão aplicados via props
  },
});

