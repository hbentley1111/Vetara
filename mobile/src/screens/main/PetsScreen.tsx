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

import Header from '@/components/ui/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {apiClient} from '@/services/api';
import {theme} from '@/theme/colors';
import {Pet} from '@/types';

const PetsScreen: React.FC = () => {
  const navigation = useNavigation();

  const {data: pets, isLoading, refetch} = useQuery(
    'pets',
    apiClient.getPets
  );

  const handleAddPet = () => {
    navigation.navigate('AddPet' as never);
  };

  const handlePetPress = (petId: string) => {
    navigation.navigate('PetDetails' as never, {petId} as never);
  };

  const getAgeText = (age: number | null) => {
    if (!age) return 'Age unknown';
    return `${age} year${age !== 1 ? 's' : ''} old`;
  };

  const getPetIcon = (species: string) => {
    switch (species.toLowerCase()) {
      case 'dog':
        return 'pets';
      case 'cat':
        return 'pets';
      default:
        return 'pets';
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="My Pets"
        rightComponent={
          <TouchableOpacity onPress={handleAddPet}>
            <Icon name="add" size={24} color={theme.colors.primary} />
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
        {pets && pets.length > 0 ? (
          <>
            {pets.map((pet: Pet) => (
              <Card 
                key={pet.id} 
                style={styles.petCard}
                onPress={() => handlePetPress(pet.id)}
              >
                <View style={styles.petHeader}>
                  <View style={styles.petAvatar}>
                    <Icon 
                      name={getPetIcon(pet.species)} 
                      size={28} 
                      color={theme.colors.primary} 
                    />
                  </View>
                  <View style={styles.petInfo}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    <Text style={styles.petBreed}>
                      {pet.breed} • {pet.species}
                    </Text>
                    <Text style={styles.petAge}>{getAgeText(pet.age)}</Text>
                  </View>
                  <Icon 
                    name="chevron-right" 
                    size={24} 
                    color={theme.colors.textMuted} 
                  />
                </View>
                
                {pet.medicalNotes && (
                  <View style={styles.medicalNotes}>
                    <Text style={styles.medicalNotesLabel}>Medical Notes:</Text>
                    <Text style={styles.medicalNotesText} numberOfLines={2}>
                      {pet.medicalNotes}
                    </Text>
                  </View>
                )}
                
                <View style={styles.petFooter}>
                  <View style={styles.petDetails}>
                    {pet.weight && (
                      <View style={styles.detailItem}>
                        <Icon name="scale" size={16} color={theme.colors.textMuted} />
                        <Text style={styles.detailText}>{pet.weight} lbs</Text>
                      </View>
                    )}
                    {pet.microchipId && (
                      <View style={styles.detailItem}>
                        <Icon name="memory" size={16} color={theme.colors.textMuted} />
                        <Text style={styles.detailText}>Microchipped</Text>
                      </View>
                    )}
                    {pet.insurancePolicyNumber && (
                      <View style={styles.detailItem}>
                        <Icon name="security" size={16} color={theme.colors.success} />
                        <Text style={[styles.detailText, {color: theme.colors.success}]}>
                          Insured
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
            <Icon name="pets" size={64} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No pets yet</Text>
            <Text style={styles.emptyText}>
              Add your first pet to start managing their health records
            </Text>
            <Button
              title="Add Your First Pet"
              onPress={handleAddPet}
              size="lg"
              icon={<Icon name="add" size={20} color={theme.colors.white} />}
            />
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
  petCard: {
    marginBottom: theme.spacing.md,
  },
  petHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  petAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  petBreed: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  petAge: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  medicalNotes: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
  },
  medicalNotesLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  medicalNotesText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
    lineHeight: 18,
  },
  petFooter: {
    marginTop: theme.spacing.sm,
  },
  petDetails: {
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

export default PetsScreen;