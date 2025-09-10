import 'react-native-gesture-handler';
console.warn('🧪 [INDEX-TEST] Starting SwapStadium TEST app (NO Firebase)...');

import { registerRootComponent } from 'expo';

// TEST APP SANS FIREBASE
try {
  console.warn('📱 [INDEX-TEST] About to import TestApp...');
  const TestApp = require('./AppTest').default;
  console.warn('✅ [INDEX-TEST] TestApp imported successfully!');
  
  registerRootComponent(TestApp);
  console.warn('✅ [INDEX-TEST] TestApp registered successfully!');
} catch (error: any) {
  console.warn('💥 [INDEX-TEST] CRITICAL ERROR in test app:', error);
  console.warn('💥 [INDEX-TEST] Error message:', error?.message);
  console.warn('💥 [INDEX-TEST] Error stack:', error?.stack);
  
  // Fallback minimal app
  const { Text, View } = require('react-native');
  const React = require('react');
  
  const FallbackApp = () => React.createElement(View, { style: { flex: 1, justifyContent: 'center', alignItems: 'center' } }, 
    React.createElement(Text, null, 'Error: Test App failed to initialize')
  );
  
  registerRootComponent(FallbackApp);
}
