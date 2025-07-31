import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Button from '@/components/ui/Button';
import {theme} from '@/theme/colors';

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.navigate('Login' as never);
  };

  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.surface]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo and App Name */}
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
              style={styles.logoGradient}
            >
              <Icon name="pets" size={60} color={theme.colors.white} />
            </LinearGradient>
            <Text style={styles.appName}>PetCare Pro</Text>
            <Text style={styles.tagline}>Your pet's health companion</Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Icon name="folder" size={24} color={theme.colors.primary} />
              <Text style={styles.featureText}>Digital medical records</Text>
            </View>
            <View style={styles.feature}>
              <Icon name="qr-code" size={24} color={theme.colors.primary} />
              <Text style={styles.featureText}>QR code pet identification</Text>
            </View>
            <View style={styles.feature}>
              <Icon name="local-hospital" size={24} color={theme.colors.primary} />
              <Text style={styles.featureText}>Find trusted providers</Text>
            </View>
            <View style={styles.feature}>
              <Icon name="security" size={24} color={theme.colors.primary} />
              <Text style={styles.featureText}>Insurance management</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Get Started"
              onPress={handleGetStarted}
              size="lg"
              icon={<Icon name="arrow-forward" size={20} color={theme.colors.white} />}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl * 2,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  appName: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  tagline: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  featuresContainer: {
    marginVertical: theme.spacing.xxl,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  featureText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.md,
    fontWeight: theme.typography.fontWeight.medium,
  },
  buttonContainer: {
    marginBottom: theme.spacing.xxl,
  },
});

export default WelcomeScreen;