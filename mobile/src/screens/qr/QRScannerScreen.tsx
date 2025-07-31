import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

import {requestCameraPermission} from '@/utils/permissions';
import {theme} from '@/theme/colors';

const {width, height} = Dimensions.get('window');

const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    const permitted = await requestCameraPermission();
    setHasPermission(permitted);
  };

  const handleBarCodeScanned = (data: string) => {
    setScanned(true);
    
    // In a production app, this would parse the QR code data
    // and navigate to the appropriate screen or show pet information
    Alert.alert(
      'QR Code Scanned',
      `QR Code Data: ${data}\n\nIn a production app, this would show pet information or navigate to the pet's profile.`,
      [
        {text: 'Scan Again', onPress: () => setScanned(false)},
        {text: 'Close', onPress: () => navigation.goBack()},
      ]
    );
  };

  const simulateScan = () => {
    // Simulate scanning a pet QR code for demo purposes
    const mockPetData = {
      petId: '1',
      name: 'Buddy',
      species: 'Dog',
      breed: 'Golden Retriever',
      emergencyContact: '+1 (555) 123-4567',
    };
    
    handleBarCodeScanned(JSON.stringify(mockPetData));
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Icon name="camera" size={64} color={theme.colors.textMuted} />
          <Text style={styles.messageText}>Requesting camera permission...</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Icon name="camera-alt" size={64} color={theme.colors.error} />
          <Text style={styles.messageTitle}>Camera Permission Required</Text>
          <Text style={styles.messageText}>
            PetCare Pro needs camera access to scan QR codes. Please enable camera permissions in your device settings.
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={checkCameraPermission}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View Placeholder */}
      <View style={styles.cameraContainer}>
        <LinearGradient
          colors={[theme.colors.background, theme.colors.surface]}
          style={styles.cameraPlaceholder}
        >
          <Icon name="qr-code-scanner" size={100} color={theme.colors.primary} />
          <Text style={styles.placeholderText}>QR Code Scanner</Text>
          <Text style={styles.placeholderSubtext}>
            In a production app, the camera view would appear here
          </Text>
        </LinearGradient>

        {/* Scanning Overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Scan Pet QR Code</Text>
        <Text style={styles.instructionsText}>
          Position the QR code within the scanning area. The pet's information will be displayed once scanned.
        </Text>
        
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Icon name="info" size={20} color={theme.colors.primary} />
            <Text style={styles.featureText}>Instant pet identification</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="emergency" size={20} color={theme.colors.error} />
            <Text style={styles.featureText}>Emergency contact information</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="medical-information" size={20} color={theme.colors.success} />
            <Text style={styles.featureText}>Medical history access</Text>
          </View>
        </View>

        {/* Demo Button */}
        <TouchableOpacity 
          style={styles.demoButton}
          onPress={simulateScan}
        >
          <LinearGradient
            colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
            style={styles.demoButtonGradient}
          >
            <Icon name="qr-code" size={20} color={theme.colors.white} />
            <Text style={styles.demoButtonText}>Simulate QR Scan</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Close Button */}
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="close" size={24} color={theme.colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  messageTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  messageText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  placeholderSubtext: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: theme.colors.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionsContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  instructionsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  instructionsText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  features: {
    marginBottom: theme.spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  featureText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.md,
  },
  demoButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  demoButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  demoButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: theme.spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QRScannerScreen;