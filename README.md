# SwapStadium 🏟️⚽

Une plateforme communautaire d'échange de billets de football **sans transaction financière**.

## 🎯 Objectif

SwapStadium permet aux supporters de football d'échanger leurs billets pour :
- Se rapprocher de leurs amis dans le stade
- Obtenir une place plus souhaitable
- Faire des dons de billets à d'autres supporters

## 🛠️ Stack Technique

- **Frontend** : React Native avec Expo SDK 53
- **Backend** : Firebase v10 (avec compatibilité v8 pour mobile)
- **Authentification** : Firebase Authentication (hybride)
- **Base de données** : Firestore (optimisée pour les coûts)
- **Build** : EAS Build pour production Android/iOS
- **Development** : Expo Go + Metro bundler
- **Langues** : TypeScript complet

## ✨ Fonctionnalités

### ✅ Implémentées et Fonctionnelles
- ✅ **Application mobile Android** complètement fonctionnelle
- ✅ **Authentification Firebase** (signup/signin) testée et validée
- ✅ **Interface native React Native** avec navigation fluide
- ✅ **Configuration hybride Firebase** (v8 mobile / v10 web)
- ✅ **Hot reload** en temps réel via Expo Go
- ✅ **Build Android APK** prêt pour distribution
- ✅ **Logs détaillés** pour debugging et monitoring

### 🔄 En cours de développement
- 🔄 Interface d'ajout de billets avec modération
- 🔄 Moteur de recherche avec filtres
- 🔄 Système d'échange en temps réel
- 🔄 Système de notation des utilisateurs
- 🔄 Internationalisation (FR/EN)

### 📋 Planifiées (prochaines versions)
- 📋 Notifications push Firebase
- 📋 Géolocalisation pour les rencontres
- 📋 Chat intégré entre utilisateurs
- 📋 Panel d'administration pour modération

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn
- Expo CLI (`npm install -g @expo/cli`)
- Compte Firebase configuré

### Installation
```bash
# Cloner le repository
git clone https://github.com/basmafernandoluis/SwapStadium.git
cd SwapStadium

# Installer les dépendances
npm install

# Démarrer l'application
npx expo start
```

### 🎯 Test sur Mobile (Recommandé)
1. **Installez Expo Go** sur votre smartphone
2. **Lancez** `npx expo start`
3. **Scannez le QR code** avec Expo Go
4. **L'app démarre** avec authentification fonctionnelle

### 🌐 Test Web
```bash
npx expo start --web  # Navigateur (fonctionnalités limitées)
```

### 📱 Build Production
```bash
# Android APK
npx expo build:android

# iOS (nécessite macOS et Apple Developer Account)
npx expo build:ios
```

## 📱 Architecture Technique

### Structure Firebase Hybride
```typescript
// Web: Firebase v10 (moderne)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Mobile: Firebase v8 compat (stable avec Expo Go)
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
```

### Configuration Multi-plateforme
- **Web** : Firebase v10 modular SDK
- **Mobile** : Firebase v8 compat API  
- **Détection automatique** : Platform.OS
- **Fallback** : Service unifié avec abstraction

## 🏗️ Architecture du Projet

```
SwapStadium/
├── AppHybrid.tsx           # App principale (point d'entrée)
├── firebaseHybrid.ts       # Service Firebase hybride
├── index.ts                # Index principal
├── android/                # Configuration Android native
├── src/
│   ├── components/         # Composants réutilisables
│   ├── hooks/             # Hooks personnalisés
│   ├── navigation/        # React Navigation v6
│   ├── screens/           # Écrans de l'application
│   │   ├── auth/          # LoginScreen, SignupScreen
│   │   ├── home/          # HomeScreen principal
│   │   └── profile/       # Profil utilisateur
│   ├── services/          # Services Firebase multiples
│   ├── types/             # Types TypeScript
│   └── utils/             # Utilitaires
├── package.json           # Dépendances et scripts
├── app.json              # Configuration Expo
├── eas.json              # Configuration EAS Build
└── README.md             # Documentation
```

## 🔧 Configuration Firebase

### Variables d'environnement Firebase
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyDrHav53bbyqKGbv7T0heYK94DqyIoRCuM",
  authDomain: "swapstadium-c04d4.firebaseapp.com",
  projectId: "swapstadium-c04d4",
  storageBucket: "swapstadium-c04d4.firebasestorage.app",
  messagingSenderId: "1038183074069",
  appId: "1:1038183074069:web:3cc0e5b30fbc1b58cc27b9"
};
```

### Services Firebase Activés
- ✅ **Authentication** : Email/Password
- ✅ **Firestore** : Base de données NoSQL
- ✅ **Storage** : Stockage de fichiers
- 🔄 **Functions** : Logique backend (à venir)
- 🔄 **Analytics** : Métriques (à venir)

## 🧪 Tests et Debugging

### Logs de Debug
L'application inclut des logs détaillés pour le debugging :
```typescript
console.warn('🔥 [APP-HYBRID] HomeScreen rendered');
console.warn('🔐 [FIREBASE-HYBRID] Sign in successful!');
console.warn('📱 [FIREBASE-HYBRID] Mobile sign in...');
```

### Tests Fonctionnels Validés
- ✅ **Démarrage app** : OK sur Android via Expo Go
- ✅ **Navigation** : React Navigation fonctionne
- ✅ **Firebase Auth** : Signup/Signin validés
- ✅ **Hot Reload** : Rechargement en temps réel
- ✅ **Platform Detection** : Web/Mobile détecté
- ✅ **Error Handling** : Gestion d'erreurs robuste

## 🚨 Troubleshooting

### Problèmes courants et solutions

**App crash au démarrage :**
- ✅ **Solution** : Utiliser Expo Go au lieu du Development Build
- ✅ **Solution** : Firebase hybride v8/v10 configuré

**Firebase API Key invalid :**
- ✅ **Solution** : API Key corrigée dans firebaseHybrid.ts

**Metro bundler issues :**
- ✅ **Solution** : `npx expo start --clear` pour nettoyer le cache

**Hot Reload ne fonctionne pas :**
- ✅ **Solution** : Vérifier que l'appareil et PC sont sur le même réseau

## 📊 État du Projet

### ✅ Version Actuelle : v1.0-mobile
- **Status** : ✅ FONCTIONNEL sur mobile Android
- **Dernière mise à jour** : 10 septembre 2025
- **Tests** : ✅ Authentification validée
- **Déploiement** : ✅ Prêt pour Expo Go / APK

### 🎯 Prochaines étapes
1. **Interface billets** : Ajout/Recherche/Affichage
2. **Système d'échange** : Logique métier complète
3. **Tests iOS** : Validation sur iPhone
4. **Production** : Déploiement App Store / Play Store

## 🤝 Contribution

Pour contribuer au projet :
1. **Fork** le repository
2. **Créez une branche** : `git checkout -b feature/nouvelle-fonctionnalite`
3. **Développez et testez** sur mobile
4. **Commit** : `git commit -m "Ajout nouvelle fonctionnalité"`
5. **Push** : `git push origin feature/nouvelle-fonctionnalite`
6. **Pull Request** vers la branche main

## 📞 Support et Contact

- **Repository** : [GitHub SwapStadium](https://github.com/basmafernandoluis/SwapStadium)
- **Issues** : [Signaler un bug](https://github.com/basmafernandoluis/SwapStadium/issues)
- **Owner** : basmafernandoluis
- **Contributeur** : nabileon

---

**SwapStadium v1.0-mobile** - Application mobile fonctionnelle avec authentification Firebase ⚽🏟️📱
