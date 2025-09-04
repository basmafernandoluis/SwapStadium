# 🔥 Prérequis Firebase pour SwapStadium

Ce guide détaille **tous les prérequis Firebase** nécessaires pour faire fonctionner l'application SwapStadium.

## 📋 Vue d'ensemble des services requis

SwapStadium utilise les services Firebase suivants :
- **🔐 Authentication** : Connexion utilisateurs
- **📊 Cloud Firestore** : Base de données NoSQL
- **📁 Cloud Storage** : Stockage d'images
- **📱 Cloud Messaging** : Notifications push (optionnel)
- **📈 Analytics** : Métriques utilisateurs (optionnel)

## 🚀 Étape 1 : Création du projet Firebase

### 1.1 Créer le projet
1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Cliquez sur **"Créer un projet"**
3. Nom du projet : `SwapStadium` (ou votre choix)
4. **Activez Google Analytics** (recommandé)
5. Choisissez votre région (Europe pour GDPR)

### 1.2 Ajouter une application
1. Dans votre projet Firebase, cliquez sur **⚙️ Paramètres du projet**
2. Onglet **"Général"** → **"Vos applications"**
3. Cliquez sur **Web** (icône `</>`), puis **Android** et **iOS**
4. Nom de l'app : `SwapStadium`
5. **Récupérez les configurations** pour chaque plateforme

## 🔐 Étape 2 : Configuration Authentication

### 2.1 Activer Authentication
1. Dans la console Firebase : **Authentication** → **Commencer**
2. Onglet **"Sign-in method"**
3. Activez **"Adresse e-mail/Mot de passe"**
4. **NE PAS** activer le lien de connexion par e-mail

### 2.2 Configuration des domaines autorisés
1. Onglet **"Settings"** → **"Authorized domains"**
2. Ajoutez vos domaines :
   ```
   localhost (déjà présent)
   votre-domaine.com (si vous avez un site web)
   ```

### 2.3 Templates d'emails (Optionnel mais recommandé)
1. Onglet **"Templates"**
2. Personnalisez les emails :
   - **Vérification d'adresse e-mail**
   - **Réinitialisation de mot de passe**
   - Utilisez le nom "SwapStadium" et votre logo

## 📊 Étape 3 : Configuration Cloud Firestore

### 3.1 Créer la base de données
1. **Firestore Database** → **Créer une base de données**
2. Mode : **Commencer en mode test** (temporaire)
3. Localisation : **europe-west1** (ou votre région)

### 3.2 Collections et structure requises
SwapStadium nécessite ces collections :

```javascript
// Collection: users
{
  id: string,                    // UID Firebase
  email: string,                 // Email utilisateur
  displayName: string,           // Nom d'affichage
  verified: boolean,             // Compte vérifié
  rating: number,                // Note moyenne (0-5)
  totalExchanges: number,        // Nombre d'échanges
  createdAt: Timestamp,          // Date création
  updatedAt: Timestamp,          // Dernière mise à jour
  profileImage?: string,         // URL photo profil
  phone?: string,                // Téléphone (optionnel)
  bio?: string                   // Biographie (optionnel)
}

// Collection: tickets
{
  id: string,                    // ID unique billet
  userId: string,                // ID utilisateur propriétaire
  type: 'exchange' | 'donation', // Type d'offre
  match: {
    homeTeam: string,            // Équipe domicile
    awayTeam: string,            // Équipe visiteur
    date: Timestamp,             // Date du match
    stadium: string,             // Nom du stade
    competition: string          // Compétition (Ligue 1, etc.)
  },
  seat: {
    section: string,             // Tribune/Section
    row?: string,                // Rangée
    number?: string              // Numéro de siège
  },
  price?: {
    original: number,            // Prix d'origine
    desired?: number             // Prix souhaité (échange)
  },
  description: string,           // Description
  images: string[],              // URLs des photos
  status: 'available' | 'reserved' | 'completed', // Statut
  createdAt: Timestamp,
  updatedAt: Timestamp,
  expiresAt: Timestamp           // Date d'expiration
}

// Collection: exchanges
{
  id: string,                    // ID échange
  ticketId: string,              // ID billet
  fromUserId: string,            // ID demandeur
  toUserId: string,              // ID propriétaire
  status: 'pending' | 'accepted' | 'declined' | 'completed',
  message?: string,              // Message du demandeur
  createdAt: Timestamp,
  updatedAt: Timestamp,
  meetingDetails?: {             // Détails de rencontre
    location: string,
    date: Timestamp,
    notes: string
  }
}

// Collection: ratings
{
  id: string,                    // ID notation
  fromUserId: string,            // Qui note
  toUserId: string,              // Qui est noté
  exchangeId: string,            // ID de l'échange
  rating: number,                // Note 1-5
  comment?: string,              // Commentaire
  createdAt: Timestamp
}

// Collection: reports (Signalements)
{
  id: string,
  reporterId: string,            // Qui signale
  reportedUserId?: string,       // Utilisateur signalé
  reportedTicketId?: string,     // Billet signalé
  reason: string,                // Raison du signalement
  description: string,           // Description
  status: 'pending' | 'reviewed' | 'resolved',
  createdAt: Timestamp
}
```

### 3.3 Règles de sécurité Firestore
1. **Firestore Database** → **Règles**
2. Remplacez les règles par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les utilisateurs
    match /users/{userId} {
      allow read: if true; // Les profils sont publics
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Règles pour les billets
    match /tickets/{ticketId} {
      allow read: if true; // Les billets sont publics
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Règles pour les échanges
    match /exchanges/{exchangeId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.fromUserId || 
         request.auth.uid == resource.data.toUserId);
      allow create: if request.auth != null && request.auth.uid == request.resource.data.fromUserId;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.fromUserId || 
         request.auth.uid == resource.data.toUserId);
    }
    
    // Règles pour les notations
    match /ratings/{ratingId} {
      allow read: if true; // Les notes sont publiques
      allow create: if request.auth != null && request.auth.uid == request.resource.data.fromUserId;
    }
    
    // Règles pour les signalements
    match /reports/{reportId} {
      allow create: if request.auth != null && request.auth.uid == request.resource.data.reporterId;
      allow read: if false; // Seuls les admins peuvent lire
    }
  }
}
```

### 3.4 Index composites requis
Créez ces index pour optimiser les requêtes :

1. **Collection** : `tickets`
   - **Champs** : `status` (Croissant), `match.date` (Croissant)
   - **Champs** : `type` (Croissant), `createdAt` (Décroissant)
   - **Champs** : `match.stadium` (Croissant), `status` (Croissant)

2. **Collection** : `exchanges`
   - **Champs** : `toUserId` (Croissant), `status` (Croissant), `createdAt` (Décroissant)
   - **Champs** : `fromUserId` (Croissant), `status` (Croissant), `createdAt` (Décroissant)

## 📁 Étape 4 : Configuration Cloud Storage

### 4.1 Créer le bucket de stockage
1. **Storage** → **Commencer**
2. Mode : **Commencer en mode test**
3. Localisation : **europe-west1** (même que Firestore)

### 4.2 Structure des dossiers
Organisez le stockage ainsi :
```
swapstadium.firebasestorage.app/
├── users/
│   ├── {userId}/
│   │   ├── profile.jpg
│   │   └── documents/
├── tickets/
│   ├── {ticketId}/
│   │   ├── main.jpg
│   │   ├── seat_view.jpg
│   │   └── verification.jpg
└── temp/
    └── uploads/
```

### 4.3 Règles de sécurité Storage
1. **Storage** → **Règles**
2. Remplacez par :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Photos de profil utilisateur
    match /users/{userId}/{allPaths=**} {
      allow read: if true; // Photos publiques
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Photos de billets
    match /tickets/{ticketId}/{allPaths=**} {
      allow read: if true; // Photos publiques
      allow write: if request.auth != null; // Seuls les utilisateurs connectés
    }
    
    // Dossier temporaire
    match /temp/{allPaths=**} {
      allow write: if request.auth != null && 
        request.resource.size < 5 * 1024 * 1024; // Limite 5MB
      allow read: if request.auth != null;
    }
  }
}
```

## 📱 Étape 5 : Configuration Cloud Messaging (Optionnel)

### 5.1 Activer Cloud Messaging
1. **Cloud Messaging** → **Commencer**
2. Générez les clés serveur

### 5.2 Configuration pour Android
1. Téléchargez **google-services.json**
2. Placez-le dans `android/app/`

### 5.3 Configuration pour iOS
1. Téléchargez **GoogleService-Info.plist**
2. Placez-le dans `ios/SwapStadium/`

## ⚙️ Étape 6 : Configuration de votre application

### 6.1 Fichier de configuration
Mettez à jour `src/services/firebase.ts` avec vos vraies clés :

```typescript
const firebaseConfig = {
  apiKey: "votre-api-key",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.firebasestorage.app",
  messagingSenderId: "votre-sender-id",
  appId: "votre-app-id",
  measurementId: "votre-measurement-id" // Si Analytics activé
};
```

### 6.2 Variables d'environnement (Recommandé)
1. Créez `.env` :
```env
EXPO_PUBLIC_FIREBASE_API_KEY=votre-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=votre-projet-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=votre-projet.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=votre-app-id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=votre-measurement-id
```

2. Ajoutez `.env` à `.gitignore`

3. Mettez à jour `firebase.ts` :
```typescript
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};
```

## 🔒 Étape 7 : Sécurité et production

### 7.1 Restrictions API
1. **Paramètres du projet** → **Général**
2. **Restrictions pour les clés API**
3. Limitez l'API Key à vos domaines :
   - `localhost:*` (développement)
   - `*.expo.dev` (Expo Go)
   - `votre-domaine.com` (production)

### 7.2 Mode production Firestore
1. **Firestore** → **Règles**
2. Modifiez la date d'expiration du mode test
3. Implémentez des règles de sécurité strictes

### 7.3 Monitoring et alertes
1. Activez **Firebase Performance Monitoring**
2. Configurez **Crashlytics** pour les rapports d'erreur
3. Définissez des **alertes budgétaires**

## 📊 Étape 8 : Données de test (Optionnel)

### 8.1 Créer des données exemple
Pour tester l'application, créez :

```javascript
// Exemple d'utilisateur de test
{
  email: "test@swapstadium.com",
  displayName: "Jean Dupont",
  verified: true,
  rating: 4.5,
  totalExchanges: 12
}

// Exemple de billet de test
{
  type: "exchange",
  match: {
    homeTeam: "PSG",
    awayTeam: "Marseille",
    date: "2025-03-15T21:00:00Z",
    stadium: "Parc des Princes",
    competition: "Ligue 1"
  },
  seat: {
    section: "Tribune Boulogne",
    row: "C",
    number: "15"
  },
  description: "Excellent billet, vue dégagée",
  status: "available"
}
```

## ✅ Checklist finale

### Configuration Firebase
- [ ] Projet Firebase créé
- [ ] Authentication activé (Email/Password)
- [ ] Firestore configuré avec règles de sécurité
- [ ] Storage configuré avec règles de sécurité
- [ ] Index composites créés
- [ ] Cloud Messaging configuré (optionnel)

### Configuration application
- [ ] Clés Firebase mises à jour
- [ ] Variables d'environnement configurées
- [ ] Fichiers de configuration mobile ajoutés
- [ ] Restrictions API définies

### Test et sécurité
- [ ] Données de test créées
- [ ] Règles de sécurité testées
- [ ] Mode production activé
- [ ] Monitoring configuré

## 🆘 Dépannage courant

### Erreur "Firebase app not initialized"
- Vérifiez que `firebase.ts` est importé avant utilisation
- Vérifiez la configuration des clés

### Erreur "Permission denied" Firestore
- Vérifiez les règles de sécurité
- Assurez-vous que l'utilisateur est authentifié

### Erreur "Storage bucket not found"
- Vérifiez le nom du bucket dans la configuration
- Assurez-vous que Storage est activé

### Erreur de build
- Vérifiez que les fichiers de config mobile sont présents
- Assurez-vous que les packages Firebase sont installés

## 📞 Ressources utiles

- [Documentation Firebase](https://firebase.google.com/docs)
- [Console Firebase](https://console.firebase.google.com)
- [Pricing Firebase](https://firebase.google.com/pricing)
- [Status Firebase](https://status.firebase.google.com)

---

**🎯 Une fois cette configuration terminée, SwapStadium sera entièrement fonctionnel !**

*N'oubliez pas de sauvegarder vos clés de configuration et de les garder secrètes.*
