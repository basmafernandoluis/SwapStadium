import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ExchangeDetailsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Détails de l'échange (À implémenter)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 18,
    color: '#666',
  },
});

export default ExchangeDetailsScreen;
