import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import LoginScreen from '@/screens/auth/LoginScreen';
import WelcomeScreen from '@/screens/auth/WelcomeScreen';

const Stack = createStackNavigator();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;