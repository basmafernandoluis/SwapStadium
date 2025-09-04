# 🚀 Guide de déploiement SwapStadium

Ce guide vous accompagne dans le déploiement de l'application SwapStadium sur les stores iOS et Android.

## 📋 Prérequis de déploiement

- [ ] Application fonctionnelle en développement
- [ ] Configuration Firebase complète et testée
- [ ] Compte développeur Apple (iOS)
- [ ] Compte développeur Google Play (Android)
- [ ] Expo CLI installé et connecté
- [ ] EAS CLI installé : `npm install -g @expo/eas-cli`

## 🔧 Préparation du build

### 1. Mise à jour des dépendances
```bash
# Mettre à jour les packages compatibles
npx expo install --fix

# Installer les dépendances manquantes si nécessaire
npx expo install react-dom react-native-web @expo/metro-runtime
```

### 2. Configuration EAS Build
```bash
# Initialiser EAS
eas build:configure

# Se connecter à Expo
eas login
```

### 3. Configuration `eas.json`
Créez/modifiez le fichier `eas.json` :
```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "buildConfiguration": "Debug"
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 4. Configuration `app.json` pour production
```json
{
  "expo": {
    "name": "SwapStadium",
    "slug": "swapstadium",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.swapstadium.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "Cette app utilise l'appareil photo pour prendre des photos de billets",
        "NSPhotoLibraryUsageDescription": "Cette app accède à vos photos pour sélectionner des images de billets"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.swapstadium.app",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Cette app utilise l'appareil photo pour scanner les billets"
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Cette app accède à vos photos pour sélectionner des images de billets"
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#2196F3"
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

## 📱 Déploiement Android

### 1. Build APK de test
```bash
# Build de développement
eas build --platform android --profile development

# Build de preview (interne)
eas build --platform android --profile preview
```

### 2. Build de production
```bash
# Build AAB pour Google Play
eas build --platform android --profile production
```

### 3. Configuration Google Play Console

1. **Créer l'application**
   - Connectez-vous à [Google Play Console](https://play.google.com/console)
   - Créez une nouvelle application
   - Nom : "SwapStadium"
   - Langue par défaut : Français

2. **Informations de l'application**
   - Description courte : "Échangez vos billets de football en toute sécurité"
   - Description complète : [Voir modèle ci-dessous](#description-store)
   - Catégorie : Sports
   - Classification : PEGI 3

3. **Assets graphiques**
   - Icône de l'app : 512x512px
   - Images de présentation : 2-8 images (1080x1920px)
   - Bannière feature : 1024x500px

4. **Publication**
   - Upload du fichier AAB
   - Remplir les notes de version
   - Sélectionner "Production" ou "Test interne"

### 4. Commandes de soumission
```bash
# Soumettre directement via EAS
eas submit --platform android

# Ou manual upload sur Google Play Console
```

## 🍎 Déploiement iOS

### 1. Configuration Apple Developer

1. **Compte développeur**
   - Inscrivez-vous sur [Apple Developer](https://developer.apple.com)
   - Créez un App ID : `com.swapstadium.app`

2. **Certificats et provisioning**
   ```bash
   # EAS s'occupe automatiquement des certificats
   eas build --platform ios --profile production
   ```

### 2. Build iOS
```bash
# Build de développement
eas build --platform ios --profile development

# Build de production
eas build --platform ios --profile production
```

### 3. Configuration App Store Connect

1. **Créer l'app**
   - Connectez-vous à [App Store Connect](https://appstoreconnect.apple.com)
   - Mes apps → Nouvelle app
   - Nom : "SwapStadium"
   - Bundle ID : `com.swapstadium.app`

2. **Informations de l'app**
   - Sous-titre : "Échange de billets football"
   - Description : [Voir modèle ci-dessous](#description-store)
   - Mots-clés : "football, billets, échange, stade, sport"
   - Catégorie principale : Sports
   - Classification : 4+

3. **Review Guidelines**
   - Ajoutez des comptes de test
   - Préparez des instructions de review
   - Screenshots obligatoires pour tous les formats

### 4. Soumission
```bash
# Soumettre via EAS
eas submit --platform ios

# Ou upload manuel via Xcode/Transporter
```

## 🖼️ Assets requis pour les stores

### Android (Google Play)
```
assets/store/android/
├── icon.png (512x512)
├── feature-graphic.png (1024x500)
├── screenshots/
│   ├── phone/
│   │   ├── 1-login.png (1080x1920)
│   │   ├── 2-home.png
│   │   ├── 3-search.png
│   │   ├── 4-ticket-details.png
│   │   └── 5-profile.png
│   └── tablet/ (optionnel)
└── promo-video.mp4 (optionnel)
```

### iOS (App Store)
```
assets/store/ios/
├── icon.png (1024x1024)
├── screenshots/
│   ├── iphone-6.7/ (1290x2796)
│   ├── iphone-6.5/ (1242x2688)
│   ├── iphone-5.5/ (1242x2208)
│   ├── ipad-pro-12.9/ (2048x2732)
│   └── ipad-pro-11/ (1668x2388)
└── app-preview.mp4 (optionnel)
```

## 📝 Description store {#description-store}

### Description courte (80 caractères max)
```
Échangez vos billets de football en toute sécurité sans transaction
```

### Description complète
```
🏟️ SwapStadium - L'app d'échange de billets de football

Échangez vos billets de match en toute sécurité avec d'autres supporters ! SwapStadium est la première plateforme communautaire d'échange de billets de football sans transaction financière.

✨ FONCTIONNALITÉS :
• 🎫 Publier vos billets d'échange ou de don
• 🔍 Rechercher des billets par match, stade, section
• 💬 Chat intégré pour organiser les rencontres
• ⭐ Système de notation des utilisateurs
• 🔒 Modération manuelle pour votre sécurité
• 🌍 Interface en français et anglais

🛡️ SÉCURITÉ :
• Aucune transaction financière autorisée
• Rencontres dans des lieux publics recommandées
• Vérification d'identité progressive
• Signalement de contenus inappropriés

🎯 POURQUOI SWAPSTADIUM ?
• Rapprochez-vous de vos amis dans le stade
• Obtenez de meilleures places
• Faites des dons à d'autres supporters
• Créez une communauté solidaire

⚠️ IMPORTANT :
SwapStadium est une plateforme d'échange gratuit. Toute transaction financière est interdite. Vérifiez toujours l'authenticité des billets.

📞 SUPPORT :
Une question ? Contactez-nous : support@swapstadium.app

Rejoignez la communauté SwapStadium ! 🚀⚽
```

## 🔄 Workflow de mise à jour

### 1. Préparation de la mise à jour
```bash
# Mettre à jour la version dans app.json
{
  "expo": {
    "version": "1.0.1",
    "ios": {
      "buildNumber": "2"
    },
    "android": {
      "versionCode": 2
    }
  }
}
```

### 2. Build et déploiement
```bash
# Build des deux plateformes
eas build --platform all --profile production

# Soumission
eas submit --platform all
```

### 3. Notes de version
```
Version 1.0.1 - Améliorations et corrections

🚀 Nouveautés :
• Amélioration des performances de recherche
• Nouvelle interface pour les détails de billets

🐛 Corrections :
• Correction du bug de notification
• Amélioration de la stabilité

🔧 Techniques :
• Mise à jour des dépendances
• Optimisation de la base de données
```

## 📊 Monitoring post-déploiement

### 1. Analytics
- Configurez Firebase Analytics
- Surveillez les crashes avec Crashlytics
- Trackez les conversions (inscriptions, échanges)

### 2. Métriques importantes
- Taux de rétention J1, J7, J30
- Nombre d'échanges réussis
- Temps de session moyen
- Taux de conversion inscription

### 3. Feedback utilisateurs
- Surveillez les reviews sur les stores
- Analysez les rapports de crash
- Collectez les feedbacks in-app

## 🆘 Dépannage déploiement

### Erreurs communes Android
```bash
# Erreur de signing
eas credentials:configure --platform android

# Erreur de permissions
# Vérifiez les permissions dans app.json
```

### Erreurs communes iOS
```bash
# Erreur de certificat
eas credentials:configure --platform ios

# Erreur de provisioning profile
eas build:configure --platform ios
```

### Rejet sur les stores
1. **Crash au démarrage** : Testez sur device physique
2. **Métadonnées** : Vérifiez descriptions et screenshots
3. **Guidelines** : Respectez les règles Apple/Google
4. **Permissions** : Justifiez chaque permission demandée

## ✅ Checklist finale

- [ ] Tests complets sur device physique
- [ ] Configuration Firebase production
- [ ] Assets stores préparés
- [ ] Descriptions rédigées
- [ ] Builds Android et iOS générés
- [ ] Soumission aux stores effectuée
- [ ] Monitoring configuré
- [ ] Plan de promotion établi

---

🎉 **Félicitations !** SwapStadium est maintenant prêt pour le monde !

Pour toute question sur le déploiement : [GitHub Issues](https://github.com/basmafernandoluis/SwapStadium/issues)
