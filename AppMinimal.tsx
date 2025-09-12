import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

console.warn('🔥 [MINIMAL-APP] Starting ULTRA minimal app...');

export default function MinimalApp() {
  console.warn('🔥 [MINIMAL-APP] MinimalApp component rendered');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 SwapStadium Minimal Test</Text>
      <Text style={styles.subtitle}>Platform: {Platform.OS}</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => {
          console.warn('🔥 [MINIMAL-APP] Button pressed!');
          Alert.alert('Test', 'App fonctionne !');
        }}
      >
        <Text style={styles.buttonText}>Test Simple</Text>
      </TouchableOpacity>
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#dc2626',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#059669',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
