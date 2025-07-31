import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {MainTabParamList, RootStackParamList} from '@/types';
import {theme} from '@/theme/colors';

// Tab Screens
import DashboardScreen from '@/screens/main/DashboardScreen';
import PetsScreen from '@/screens/main/PetsScreen';
import RecordsScreen from '@/screens/main/RecordsScreen';
import ProvidersScreen from '@/screens/main/ProvidersScreen';
import InsuranceScreen from '@/screens/main/InsuranceScreen';
import ProfileScreen from '@/screens/main/ProfileScreen';

// Stack Screens
import PetDetailsScreen from '@/screens/pets/PetDetailsScreen';
import AddPetScreen from '@/screens/pets/AddPetScreen';
import RecordDetailsScreen from '@/screens/records/RecordDetailsScreen';
import AddRecordScreen from '@/screens/records/AddRecordScreen';
import ProviderDetailsScreen from '@/screens/providers/ProviderDetailsScreen';
import QRScannerScreen from '@/screens/qr/QRScannerScreen';
import CameraScreen from '@/screens/camera/CameraScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.slate800,
          borderTopColor: theme.colors.slate700,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.slate400,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Pets':
              iconName = 'pets';
              break;
            case 'Records':
              iconName = 'folder';
              break;
            case 'Providers':
              iconName = 'local-hospital';
              break;
            case 'Insurance':
              iconName = 'security';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return (
            <Icon 
              name={iconName} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
          );
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{title: 'Dashboard'}}
      />
      <Tab.Screen 
        name="Pets" 
        component={PetsScreen}
        options={{title: 'My Pets'}}
      />
      <Tab.Screen 
        name="Records" 
        component={RecordsScreen}
        options={{title: 'Records'}}
      />
      <Tab.Screen 
        name="Providers" 
        component={ProvidersScreen}
        options={{title: 'Providers'}}
      />
      <Tab.Screen 
        name="Insurance" 
        component={InsuranceScreen}
        options={{title: 'Insurance'}}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{title: 'Profile'}}
      />
    </Tab.Navigator>
  );
};

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.slate800,
          borderBottomColor: theme.colors.slate700,
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="Main" 
        component={TabNavigator} 
        options={{headerShown: false}}
      />
      <Stack.Screen 
        name="PetDetails" 
        component={PetDetailsScreen}
        options={{title: 'Pet Details'}}
      />
      <Stack.Screen 
        name="AddPet" 
        component={AddPetScreen}
        options={{title: 'Add New Pet'}}
      />
      <Stack.Screen 
        name="RecordDetails" 
        component={RecordDetailsScreen}
        options={{title: 'Medical Record'}}
      />
      <Stack.Screen 
        name="AddRecord" 
        component={AddRecordScreen}
        options={{title: 'Add Record'}}
      />
      <Stack.Screen 
        name="ProviderDetails" 
        component={ProviderDetailsScreen}
        options={{title: 'Provider Details'}}
      />
      <Stack.Screen 
        name="QRScanner" 
        component={QRScannerScreen}
        options={{title: 'Scan QR Code'}}
      />
      <Stack.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{title: 'Take Photo'}}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;