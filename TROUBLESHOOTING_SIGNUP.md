# 🚨 Guide de dépannage - Inscription utilisateur

## Problème : Impossible de créer un nouveau compte

### ✅ Vérifications rapides

1. **Navigation vers l'inscription**
   - Depuis l'écran de connexion, appuyez sur "Créer un compte"
   - Vous devriez arriver sur l'écran d'inscription avec les champs :
     - Nom d'affichage
     - Email
     - Mot de passe
     - Confirmation mot de passe
     - Case "J'accepte les conditions"

2. **Validation des champs**
   - **Nom** : Au moins 2 caractères
   - **Email** : Format valide avec @
   - **Mot de passe** : Au moins 6 caractères
   - **Confirmation** : Identique au mot de passe
   - **Conditions** : Case cochée

### 🔧 Diagnostic Firebase

Utilisez l'outil de diagnostic intégré :
1. Depuis l'écran de connexion
2. Appuyez sur "🔧 Tester Firebase"
3. Vérifiez l'état des services :
   - ✅ Configuration Firebase
   - ✅ Firebase Authentication
   - ✅ Cloud Firestore

### ⚠️ Erreurs courantes et solutions

#### "Firebase app not initialized"
```bash
# Solution : Vérifier la configuration
cd c:\git\SwapStadium
# Vérifier src/services/firebase.ts
```

#### "auth/invalid-api-key"
- **Cause** : Clés Firebase incorrectes
- **Solution** : Mettre à jour `src/services/firebase.ts` avec vos vraies clés
- **Guide** : Suivre `FIREBASE_PREREQUISITES.md`

#### "auth/operation-not-allowed"
- **Cause** : Authentification Email/Password non activée
- **Solution** : 
  1. [Console Firebase](https://console.firebase.google.com)
  2. Authentication → Sign-in method
  3. Activer "Email/Password"

#### "auth/weak-password"
- **Cause** : Mot de passe trop faible
- **Solution** : Au moins 6 caractères

#### "auth/email-already-in-use"
- **Cause** : Email déjà utilisé
- **Solution** : Utiliser un autre email ou se connecter

#### "Network request failed"
- **Cause** : Problème de connexion
- **Solutions** :
  - Vérifier la connexion internet
  - Redémarrer l'app
  - Vérifier les règles de sécurité Firebase

### 🧪 Test manuel d'inscription

1. **Ouvrir l'outil de test Firebase**
   - Écran de connexion → "🔧 Tester Firebase"

2. **Remplir les champs de test**
   ```
   Nom : Test User
   Email : test@swapstadium.com
   Mot de passe : test123456
   ```

3. **Appuyer sur "Tester l'inscription"**
   - ✅ Succès : Firebase fonctionne
   - ❌ Erreur : Voir le message d'erreur détaillé

### 🔥 Configuration Firebase manquante

Si Firebase n'est pas configuré, suivez ces étapes :

#### 1. Créer un projet Firebase
1. [Console Firebase](https://console.firebase.google.com)
2. "Créer un projet"
3. Nom : "SwapStadium"

#### 2. Activer Authentication
1. Authentication → Commencer
2. Sign-in method → Email/Password → Activer

#### 3. Créer Firestore
1. Firestore Database → Créer
2. Mode test → europe-west1

#### 4. Récupérer les clés
1. ⚙️ Paramètres → Général
2. "Vos applications" → Web → Configuration
3. Copier les clés dans `src/services/firebase.ts`

### 📱 Test sur différentes plateformes

#### Expo Go (Développement)
```bash
cd c:\git\SwapStadium
npm start
# Scanner le QR code avec Expo Go
```

#### Build de test
```bash
# Android
eas build --platform android --profile development

# iOS  
eas build --platform ios --profile development
```

### 🔍 Debug avancé

#### Logs Firebase
Ajoutez des logs dans `authService.ts` :
```typescript
console.log('🔥 Tentative d\'inscription:', { email, displayName });
// ... après signUp
console.log('✅ Inscription réussie:', userData);
```

#### Network monitoring
- Ouvrir les outils développeur
- Onglet Network
- Observer les requêtes Firebase

#### État de l'app
Vérifiez dans `useAuth.tsx` :
```typescript
console.log('👤 État utilisateur:', { user, loading });
```

### 📞 Support supplémentaire

Si le problème persiste :

1. **Créer une issue GitHub**
   - Décrire le problème
   - Inclure les messages d'erreur
   - Préciser la plateforme (Android/iOS/Web)

2. **Informations utiles à fournir**
   - Version d'Expo SDK
   - Version de React Native
   - Messages d'erreur complets
   - Captures d'écran

3. **Logs à collecter**
   ```bash
   # Expo logs
   npx expo start --clear
   
   # Build logs
   eas build --platform android --profile development --clear-cache
   ```

### ✅ Checklist de validation

- [ ] Navigation vers l'écran d'inscription fonctionne
- [ ] Tous les champs sont présents
- [ ] Validation côté client fonctionne
- [ ] Firebase est configuré et accessible
- [ ] Authentication Email/Password est activé
- [ ] Firestore est créé avec les bonnes règles
- [ ] Test d'inscription réussi avec l'outil de diagnostic
- [ ] Messages d'erreur clairs en cas d'échec

---

💡 **Conseil** : Commencez toujours par le test Firebase intégré pour identifier rapidement si le problème vient de la configuration ou du code.
