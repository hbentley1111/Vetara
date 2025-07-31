import {Platform, Alert, Linking} from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  request,
  check,
  openSettings,
} from 'react-native-permissions';

export const PERMISSION_TYPES = {
  CAMERA: Platform.select({
    ios: PERMISSIONS.IOS.CAMERA,
    android: PERMISSIONS.ANDROID.CAMERA,
  }),
  PHOTO_LIBRARY: Platform.select({
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
    android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
  }),
  LOCATION: Platform.select({
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  }),
} as const;

export const requestPermission = async (permission: any): Promise<boolean> => {
  try {
    const result = await request(permission);
    return result === RESULTS.GRANTED;
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};

export const checkPermission = async (permission: any): Promise<boolean> => {
  try {
    const result = await check(permission);
    return result === RESULTS.GRANTED;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
};

export const requestCameraPermission = async (): Promise<boolean> => {
  const permission = PERMISSION_TYPES.CAMERA;
  if (!permission) return false;

  const hasPermission = await checkPermission(permission);
  if (hasPermission) return true;

  const granted = await requestPermission(permission);
  if (!granted) {
    Alert.alert(
      'Camera Permission Required',
      'PetCare Pro needs camera access to take photos of medical records and pet profiles.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Open Settings', onPress: openSettings},
      ]
    );
  }

  return granted;
};

export const requestPhotoLibraryPermission = async (): Promise<boolean> => {
  const permission = PERMISSION_TYPES.PHOTO_LIBRARY;
  if (!permission) return false;

  const hasPermission = await checkPermission(permission);
  if (hasPermission) return true;

  const granted = await requestPermission(permission);
  if (!granted) {
    Alert.alert(
      'Photo Library Permission Required',
      'PetCare Pro needs photo library access to select images for medical records and pet profiles.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Open Settings', onPress: openSettings},
      ]
    );
  }

  return granted;
};

export const requestLocationPermission = async (): Promise<boolean> => {
  const permission = PERMISSION_TYPES.LOCATION;
  if (!permission) return false;

  const hasPermission = await checkPermission(permission);
  if (hasPermission) return true;

  const granted = await requestPermission(permission);
  if (!granted) {
    Alert.alert(
      'Location Permission Required',
      'PetCare Pro needs location access to find nearby veterinary providers.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Open Settings', onPress: openSettings},
      ]
    );
  }

  return granted;
};