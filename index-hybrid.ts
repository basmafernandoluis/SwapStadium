import 'react-native-gesture-handler';
console.warn('🔥 [INDEX-HYBRID] Starting SwapStadium HYBRID app...');

import { registerRootComponent } from 'expo';

try {
  console.warn('📱 [INDEX-HYBRID] About to import HybridApp...');
  const HybridApp = require('./AppHybrid').default;
  console.warn('✅ [INDEX-HYBRID] HybridApp imported successfully!');
  
  registerRootComponent(HybridApp);
  console.warn('✅ [INDEX-HYBRID] HybridApp registered successfully!');
} catch (error: any) {
  console.warn('💥 [INDEX-HYBRID] CRITICAL ERROR:', error);
  console.warn('💥 [INDEX-HYBRID] Error message:', error?.message);
  console.warn('💥 [INDEX-HYBRID] Error stack:', error?.stack);
  
  // Fallback
  const { Text, View } = require('react-native');
  const React = require('react');
  
  const FallbackApp = () => React.createElement(View, { style: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'orange' } }, 
    React.createElement(Text, { style: { color: 'white', fontSize: 20 } }, 'HYBRID ERROR - Check logs')
  );
  
  registerRootComponent(FallbackApp);
}
