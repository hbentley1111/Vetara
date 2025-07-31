import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {theme} from '@/theme/colors';

const LoadingScreen: React.FC = () => {
  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.surface]}
      style={styles.container}
    >
      <ActivityIndicator 
        size="large" 
        color={theme.colors.primary} 
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingScreen;