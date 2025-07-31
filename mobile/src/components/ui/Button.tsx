import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {theme} from '@/theme/colors';
import {ButtonProps} from '@/types';

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`button_${size}`]];
    
    if (variant === 'outline') {
      baseStyle.push(styles.buttonOutline);
    } else if (variant === 'ghost') {
      baseStyle.push(styles.buttonGhost);
    }
    
    if (disabled) {
      baseStyle.push(styles.buttonDisabled);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`text_${size}`]];
    
    if (variant === 'outline') {
      baseStyle.push(styles.textOutline);
    } else if (variant === 'ghost') {
      baseStyle.push(styles.textGhost);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.textSecondary);
    }
    
    if (disabled) {
      baseStyle.push(styles.textDisabled);
    }
    
    return baseStyle;
  };

  const renderContent = () => (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.white} 
          size="small" 
        />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </View>
  );

  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        disabled={disabled || loading}
        style={getButtonStyle()}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          style={styles.gradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled || loading}
      style={getButtonStyle()}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  button_sm: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  button_md: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  button_lg: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    backgroundColor: theme.colors.slate600,
    opacity: 0.6,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
  },
  text: {
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  text_sm: {
    fontSize: theme.typography.fontSize.sm,
  },
  text_md: {
    fontSize: theme.typography.fontSize.md,
  },
  text_lg: {
    fontSize: theme.typography.fontSize.lg,
  },
  textOutline: {
    color: theme.colors.primary,
  },
  textGhost: {
    color: theme.colors.primary,
  },
  textSecondary: {
    color: theme.colors.white,
  },
  textDisabled: {
    color: theme.colors.slate400,
  },
});

export default Button;