# 🔧 GUIDE TECHNIQUE - SwapStadium

Guide complet pour développer et maintenir l'application SwapStadium.

---

## 🏗️ ARCHITECTURE GLOBALE

### 📋 Vue d'Ensemble
SwapStadium est une **application React Native hybride** utilisant une architecture Firebase modulaire pour supporter web et mobile.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │     Web App     │    │  Firebase BaaS  │
│   (React Native)│    │  (React Native  │    │   (Auth, DB,    │
│   Firebase v8   │◄──►│     Web)        │◄──►│   Storage)      │
│   Expo Go       │    │   Firebase v10  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔧 Stack Technique

#### Frontend
- **React Native** : Framework mobile cross-platform
- **Expo SDK 53** : Toolchain et runtime
- **TypeScript** : Typage statique complet
- **React Navigation v6** : Navigation native

#### Backend (BaaS)
- **Firebase v10** : Backend-as-a-Service moderne  
- **Firebase v8 Compat** : Compatibilité mobile Expo
- **Firestore** : Base de données NoSQL
- **Firebase Auth** : Authentification utilisateurs

#### Development & Build
- **Metro Bundler** : JavaScript bundler React Native
- **EAS Build** : Cloud build service Expo
- **Expo Go** : App développement mobile
- **Git + GitHub** : Versioning et collaboration

---

## 📱 SERVICE FIREBASE HYBRIDE

### 🎯 Concept Clé
Le **service Firebase hybride** est l'innovation principale permettant la compatibilité web/mobile.

### 📄 Architecture (`firebaseHybrid.ts`)

```typescript
// Détection automatique de plateforme
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // Firebase v10 moderne pour web
  const { initializeApp } = await import('firebase/app');
  const { getAuth } = await import('firebase/auth');
} else {
  // Firebase v8 compat pour mobile Expo
  import firebase from 'firebase/compat/app';
  import 'firebase/compat/auth';
}
```

### 🔧 Configuration

#### Web (Firebase v10)
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// API moderne et modulaire
const userCredential = await signInWithEmailAndPassword(auth, email, password);
```

#### Mobile (Firebase v8 Compat)
```typescript
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// API classique compatible Expo
const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
```

### ✅ Avantages
- **Compatibilité universelle** web/mobile
- **Firebase v10** moderne pour web
- **Stabilité Expo Go** avec v8 compat
- **Interface unifiée** pour l'app
- **Maintenabilité** centralisée

---

## 📱 DÉVELOPPEMENT MOBILE

### 🚀 Setup Développement

#### 1. Installation Environment
```bash
# Node.js et npm
node --version  # v18+
npm --version   # v9+

# Expo CLI global
npm install -g @expo/cli

# Dependencies projet
npm install
```

#### 2. Démarrage Développement
```bash
# Lancer Metro bundler
npx expo start

# Options utiles
npx expo start --clear      # Clear cache
npx expo start --tunnel     # Tunnel pour réseaux complexes
npx expo start --web        # Mode web uniquement
```

#### 3. Test sur Mobile
1. **Installez Expo Go** sur votre smartphone
2. **Scannez le QR code** affiché dans terminal
3. **L'app se lance** avec hot reload automatique

### 📱 Debug Mobile

#### Logs Console
```typescript
// Logs visibles dans Metro terminal
console.warn('🔥 [APP] Debug message visible sur mobile');
console.log('Regular log'); // Peut ne pas apparaître sur mobile

// Convention de logging
console.warn(`🔥 [${componentName}] ${message}`);
```

#### React Native Debugger
```bash
# Alternative au console pour debug avancé
npm install -g react-devtools
react-devtools
```

#### Metro Bundler Logs
- **Hot reload** : Rechargement automatique code
- **Bundle size** : Surveiller taille du bundle
- **Errors** : Erreurs compilation visibles
- **Platform detection** : Web vs Mobile logs

---

## 🔥 FIREBASE CONFIGURATION

### 🔑 Variables Firebase
```typescript
// firebaseHybrid.ts
const firebaseConfig = {
  apiKey: "AIzaSyDrHav53bbyqKGbv7T0heYK94DqyIoRCuM",
  authDomain: "swapstadium-c04d4.firebaseapp.com", 
  projectId: "swapstadium-c04d4",
  storageBucket: "swapstadium-c04d4.firebasestorage.app",
  messagingSenderId: "1038183074069",
  appId: "1:1038183074069:web:3cc0e5b30fbc1b58cc27b9"
};
```

### 🔐 Services Activés

#### Authentication
```bash
# Console Firebase → Authentication → Sign-in method
✅ Email/Password : Activé
🔄 Google : À configurer
🔄 Apple : À configurer (iOS)
```

#### Firestore Database
```bash
# Console Firebase → Firestore Database
✅ Mode test : Activé temporairement
🔄 Rules production : À configurer
🔄 Collections : À créer (billets, users, exchanges)
```

#### Storage
```bash  
# Console Firebase → Storage
✅ Bucket créé : swapstadium-c04d4.firebasestorage.app
🔄 Rules images : À configurer
🔄 Upload images : À implémenter
```

---

## ⚛️ REACT NAVIGATION

### 🧭 Structure Navigation

```typescript
// AppNavigator.tsx
const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 🔗 Navigation Between Screens
```typescript
// Dans un composant screen
import { useNavigation } from '@react-navigation/native';

function HomeScreen() {
  const navigation = useNavigation();
  
  const goToLogin = () => {
    navigation.navigate('Login');
  };
}
```

### 📋 Types Navigation (TypeScript)
```typescript
// types/navigation.ts
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Signup: undefined;
  TicketDetail: { ticketId: string };
};
```

---

## 🏗️ BUILD ET DÉPLOIEMENT

### 📱 Android Build

#### Development Build (EAS)
```bash
# Configuration EAS
npx eas build:configure

# Build Android APK
npx eas build --platform android --profile development
```

#### Production Build
```bash
# Build pour Google Play Store
npx eas build --platform android --profile production

# Upload automatique (optionnel)
npx eas submit --platform android
```

### 🍎 iOS Build (Future)
```bash
# Nécessite Apple Developer Account
npx eas build --platform ios --profile production
npx eas submit --platform ios
```

### 🌐 Web Build
```bash
# Build web statique
npx expo export:web

# Déploiement options
# - Vercel, Netlify, Firebase Hosting
# - GitHub Pages
```

---

## 🧪 TESTING STRATEGY

### 📱 Tests Manuels Mobile
```typescript
// Checklist tests manuels
✅ App startup sur Android Expo Go
✅ Navigation HomeScreen → LoginScreen  
✅ Authentification signup fonctionnelle
✅ Authentification signin fonctionnelle
✅ Hot reload développement
✅ Error handling Firebase
```

### 🧪 Tests Unitaires (À Implémenter)
```bash
# Jest + React Native Testing Library
npm install --save-dev jest @testing-library/react-native

# Tests services Firebase
npm install --save-dev @firebase/rules-unit-testing
```

### 🔧 Tests E2E (À Implémenter)
```bash
# Detox pour React Native
npm install --save-dev detox
```

---

## 🚨 TROUBLESHOOTING

### 🔥 Problèmes Fréquents

#### "App crashes at startup"
```bash
# Solutions :
1. Vérifier compatibilité Firebase mobile
2. Utiliser Expo Go au lieu de Development Build  
3. Clear Metro cache : npx expo start --clear
4. Vérifier API Key Firebase dans firebaseHybrid.ts
```

#### "Firebase API Key not valid"
```bash
# Vérifier configuration Firebase
1. Console Firebase → Project Settings
2. Copier exact API Key dans firebaseHybrid.ts
3. Vérifier que Authentication est activé
```

#### "Metro bundler issues"
```bash
# Clear et restart
npx expo start --clear
# ou
rm -rf node_modules && npm install && npx expo start
```

#### "Hot reload ne marche pas"
```bash
# Vérifier réseau
1. PC et mobile sur même WiFi
2. Firewall autorisant port 8081/19000/19001  
3. Redémarrer Expo Go app
```

### 📊 Debug Performance
```typescript
// Surveiller bundle size
console.log('Bundle loaded:', Date.now());

// Performance React
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log('Render:', id, phase, actualDuration);
}
```

---

## 📚 RESSOURCES TECHNIQUES

### 📖 Documentation Officielle
- **React Native** : https://reactnative.dev/
- **Expo** : https://docs.expo.dev/
- **Firebase** : https://firebase.google.com/docs
- **React Navigation** : https://reactnavigation.org/

### 🛠️ Outils Développement
- **VS Code** : IDE recommandé avec extensions React Native
- **React Native Debugger** : Debug avancé
- **Flipper** : Debug et inspection app
- **EAS CLI** : Build cloud Expo

### 🎓 Formation Continue
- **Expo Snack** : Playground en ligne
- **Firebase Codelabs** : Tutoriels pratiques
- **React Native GitHub** : Exemples et best practices

---

## 🤝 CONTRIBUTION

### 🔄 Workflow Git
```bash
# 1. Créer branche feature
git checkout -b feature/nouvelle-fonctionnalite

# 2. Développer et tester sur mobile
npx expo start  # Tester sur Expo Go

# 3. Commit avec convention
git commit -m "feat: Ajout écran liste billets

- Interface native React Native
- Intégration Firestore 
- Recherche et filtres
- Tests mobile validés"

# 4. Push et Pull Request
git push origin feature/nouvelle-fonctionnalite
```

### 📋 Standards Code
- **TypeScript** obligatoire pour nouveaux fichiers
- **ESLint** : Respecter règles définies
- **Prettier** : Formatage automatique
- **Convention naming** : camelCase composants, kebab-case fichiers

### 🧪 Checklist Pre-Commit
```bash
✅ Code compile sans erreurs TypeScript
✅ Testé sur mobile Expo Go
✅ Logs debug ajoutés si nécessaire
✅ Documentation mise à jour si API changes
✅ Performance vérifiée (bundle size)
```

---

**SwapStadium Technical Guide** - Pour une development experience optimale ! 🚀⚽📱
