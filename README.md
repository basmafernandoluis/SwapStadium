# SwapStadium 🏟️⚽

Une plateforme communautaire d'échange de billets de football **sans transaction financière**.

## 🎯 Objectif

SwapStadium permet aux supporters de football d'échanger leurs billets pour :
- Se rapprocher de leurs amis dans le stade
- Obtenir une place plus souhaitable
- Faire des dons de billets à d'autres supporters

## 🛠️ Stack Technique

- **Frontend** : React Native avec Expo
- **Backend** : Firebase (Firestore, Auth, Storage, Functions)
- **Authentification** : Firebase Authentication
- **Base de données** : Firestore (optimisée pour les coûts)
- **Stockage** : Firebase Storage pour les images
- **Notifications** : Firebase Cloud Messaging
- **Langues** : Français, Anglais (internationalisation)

## ✨ Fonctionnalités

### Implémentées dans cette version
- ✅ Système d'authentification complet (inscription/connexion)
- ✅ Interface d'ajout de billets avec modération
- ✅ Moteur de recherche avec filtres
- ✅ Architecture pour système d'échange
- ✅ Système de notation des utilisateurs
- ✅ Internationalisation (FR/EN)
- ✅ Interface responsive et intuitive
- ✅ Avertissements de sécurité intégrés

### À développer (prochaines versions)
- 🔄 Finalisation du système d'échange en temps réel
- 🔄 Notifications push Firebase
- 🔄 Géolocalisation pour les rencontres
- 🔄 Chat intégré entre utilisateurs
- 🔄 Panel d'administration pour modération
- 🔄 Système de vérification d'identité
- 🔄 Analytics et métriques

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn
- Expo CLI
- Compte Firebase

### Configuration Firebase
1. Créez un projet Firebase
2. Activez les services : Authentication, Firestore, Storage
3. Remplacez les clés dans `src/services/firebase.ts`

### Installation
```bash
# Cloner le repository
git clone https://github.com/basmafernandoluis/SwapStadium.git
cd SwapStadium

# Installer les dépendances
npm install

# Démarrer l'application
npm start
```

### Commandes disponibles
```bash
npm start          # Démarrer le serveur de développement
npm run android    # Lancer sur Android
npm run ios        # Lancer sur iOS (nécessite macOS)
npm run web        # Lancer dans le navigateur
```

## 📱 Test de l'Application

L'application peut être testée via :
1. **Expo Go** sur mobile (scan du QR code)
2. **Émulateur Android/iOS**
3. **Navigateur web** (fonctionnalités limitées)

## 🏗️ Architecture du Projet

```
src/
├── components/          # Composants réutilisables
├── hooks/              # Hooks personnalisés (auth, i18n)
├── locales/            # Fichiers de traduction
├── navigation/         # Configuration de navigation
├── screens/            # Écrans de l'application
│   ├── auth/           # Authentification
│   ├── tickets/        # Gestion des billets
│   ├── exchange/       # Système d'échange
│   └── profile/        # Profil utilisateur
├── services/           # Services Firebase
├── types/              # Types TypeScript
└── utils/              # Utilitaires
```

## 🔒 Sécurité et Responsabilité

### Avertissements intégrés
- ⚠️ Aucune transaction financière autorisée
- 🏛️ Rencontres uniquement en lieux publics
- 🔍 Vérification de l'authenticité des billets obligatoire
- 📍 Plateforme non responsable des échanges

### Modération
- Toutes les annonces sont modérées avant publication
- Système de signalement des contenus inappropriés
- Suspension automatique des comptes problématiques

## 💰 Optimisation des Coûts Firebase

- Pagination des requêtes Firestore
- Limitation des lectures/écritures
- Cache local des données fréquentes
- Compression des images uploadées
- Suppression automatique des données expirées

## 🌍 Internationalisation

L'application supporte :
- 🇫🇷 Français (langue par défaut)
- 🇬🇧 Anglais
- Détection automatique de la langue du device

## 📝 Conditions d'Utilisation

- Échanges gratuits uniquement
- Respect de la communauté
- Vérification de l'authenticité des billets
- Responsabilité individuelle des utilisateurs

## 🤝 Contribution

Ce projet est ouvert aux contributions :
1. Fork le repository
2. Créez une branche feature
3. Développez et testez
4. Soumettez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 📞 Support

- Email : support@swapstadium.com
- Issues GitHub : [Créer un ticket](https://github.com/basmafernandoluis/SwapStadium/issues)

## 🎉 Remerciements

Merci à tous les supporters qui font vivre cette communauté d'échange !

---

**SwapStadium** - Échanger, Partager, Supporter ! ⚽🏟️
