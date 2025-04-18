import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { navigationRef } from './src/navigation/Navigator';
import useAuthStore from './src/store/useAuthStore';
import MainNavigator from './src/navigation/Navigator';
import { API_URL } from './src/config/constants';
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() {
  const { checkAuth, user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      await checkAuth();
    };

    initializeApp();
  }, []);

  return (
    <PaperProvider>
      <AuthProvider>
        <NavigationContainer ref={navigationRef}>
          <MainNavigator />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
} 