console.warn('🔥 [INDEX-MINIMAL] Starting ULTRA minimal index...');

import { registerRootComponent } from 'expo';

try {
  console.warn('🔥 [INDEX-MINIMAL] About to import MinimalApp...');
  const MinimalApp = require('./AppMinimal').default;
  console.warn('✅ [INDEX-MINIMAL] MinimalApp imported successfully!');
  
  registerRootComponent(MinimalApp);
  console.warn('✅ [INDEX-MINIMAL] MinimalApp registered successfully!');
} catch (error: any) {
  console.warn('💥 [INDEX-MINIMAL] CRITICAL ERROR:', error);
  console.warn('💥 [INDEX-MINIMAL] Error message:', error?.message);
  console.warn('💥 [INDEX-MINIMAL] Error stack:', error?.stack);
  
  // Ultra fallback
  const { Text, View } = require('react-native');
  const React = require('react');
  
  const FallbackApp = () => React.createElement(View, { style: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'red' } }, 
    React.createElement(Text, { style: { color: 'white', fontSize: 20 } }, 'CRITICAL ERROR - Check logs')
  );
  
  registerRootComponent(FallbackApp);
}
