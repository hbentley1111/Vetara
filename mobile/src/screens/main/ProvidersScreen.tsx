import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from 'react-query';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Header from '@/components/ui/Header';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import {apiClient} from '@/services/api';
import {requestLocationPermission} from '@/utils/permissions';
import {theme} from '@/theme/colors';
import {ServiceProvider} from '@/types';

const ProvidersScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const {data: providers, isLoading, refetch} = useQuery(
    'serviceProviders',
    apiClient.getServiceProviders
  );

  const {data: topRatedProviders} = useQuery(
    'topRatedProviders',
    apiClient.getTopRatedProviders
  );

  const handleProviderPress = (providerId: string) => {
    navigation.navigate('ProviderDetails' as never, {providerId} as never);
  };

  const handleLocationSearch = async () => {
    const hasPermission = await requestLocationPermission();
    if (hasPermission) {
      Alert.alert(
        'Location Search',
        'Location-based search would be implemented with device GPS in a production app.',
        [{text: 'OK'}]
      );
    }
  };

  const getProviderIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'veterinarian':
        return 'local-hospital';
      case 'groomer':
        return 'pets';
      case 'trainer':
        return 'school';
      case 'boarding':
        return 'home';
      case 'emergency':
        return 'emergency';
      default:
        return 'local-hospital';
    }
  };

  const getProviderColor = (serviceType: string) => {
    switch (serviceType) {
      case 'veterinarian':
        return theme.colors.primary;
      case 'groomer':
        return theme.colors.success;
      case 'trainer':
        return theme.colors.warning;
      case 'boarding':
        return theme.colors.info;
      case 'emergency':
        return theme.colors.error;
      default:
        return theme.colors.textMuted;
    }
  };

  const formatServiceType = (serviceType: string) => {
    return serviceType.charAt(0).toUpperCase() + serviceType.slice(1);
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={i} name="star" size={14} color={theme.colors.warning} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="star-half" size={14} color={theme.colors.warning} />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="star-border" size={14} color={theme.colors.textMuted} />
      );
    }

    return stars;
  };

  const filterProviders = (providers: ServiceProvider[] | undefined) => {
    if (!providers) return [];
    
    let filtered = providers;
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(provider => provider.serviceType === selectedType);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(provider =>
        provider.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.specialties?.some(specialty =>
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    return filtered;
  };

  const serviceTypes = [
    {key: 'all', label: 'All Types'},
    {key: 'veterinarian', label: 'Veterinarians'},
    {key: 'groomer', label: 'Groomers'},
    {key: 'trainer', label: 'Trainers'},
    {key: 'boarding', label: 'Boarding'},
    {key: 'emergency', label: 'Emergency'},
  ];

  const filteredProviders = filterProviders(providers);

  return (
    <View style={styles.container}>
      <Header
        title="Service Providers"
        rightComponent={
          <TouchableOpacity onPress={handleLocationSearch}>
            <Icon name="my-location" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Search Bar */}
        <Input
          placeholder="Search providers, locations, or specialties..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
          rightIcon={searchQuery ? "clear" : undefined}
          onRightIconPress={() => setSearchQuery('')}
        />

        {/* Service Type Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {serviceTypes.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.filterTab,
                selectedType === type.key && styles.filterTabActive,
              ]}
              onPress={() => setSelectedType(type.key)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedType === type.key && styles.filterTabTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Top Rated Providers */}
        {!searchQuery && selectedType === 'all' && topRatedProviders && topRatedProviders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Rated Providers</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {topRatedProviders.slice(0, 5).map((provider: ServiceProvider) => (
                <TouchableOpacity
                  key={provider.id}
                  style={styles.topProviderCard}
                  onPress={() => handleProviderPress(provider.id)}
                >
                  <View style={[
                    styles.topProviderIcon,
                    {backgroundColor: `${getProviderColor(provider.serviceType)}20`}
                  ]}>
                    <Icon 
                      name={getProviderIcon(provider.serviceType)} 
                      size={20} 
                      color={getProviderColor(provider.serviceType)} 
                    />
                  </View>
                  <Text style={styles.topProviderName} numberOfLines={2}>
                    {provider.businessName}
                  </Text>
                  <View style={styles.topProviderRating}>
                    {renderStars(provider.rating)}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Providers List */}
        {filteredProviders && filteredProviders.length > 0 ? (
          <>
            {filteredProviders.map((provider: ServiceProvider) => (
              <Card 
                key={provider.id} 
                style={styles.providerCard}
                onPress={() => handleProviderPress(provider.id)}
              >
                <View style={styles.providerHeader}>
                  <View style={[
                    styles.providerIcon,
                    {backgroundColor: `${getProviderColor(provider.serviceType)}20`}
                  ]}>
                    <Icon 
                      name={getProviderIcon(provider.serviceType)} 
                      size={28} 
                      color={getProviderColor(provider.serviceType)} 
                    />
                  </View>
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName}>{provider.businessName}</Text>
                    <Text style={styles.providerType}>
                      {formatServiceType(provider.serviceType)}
                    </Text>
                    {provider.city && provider.state && (
                      <Text style={styles.providerLocation}>
                        {provider.city}, {provider.state}
                      </Text>
                    )}
                  </View>
                  <View style={styles.providerActions}>
                    {provider.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <Icon name="verified" size={16} color={theme.colors.success} />
                      </View>
                    )}
                    <Icon 
                      name="chevron-right" 
                      size={24} 
                      color={theme.colors.textMuted} 
                    />
                  </View>
                </View>
                
                {provider.specialties && provider.specialties.length > 0 && (
                  <View style={styles.specialties}>
                    <Text style={styles.specialtiesLabel}>Specialties:</Text>
                    <Text style={styles.specialtiesText} numberOfLines={2}>
                      {provider.specialties.join(', ')}
                    </Text>
                  </View>
                )}
                
                <View style={styles.providerFooter}>
                  {provider.rating && (
                    <View style={styles.providerRating}>
                      <View style={styles.stars}>
                        {renderStars(provider.rating)}
                      </View>
                      <Text style={styles.ratingText}>
                        {provider.rating.toFixed(1)} ({provider.reviewCount || 0} reviews)
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.providerDetails}>
                    {provider.phoneNumber && (
                      <View style={styles.detailItem}>
                        <Icon name="phone" size={16} color={theme.colors.textMuted} />
                        <Text style={styles.detailText}>Phone available</Text>
                      </View>
                    )}
                    {provider.website && (
                      <View style={styles.detailItem}>
                        <Icon name="language" size={16} color={theme.colors.textMuted} />
                        <Text style={styles.detailText}>Website</Text>
                      </View>
                    )}
                    {provider.subscriptionTier && (
                      <View style={styles.detailItem}>
                        <Icon name="star" size={16} color={theme.colors.warning} />
                        <Text style={[styles.detailText, {color: theme.colors.warning}]}>
                          {provider.subscriptionTier.charAt(0).toUpperCase() + provider.subscriptionTier.slice(1)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Card>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="search-off" size={64} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>
              {searchQuery || selectedType !== 'all' ? 'No providers found' : 'No providers available'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedType !== 'all'
                ? 'Try adjusting your search criteria'
                : 'Service providers will appear here once they join the platform'
              }
            </Text>
          </View>
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
  filterContainer: {
    marginBottom: theme.spacing.lg,
  },
  filterContent: {
    paddingRight: theme.spacing.md,
  },
  filterTab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceLight,
  },
  filterTabActive: {
    backgroundColor: theme.colors.primary,
  },
  filterTabText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  filterTabTextActive: {
    color: theme.colors.white,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  topProviderCard: {
    width: 100,
    marginRight: theme.spacing.md,
    alignItems: 'center',
  },
  topProviderIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  topProviderName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  topProviderRating: {
    flexDirection: 'row',
  },
  providerCard: {
    marginBottom: theme.spacing.md,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  providerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  providerType: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  providerLocation: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  providerActions: {
    alignItems: 'center',
  },
  verifiedBadge: {
    marginBottom: theme.spacing.xs,
  },
  specialties: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
  },
  specialtiesLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  specialtiesText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
    lineHeight: 18,
  },
  providerFooter: {
    marginTop: theme.spacing.sm,
  },
  providerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  stars: {
    flexDirection: 'row',
    marginRight: theme.spacing.sm,
  },
  ratingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  providerDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  detailText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
});

export default ProvidersScreen;