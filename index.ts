// Note: Do NOT import Node-dependent shims here; keep native bundle clean
// IMPORTANT: Patch AsyncStorage on React Native BEFORE anything else runs
// Load AsyncStorage first
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ensure global reference exists for any lib checking global
try {
  if (!(global as any).AsyncStorage) {
    (global as any).AsyncStorage = AsyncStorage;
  }
} catch {}

// Trap RN "Text strings must be rendered" warning to surface better context
try {
  const origError = console.error;
  console.error = function(this: any, ...args: any[]) {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Text strings must be rendered')) {
      origError.call(this, '🧪 [TRACE] Captured raw text warning stack:', new Error().stack?.split('\n').slice(0,10).join('\n'));
    }
    return origError.apply(this, args as any);
  } as any;
} catch {}

// Patch the react-native module export to provide a non-throwing AsyncStorage
const ReactNative = require('react-native');
try {
  const descriptor = Object.getOwnPropertyDescriptor(ReactNative, 'AsyncStorage');
  const canRedefine = !descriptor || descriptor.configurable !== false;
  if (canRedefine) {
    Object.defineProperty(ReactNative, 'AsyncStorage', {
      value: AsyncStorage,
      configurable: true,
      enumerable: true,
      writable: false,
    });
  } else if (!ReactNative.AsyncStorage) {
    // Fallback assignment if property is writable (should not call getter)
    (ReactNative as any).AsyncStorage = AsyncStorage;
  }
  console.warn('✅ [INDEX] AsyncStorage patched on react-native export');
} catch (e) {
  console.warn('⚠️ [INDEX] Failed to patch AsyncStorage on react-native:', e);
}

// Install early console.error trap BEFORE importing App to capture initial warning stacks
try {
  const earlyOrigErr = console.error;
  console.error = function(this: any, ...args: any[]) {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Text strings must be rendered')) {
      earlyOrigErr.call(this, '🧪 [EARLY-TRACE] Raw text warning stack:', new Error().stack?.split('\n').slice(0,12).join('\n'));
    }
    return earlyOrigErr.apply(this, args as any);
  } as any;
} catch {}

// After patching RN, it's safe to import other libs (which may import RN)
import 'react-native-gesture-handler';

import { registerRootComponent } from 'expo';
import React from 'react';

console.warn('🚀 [INDEX] Starting SwapStadium app...');

// DEBUG INSTRUMENTATION: detect raw string children directly under a View causing RN warning
// Will log a stack trace so we can pinpoint the offending component. Remove after fixing.
try {
  const ReactNative = require('react-native');
  const originalCreateElement = React.createElement;
  if (!(global as any).__RAW_TEXT_DEBUG_PATCHED__) {
    (global as any).__RAW_TEXT_DEBUG_PATCHED__ = true;
    React.createElement = function patchedCreateElement(type: any, props: any, ...children: any[]) {
      try {
        if (children?.some(c => typeof c === 'string' && c.trim() !== '') && type !== ReactNative.Text) {
          // Auto-wrap raw strings into <Text> to prevent RN warning
          children = children.map(c => typeof c === 'string' && c.trim() !== ''
            ? React.createElement(ReactNative.Text, null, c)
            : c
          );
        }
      } catch {}
      return (originalCreateElement as any)(type, props, ...children);
    } as any;
  }
} catch {}

try {
  console.warn('📱 [INDEX] Importing main App component...');
  const App = require('./App').default;
  
  console.warn('✅ [INDEX] App imported successfully, registering...');
  registerRootComponent(App);
  console.warn('✅ [INDEX] App registered successfully!');
} catch (error: any) {
  console.warn('💥 [INDEX] CRITICAL ERROR in app initialization:', error);
  console.warn('💥 [INDEX] Error message:', error?.message);
  console.warn('💥 [INDEX] Error stack:', error?.stack);
  
  // Fallback minimal app
  const { Text, View } = require('react-native');
  const React = require('react');
  
  const FallbackApp = () => React.createElement(View, { 
    style: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: 'red' 
    } 
  }, 
    React.createElement(Text, { 
      style: { 
        color: 'white', 
        fontSize: 20,
        textAlign: 'center',
        padding: 20
      } 
    }, 'Erreur: Impossible de démarrer l\'application - Vérifiez les logs')
  );
  
  registerRootComponent(FallbackApp);
}
