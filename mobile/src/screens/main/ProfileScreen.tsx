import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

import Header from '@/components/ui/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {useAuth} from '@/context/AuthContext';
import {theme} from '@/theme/colors';

const ProfileScreen: React.FC = () => {
  const {user, logout} = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Sign Out', style: 'destructive', onPress: logout},
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'Profile editing would be available in a production app.',
      [{text: 'OK'}]
    );
  };

  const handleNotificationSettings = () => {
    Alert.alert(
      'Notification Settings',
      'Notification preferences would be configurable in a production app.',
      [{text: 'OK'}]
    );
  };

  const handlePrivacySettings = () => {
    Alert.alert(
      'Privacy Settings',
      'Privacy controls would be available in a production app.',
      [{text: 'OK'}]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Help & Support',
      'Help documentation and support contact would be available in a production app.',
      [{text: 'OK'}]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About PetCare Pro',
      'PetCare Pro Mobile v1.0.0\n\nA comprehensive pet health management platform for iOS and Android.',
      [{text: 'OK'}]
    );
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const formatUserType = (userType: string) => {
    return userType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const menuItems = [
    {
      icon: 'edit',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      onPress: handleEditProfile,
      color: theme.colors.primary,
    },
    {
      icon: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      onPress: handleNotificationSettings,
      color: theme.colors.warning,
    },
    {
      icon: 'security',
      title: 'Privacy & Security',
      subtitle: 'Control your privacy settings',
      onPress: handlePrivacySettings,
      color: theme.colors.success,
    },
    {
      icon: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: handleHelp,
      color: theme.colors.info,
    },
    {
      icon: 'info',
      title: 'About',
      subtitle: 'App version and information',
      onPress: handleAbout,
      color: theme.colors.textMuted,
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="Profile" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <LinearGradient
            colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
            style={styles.profileHeader}
          >
            <View style={styles.avatarContainer}>
              {user?.profileImageUrl ? (
                <View style={styles.avatar}>
                  {/* Profile image would be loaded here */}
                  <Icon name="person" size={40} color={theme.colors.white} />
                </View>
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getUserInitials()}</Text>
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.firstName || user?.email?.split('@')[0] || 'User'
                }
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.userType}>
                {user?.userType ? formatUserType(user.userType) : 'Pet Owner'}
              </Text>
            </View>
          </LinearGradient>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Pets</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Records</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Providers</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Card 
              key={index} 
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemContent}>
                <View style={[
                  styles.menuIcon,
                  {backgroundColor: `${item.color}20`}
                ]}>
                  <Icon name={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Icon 
                  name="chevron-right" 
                  size={24} 
                  color={theme.colors.textMuted} 
                />
              </View>
            </Card>
          ))}
        </View>

        {/* App Information */}
        <Card style={styles.appInfoCard}>
          <View style={styles.appInfoHeader}>
            <LinearGradient
              colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
              style={styles.appIcon}
            >
              <Icon name="pets" size={24} color={theme.colors.white} />
            </LinearGradient>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>PetCare Pro Mobile</Text>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
            </View>
          </View>
          <Text style={styles.appDescription}>
            Your comprehensive pet health management companion for iOS and Android.
          </Text>
        </Card>

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="outline"
          size="lg"
          icon={<Icon name="logout" size={20} color={theme.colors.error} />}
        />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for pet lovers everywhere
          </Text>
          <Text style={styles.copyrightText}>
            © 2025 PetCare Pro. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  profileCard: {
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
  },
  profileHeader: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.white,
  },
  avatarText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.white,
    opacity: 0.9,
    marginBottom: theme.spacing.xs,
  },
  userType: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    opacity: 0.8,
    textTransform: 'capitalize',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  menuContainer: {
    marginBottom: theme.spacing.lg,
  },
  menuItem: {
    marginBottom: theme.spacing.md,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  appInfoCard: {
    marginBottom: theme.spacing.lg,
  },
  appInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  appIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  appVersion: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  appDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  footerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  copyrightText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});

export default ProfileScreen;