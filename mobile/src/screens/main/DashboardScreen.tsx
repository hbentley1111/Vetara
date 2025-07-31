import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from 'react-query';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

import Header from '@/components/ui/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {useAuth} from '@/context/AuthContext';
import {apiClient} from '@/services/api';
import {theme} from '@/theme/colors';

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const {user} = useAuth();

  const {data: stats, isLoading: statsLoading, refetch: refetchStats} = useQuery(
    'dashboardStats',
    apiClient.getDashboardStats
  );

  const {data: pets, isLoading: petsLoading, refetch: refetchPets} = useQuery(
    'pets',
    apiClient.getPets
  );

  const {data: appointments, isLoading: appointmentsLoading, refetch: refetchAppointments} = useQuery(
    'appointments',
    apiClient.getAppointments
  );

  const isLoading = statsLoading || petsLoading || appointmentsLoading;

  const handleRefresh = () => {
    refetchStats();
    refetchPets();
    refetchAppointments();
  };

  const navigateToScreen = (screen: string, params?: any) => {
    navigation.navigate(screen as never, params as never);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const upcomingAppointments = appointments?.slice(0, 3) || [];

  return (
    <View style={styles.container}>
      <Header
        title={`${getGreeting()}, ${user?.firstName || 'User'}!`}
        rightComponent={
          <TouchableOpacity onPress={() => navigateToScreen('QRScanner')}>
            <Icon name="qr-code-scanner" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigateToScreen('Pets')}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={styles.statGradient}
            >
              <Icon name="pets" size={24} color={theme.colors.white} />
              <Text style={styles.statNumber}>{stats?.totalPets || 0}</Text>
              <Text style={styles.statLabel}>My Pets</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigateToScreen('Records')}
          >
            <LinearGradient
              colors={[theme.colors.success, theme.colors.petGreen]}
              style={styles.statGradient}
            >
              <Icon name="folder" size={24} color={theme.colors.white} />
              <Text style={styles.statNumber}>{stats?.recentRecords || 0}</Text>
              <Text style={styles.statLabel}>Records</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigateToScreen('Providers')}
          >
            <LinearGradient
              colors={[theme.colors.warning, '#f59e0b']}
              style={styles.statGradient}
            >
              <Icon name="local-hospital" size={24} color={theme.colors.white} />
              <Text style={styles.statNumber}>{stats?.upcomingAppointments || 0}</Text>
              <Text style={styles.statLabel}>Appointments</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigateToScreen('AddPet')}
            >
              <View style={styles.actionIcon}>
                <Icon name="add" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.actionText}>Add Pet</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigateToScreen('AddRecord')}
            >
              <View style={styles.actionIcon}>
                <Icon name="note-add" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.actionText}>Add Record</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigateToScreen('QRScanner')}
            >
              <View style={styles.actionIcon}>
                <Icon name="qr-code-scanner" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.actionText}>Scan QR</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigateToScreen('Providers')}
            >
              <View style={styles.actionIcon}>
                <Icon name="search" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.actionText}>Find Provider</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* My Pets */}
        {pets && pets.length > 0 && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Pets</Text>
              <TouchableOpacity onPress={() => navigateToScreen('Pets')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {pets.slice(0, 5).map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={styles.petCard}
                  onPress={() => navigateToScreen('PetDetails', {petId: pet.id})}
                >
                  <View style={styles.petAvatar}>
                    <Icon name="pets" size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.petName}>{pet.name}</Text>
                  <Text style={styles.petBreed}>{pet.breed}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>
        )}

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
              <TouchableOpacity onPress={() => navigateToScreen('Providers')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {upcomingAppointments.map((appointment) => (
              <View key={appointment.id} style={styles.appointmentItem}>
                <View style={styles.appointmentIcon}>
                  <Icon name="event" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.appointmentContent}>
                  <Text style={styles.appointmentType}>{appointment.appointmentType}</Text>
                  <Text style={styles.appointmentDate}>
                    {new Date(appointment.scheduledDate).toLocaleDateString()}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={theme.colors.textMuted} />
              </View>
            ))}
          </Card>
        )}

        {/* Health Alerts */}
        {stats?.healthAlerts && stats.healthAlerts > 0 && (
          <Card style={[styles.section, styles.alertCard]}>
            <View style={styles.alertHeader}>
              <Icon name="warning" size={24} color={theme.colors.warning} />
              <Text style={styles.alertTitle}>Health Alerts</Text>
            </View>
            <Text style={styles.alertText}>
              You have {stats.healthAlerts} health alert{stats.healthAlerts !== 1 ? 's' : ''} that need attention.
            </Text>
            <Button
              title="View Alerts"
              onPress={() => navigateToScreen('Records')}
              variant="outline"
              size="sm"
            />
          </Card>
        )}
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  statGradient: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
    marginTop: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
    opacity: 0.9,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  seeAll: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  actionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  petCard: {
    marginRight: theme.spacing.md,
    alignItems: 'center',
    width: 80,
  },
  petAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  petName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  petBreed: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.slate700,
  },
  appointmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  appointmentContent: {
    flex: 1,
  },
  appointmentType: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  appointmentDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  alertCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  alertTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  alertText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
});

export default DashboardScreen;