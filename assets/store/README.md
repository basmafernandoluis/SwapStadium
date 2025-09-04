# 📱 Guide de génération des assets store

Ce dossier contient tous les assets nécessaires pour la publication sur les stores.

## 🖼️ Assets requis

### Android (Google Play Store)
- **Icon** : 512x512px, PNG, pas de transparence
- **Feature Graphic** : 1024x500px, PNG/JPEG
- **Screenshots** : 1080x1920px minimum, PNG/JPEG
- **Promo Video** : MP4, max 30MB (optionnel)

### iOS (App Store)
- **Icon** : 1024x1024px, PNG, pas de transparence
- **Screenshots** : Plusieurs tailles selon les devices
- **App Preview** : MOV/MP4, max 500MB (optionnel)

## 🎨 Guidelines de design

### Couleurs SwapStadium
- **Primaire** : #2196F3 (Bleu)
- **Secondaire** : #4CAF50 (Vert)
- **Accent** : #FF9800 (Orange)
- **Texte** : #333333 (Gris foncé)
- **Background** : #FFFFFF (Blanc)

### Éléments visuels
- Logo du stade stylisé
- Icône d'échange (swap)
- Éléments football (ballon, terrain)
- Interface moderne et claire

## 📐 Templates recommandés

### Icon (512x512 / 1024x1024)
```
┌─────────────────┐
│ 🏟️ SwapStadium │  ← Logo + nom
│                 │
│   ⚽ ↔️ 🎫      │  ← Icônes centrales
│                 │
│                 │
└─────────────────┘
```

### Feature Graphic (1024x500)
```
┌─────────────────────────────────────────────┐
│ 🏟️ SwapStadium                            │
│                                             │
│ "Échangez vos billets de football          │
│  en toute sécurité"                        │
│                                             │
│ [Screenshot app] [Screenshot app]           │
└─────────────────────────────────────────────┘
```

### Screenshots
1. **Écran de connexion** : Interface propre avec logo
2. **Accueil** : Liste des billets disponibles
3. **Recherche** : Filtres et résultats
4. **Détail billet** : Informations complètes
5. **Profil** : Système de notation et historique

## 🛠️ Outils recommandés

### Design
- **Figma** : Design d'interface (gratuit)
- **Canva** : Templates et assets (freemium)
- **GIMP** : Retouche photo (gratuit)
- **Sketch** : Design professionnel (Mac, payant)

### Capture d'écran
- **iOS Simulator** : Pour captures iPhone/iPad
- **Android Emulator** : Pour captures Android
- **Screenshot tools** : Resize automatique

### Génération automatique
```bash
# Expo peut générer certains assets
npx expo install expo-app-icon-utils

# Resize images avec ImageMagick
magick convert icon-1024.png -resize 512x512 icon-512.png
```

## 📋 Checklist assets

### Android
- [ ] app-icon-512.png
- [ ] feature-graphic-1024x500.png
- [ ] screenshot-1-phone.png (1080x1920)
- [ ] screenshot-2-phone.png
- [ ] screenshot-3-phone.png
- [ ] screenshot-4-phone.png
- [ ] screenshot-5-phone.png

### iOS
- [ ] app-icon-1024.png
- [ ] screenshot-1-iphone67.png (1290x2796)
- [ ] screenshot-2-iphone67.png
- [ ] screenshot-3-iphone67.png
- [ ] screenshot-4-iphone67.png
- [ ] screenshot-5-iphone67.png
- [ ] screenshot-1-ipad.png (2048x2732)

## 🎯 Bonnes pratiques

1. **Cohérence visuelle** : Même style sur tous les assets
2. **Lisibilité** : Texte visible même en petit
3. **Localisation** : Assets en français pour le marché principal
4. **Qualité** : Images nettes et haute résolution
5. **Brand identity** : Respecter la charte graphique

## 📞 Ressources

- [Android Asset Guidelines](https://developer.android.com/google-play/resources/icon-design-specifications)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Icons](https://material.io/icons/)
- [App Store Screenshot Sizes](https://help.apple.com/app-store-connect/#/devd274dd925)
