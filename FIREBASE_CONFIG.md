# 🔧 Configuration Firebase pour SwapStadium

## 📝 Instructions de configuration

### 1. Règles Firestore (URGENT - pour réparer les permissions)

1. Allez sur https://console.firebase.google.com/project/swapstadium/firestore/rules
2. Remplacez les règles existantes par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles temporaires pour le développement
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Cliquez sur "Publier"

### 2. Index Firestore (pour optimiser les requêtes)

Les erreurs d'index seront résolues automatiquement en créant les index via les liens fournis dans les erreurs :

1. Clic sur le lien dans l'erreur de console
2. Créer l'index automatiquement 
3. Attendre quelques minutes pour la propagation

### 3. Authentification

Vérifiez que l'authentification Email/Password est activée :
1. https://console.firebase.google.com/project/swapstadium/authentication/providers
2. Activer "Email/Password"

### 4. Storage (pour les images)

1. https://console.firebase.google.com/project/swapstadium/storage
2. Créer un bucket de stockage
3. Configurer les règles de sécurité

## 🚀 Test rapide

Une fois les règles modifiées, testez :
1. Création de compte ✅ (déjà fonctionnel)
2. Création de billet ✅ (devrait fonctionner)
3. Chargement des billets ✅ (avec index simplifiés)
