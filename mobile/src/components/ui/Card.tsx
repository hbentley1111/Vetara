import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {theme} from '@/theme/colors';
import {CardProps} from '@/types';

const Card: React.FC<CardProps> = ({children, style, onPress}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container 
      style={[styles.card, style]} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.slate700,
    ...theme.shadows.sm,
  },
});

export default Card;