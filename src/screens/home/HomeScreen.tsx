/**
 * Tela inicial do aplicativo
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common';
import { colors, spacing, typography } from '@/theme';

export const HomeScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.welcome}>Bem-vindo!</Text>
        <Text style={styles.subtitle}>Sistema de Musicalização Infantil CCB</Text>

        <View style={styles.cardsContainer}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Próximas Aulas</Text>
            <Text style={styles.cardValue}>0</Text>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Alunos Ativos</Text>
            <Text style={styles.cardValue}>0</Text>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Taxa de Presença</Text>
            <Text style={styles.cardValue}>0%</Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  welcome: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  cardsContainer: {
    gap: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  cardValue: {
    ...typography.h2,
    color: colors.primary.main,
  },
});

