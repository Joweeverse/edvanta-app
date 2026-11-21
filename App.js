import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { FavoritProvider } from './src/context/FavoritContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <FavoritProvider>
        <AppNavigator />
      </FavoritProvider>
    </AuthProvider>
  );
}
