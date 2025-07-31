import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useQuery} from 'react-query';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

import Header from '@/components/ui/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {apiClient} from '@/services/api';
import {theme} from '@/theme/colors';

const InsuranceScreen: React.FC = () => {
  const {data: policies, isLoading: policiesLoading, refetch: refetchPolicies} = useQuery(
    'insurancePolicies',
    apiClient.getInsurancePolicies
  );

  const {data: partners, isLoading: partnersLoading, refetch: refetchPartners} = useQuery(
    'insurancePartners',
    apiClient.getInsurancePartners
  );

  const {data: pets} = useQuery('pets', apiClient.getPets);

  const isLoading = policiesLoading || partnersLoading;

  const handleRefresh = () => {
    refetchPolicies();
    refetchPartners();
  };

  const calculateHealthScore = async (petId: string) => {
    try {
      const result = await apiClient.calculateHealthScore(petId);
      console.log('Health score:', result);
    } catch (error) {
      console.error('Failed to calculate health score:', error);
    }
  };

  const getPetName = (petId: string) => {
    const pet = pets?.find(p => p.id === petId);
    return pet?.name || 'Unknown Pet';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? theme.colors.success : theme.colors.error;
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
  };

  const renderHealthScoreCard = () => (
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      style={styles.healthScoreCard}
    >
      <View style={styles.healthScoreHeader}>
        <Icon name="favorite" size={24} color={theme.colors.white} />
        <Text style={styles.healthScoreTitle}>Pet Health Score</Text>
      </View>
      <Text style={styles.healthScoreSubtitle}>
        Calculate your pet's health score for insurance discounts
      </Text>
      <View style={styles.healthScoreFeatures}>
        <View style={styles.featureItem}>
          <Icon name="check-circle" size={16} color={theme.colors.white} />
          <Text style={styles.featureText}>Regular checkups</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="check-circle" size={16} color={theme.colors.white} />
          <Text style={styles.featureText}>Up-to-date vaccinations</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="check-circle" size={16} color={theme.colors.white} />
          <Text style={styles.featureText}>Preventive care</Text>
        </View>
      </View>
      {pets && pets.length > 0 && (
        <Button
          title="Calculate Health Score"
          onPress={() => calculateHealthScore(pets[0].id)}
          variant="secondary"
          size="sm"
          icon={<Icon name="calculate" size={16} color={theme.colors.white} />}
        />
      )}
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <Header title="Insurance" />

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
        {/* Health Score Calculator */}
        {renderHealthScoreCard()}

        {/* Insurance Policies */}
        {policies && policies.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Insurance Policies</Text>
            {policies.map((policy) => (
              <Card key={policy.id} style={styles.policyCard}>
                <View style={styles.policyHeader}>
                  <View style={styles.policyIcon}>
                    <Icon name="security" size={24} color={theme.colors.primary} />
                  </View>
                  <View style={styles.policyInfo}>
                    <Text style={styles.policyProvider}>{policy.provider}</Text>
                    <Text style={styles.policyPet}>
                      {getPetName(policy.petId)} • {policy.coverageType}
                    </Text>
                    <Text style={styles.policyNumber}>
                      Policy #{policy.policyNumber}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    {backgroundColor: getStatusColor(policy.isActive)}
                  ]}>
                    <Text style={styles.statusText}>
                      {getStatusText(policy.isActive)}
                    </Text>
                  </View>
                </View>

                <View style={styles.policyDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Premium:</Text>
                    <Text style={styles.detailValue}>
                      {formatCurrency(policy.premiumAmount)}/month
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Deductible:</Text>
                    <Text style={styles.detailValue}>
                      {formatCurrency(policy.deductible)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Coverage Limit:</Text>
                    <Text style={styles.detailValue}>
                      {formatCurrency(policy.coverageLimit)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Valid Until:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(policy.endDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Card style={styles.section}>
            <View style={styles.emptyPolicies}>
              <Icon name="security" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyTitle}>No Insurance Policies</Text>
              <Text style={styles.emptyText}>
                Add insurance coverage for your pets to protect against unexpected medical costs
              </Text>
            </View>
          </Card>
        )}

        {/* Insurance Partners */}
        {partners && partners.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insurance Partners</Text>
            {partners.map((partner, index) => (
              <Card key={index} style={styles.partnerCard}>
                <View style={styles.partnerHeader}>
                  <View style={styles.partnerIcon}>
                    <Icon name="business" size={24} color={theme.colors.secondary} />
                  </View>
                  <View style={styles.partnerInfo}>
                    <Text style={styles.partnerName}>{partner.name}</Text>
                    <Text style={styles.partnerDescription}>
                      {partner.description}
                    </Text>
                  </View>
                </View>

                <View style={styles.partnerFeatures}>
                  {partner.features?.map((feature: string, idx: number) => (
                    <View key={idx} style={styles.featureItem}>
                      <Icon name="check" size={14} color={theme.colors.success} />
                      <Text style={styles.featureTextDark}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {partner.discountPercentage && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      Up to {partner.discountPercentage}% discount with high health scores
                    </Text>
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}

        {/* Health Score Benefits */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Health Score Benefits</Text>
          <Text style={styles.benefitsDescription}>
            Maintain high health scores through regular care to unlock insurance discounts
          </Text>
          
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <LinearGradient
                colors={[theme.colors.success, '#22c55e']}
                style={styles.benefitIcon}
              >
                <Text style={styles.benefitScore}>90-100</Text>
              </LinearGradient>
              <View style={styles.benefitInfo}>
                <Text style={styles.benefitTitle}>Excellent Health</Text>
                <Text style={styles.benefitDiscount}>Up to 25% discount</Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.benefitIcon}
              >
                <Text style={styles.benefitScore}>80-89</Text>
              </LinearGradient>
              <View style={styles.benefitInfo}>
                <Text style={styles.benefitTitle}>Good Health</Text>
                <Text style={styles.benefitDiscount}>Up to 20% discount</Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <LinearGradient
                colors={[theme.colors.warning, '#f59e0b']}
                style={styles.benefitIcon}
              >
                <Text style={styles.benefitScore}>70-79</Text>
              </LinearGradient>
              <View style={styles.benefitInfo}>
                <Text style={styles.benefitTitle}>Fair Health</Text>
                <Text style={styles.benefitDiscount}>Up to 15% discount</Text>
              </View>
            </View>
          </View>
        </Card>
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
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  healthScoreCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
  },
  healthScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  healthScoreTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
  },
  healthScoreSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.white,
    opacity: 0.9,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  healthScoreFeatures: {
    marginBottom: theme.spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
  },
  featureTextDark: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  policyCard: {
    marginBottom: theme.spacing.md,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  policyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  policyInfo: {
    flex: 1,
  },
  policyProvider: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  policyPet: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  policyNumber: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
  },
  policyDetails: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.slate700,
    paddingTop: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  emptyPolicies: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  partnerCard: {
    marginBottom: theme.spacing.md,
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  partnerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${theme.colors.secondary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  partnerDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  partnerFeatures: {
    marginBottom: theme.spacing.md,
  },
  discountBadge: {
    backgroundColor: `${theme.colors.warning}20`,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  discountText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.warning,
    textAlign: 'center',
  },
  benefitsDescription: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  benefitsList: {
    gap: theme.spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  benefitScore: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  benefitInfo: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  benefitDiscount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});

export default InsuranceScreen;