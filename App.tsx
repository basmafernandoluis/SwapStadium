import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/hooks/useAuth';
import { ToastProvider } from './src/contexts/ToastContext';
import { ErrorProvider } from './src/contexts/ErrorContext';
import { AppNavigator } from './src/navigation/AppNavigator';

// Entrée unique de l'application utilisant désormais le TabNavigator
// (inclut l'onglet "Billets" via PublicTicketsScreen)
export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorProvider>
        <AuthProvider>
          <ToastProvider>
            <AppNavigator />
          </ToastProvider>
        </AuthProvider>
      </ErrorProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
