# Configuration Firebase pour SwapStadium

## 1. Création du projet Firebase

1. Rendez-vous sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet"
3. Nommez votre projet "SwapStadium" (ou selon votre préférence)
4. Activez Google Analytics (optionnel)

## 2. Configuration des services

### Authentication
1. Dans la console Firebase, allez dans "Authentication"
2. Cliquez sur "Commencer"
3. Dans l'onglet "Sign-in method", activez :
   - Email/Mot de passe
   - (Optionnel) Google, Facebook selon vos besoins

### Firestore Database
1. Allez dans "Firestore Database"
2. Cliquez sur "Créer une base de données"
3. Commencez en mode test (règles seront configurées plus tard)
4. Choisissez une localisation proche de vos utilisateurs

### Storage
1. Allez dans "Storage"
2. Cliquez sur "Commencer"
3. Commencez en mode test

### Cloud Messaging (Optionnel)
1. Allez dans "Cloud Messaging"
2. Configurez selon vos besoins

## 3. Configuration de l'application

### Ajouter une application Web
1. Dans les paramètres du projet, cliquez sur "Ajouter une application"
2. Sélectionnez "Web" (icône `</>`)
3. Nommez votre application "SwapStadium Web"
4. Copiez la configuration fournie

### Remplacer la configuration
Remplacez les valeurs dans `src/services/firebase.ts` :

```typescript
const firebaseConfig = {
  apiKey: "votre-api-key",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "votre-app-id"
};
```

## 4. Règles de sécurité Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les utilisateurs
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Règles pour les billets
    match /tickets/{ticketId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.userId || isAdmin());
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Règles pour les échanges
    match /exchanges/{exchangeId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.initiatorId || 
         request.auth.uid == resource.data.targetId);
    }
    
    // Règles pour les notations
    match /ratings/{ratingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.raterId;
    }
    
    // Fonction helper pour vérifier les admins
    function isAdmin() {
      return request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
  }
}
```

## 5. Règles de sécurité Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /ticket-images/{imageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.resource.size < 5 * 1024 * 1024 && // 5MB max
        request.resource.contentType.matches('image/.*');
    }
  }
}
```

## 6. Indices Firestore recommandés

Pour optimiser les performances et les coûts, créez ces indices composites :

### Collection: tickets
- `status` (Ascending) + `moderationStatus` (Ascending) + `createdAt` (Descending)
- `category` (Ascending) + `status` (Ascending) + `match.date` (Ascending)
- `match.stadium` (Ascending) + `status` (Ascending) + `createdAt` (Descending)
- `userId` (Ascending) + `status` (Ascending) + `createdAt` (Descending)

### Collection: exchanges
- `initiatorId` (Ascending) + `updatedAt` (Descending)
- `targetId` (Ascending) + `updatedAt` (Descending)
- `status` (Ascending) + `updatedAt` (Descending)

## 7. Optimisation des coûts

### Stratégies implémentées :
- Pagination avec limite de 10 résultats par page
- Cache des données utilisateur
- Requêtes optimisées avec filtres efficaces
- Suppression automatique des données expirées

### Monitoring recommandé :
- Surveillez l'usage quotidien dans la console Firebase
- Configurez des alertes de budget
- Analysez les requêtes les plus coûteuses

## 8. Configuration des notifications (optionnel)

### Web
1. Générez une paire de clés VAPID dans les paramètres Cloud Messaging
2. Ajoutez la clé publique à votre configuration

### Mobile
1. Téléchargez le fichier `google-services.json` (Android)
2. Téléchargez le fichier `GoogleService-Info.plist` (iOS)
3. Configurez selon la documentation Expo

## 9. Variables d'environnement (recommandé)

Créez un fichier `.env` pour sécuriser vos clés :

```
FIREBASE_API_KEY=votre-api-key
FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
FIREBASE_PROJECT_ID=votre-projet-id
FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=votre-app-id
```

Et modifiez `firebase.ts` pour utiliser ces variables.

## 10. Déploiement

### Pour Expo Build
1. Configurez `eas.json` pour les builds
2. Ajoutez les certificats nécessaires
3. Configurez les variables d'environnement pour la production

### Pour Firebase Hosting (landing page)
1. Initialisez Firebase Hosting
2. Déployez votre landing page
3. Configurez le domaine personnalisé si nécessaire

## Support

En cas de problème, consultez :
- [Documentation Firebase](https://firebase.google.com/docs)
- [Documentation Expo](https://docs.expo.dev/)
- Issues GitHub du projet
