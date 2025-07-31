import React, {useState} from 'react';
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
import {MedicalRecord} from '@/types';

const RecordsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const {data: records, isLoading, refetch} = useQuery(
    'medicalRecords',
    apiClient.getMedicalRecords
  );

  const {data: pets} = useQuery('pets', apiClient.getPets);

  const handleAddRecord = () => {
    navigation.navigate('AddRecord' as never);
  };

  const handleRecordPress = (recordId: string) => {
    navigation.navigate('RecordDetails' as never, {recordId} as never);
  };

  const getRecordIcon = (recordType: string) => {
    switch (recordType) {
      case 'vaccination':
        return 'vaccines';
      case 'checkup':
        return 'health-and-safety';
      case 'surgery':
        return 'medical-services';
      case 'medication':
        return 'medication';
      case 'lab_results':
        return 'science';
      default:
        return 'folder';
    }
  };

  const getRecordColor = (recordType: string) => {
    switch (recordType) {
      case 'vaccination':
        return theme.colors.success;
      case 'checkup':
        return theme.colors.primary;
      case 'surgery':
        return theme.colors.error;
      case 'medication':
        return theme.colors.warning;
      case 'lab_results':
        return theme.colors.info;
      default:
        return theme.colors.textMuted;
    }
  };

  const formatRecordType = (recordType: string) => {
    return recordType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPetName = (petId: string) => {
    const pet = pets?.find(p => p.id === petId);
    return pet?.name || 'Unknown Pet';
  };

  const filterRecords = (records: MedicalRecord[] | undefined) => {
    if (!records) return [];
    if (selectedFilter === 'all') return records;
    return records.filter(record => record.recordType === selectedFilter);
  };

  const recordTypes = [
    {key: 'all', label: 'All Records'},
    {key: 'vaccination', label: 'Vaccinations'},
    {key: 'checkup', label: 'Checkups'},
    {key: 'surgery', label: 'Surgery'},
    {key: 'medication', label: 'Medication'},
    {key: 'lab_results', label: 'Lab Results'},
  ];

  const filteredRecords = filterRecords(records);

  return (
    <View style={styles.container}>
      <Header
        title="Medical Records"
        rightComponent={
          <TouchableOpacity onPress={handleAddRecord}>
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
        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {recordTypes.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.filterTab,
                selectedFilter === type.key && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter(type.key)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === type.key && styles.filterTabTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Records List */}
        {filteredRecords && filteredRecords.length > 0 ? (
          <>
            {filteredRecords.map((record: MedicalRecord) => (
              <Card 
                key={record.id} 
                style={styles.recordCard}
                onPress={() => handleRecordPress(record.id)}
              >
                <View style={styles.recordHeader}>
                  <View style={[
                    styles.recordIcon,
                    {backgroundColor: `${getRecordColor(record.recordType)}20`}
                  ]}>
                    <Icon 
                      name={getRecordIcon(record.recordType)} 
                      size={24} 
                      color={getRecordColor(record.recordType)} 
                    />
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordTitle}>{record.title}</Text>
                    <Text style={styles.recordPet}>
                      {getPetName(record.petId)} • {formatRecordType(record.recordType)}
                    </Text>
                    <Text style={styles.recordDate}>
                      {new Date(record.recordDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <Icon 
                    name="chevron-right" 
                    size={24} 
                    color={theme.colors.textMuted} 
                  />
                </View>
                
                {record.description && (
                  <Text style={styles.recordDescription} numberOfLines={2}>
                    {record.description}
                  </Text>
                )}
                
                <View style={styles.recordFooter}>
                  {record.attachmentUrl && (
                    <View style={styles.recordDetail}>
                      <Icon name="attach-file" size={16} color={theme.colors.textMuted} />
                      <Text style={styles.recordDetailText}>Has attachment</Text>
                    </View>
                  )}
                  {record.providerId && (
                    <View style={styles.recordDetail}>
                      <Icon name="local-hospital" size={16} color={theme.colors.textMuted} />
                      <Text style={styles.recordDetailText}>Provider recorded</Text>
                    </View>
                  )}
                </View>
              </Card>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="folder-open" size={64} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>
              {selectedFilter === 'all' ? 'No medical records' : `No ${selectedFilter} records`}
            </Text>
            <Text style={styles.emptyText}>
              {selectedFilter === 'all' 
                ? 'Add your first medical record to start tracking your pet\'s health'
                : `No ${formatRecordType(selectedFilter).toLowerCase()} records found`
              }
            </Text>
            <Button
              title="Add Medical Record"
              onPress={handleAddRecord}
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
  recordCard: {
    marginBottom: theme.spacing.md,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  recordIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  recordPet: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  recordDate: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
  },
  recordDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  recordFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.xs,
  },
  recordDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  recordDetailText: {
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

export default RecordsScreen;