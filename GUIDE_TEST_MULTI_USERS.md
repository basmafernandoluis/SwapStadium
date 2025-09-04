# 🧪 Guide de test multi-utilisateurs - SwapStadium

## 🎯 Objectif
Tester l'application SwapStadium avec plusieurs comptes utilisateurs pour simuler de vrais échanges.

## 📋 Instructions de test

### **1. Préparation**
1. Ouvrez l'application : http://localhost:8083
2. Assurez-vous d'être connecté avec un premier utilisateur

### **2. Test avec le premier utilisateur**
1. ✅ **Créez quelques billets** (2-3 billets minimum)
   - Allez dans l'onglet "➕" (Ajouter)
   - Créez des billets d'échange et de don
   - Variez les équipes et stades

2. ✅ **Vérifiez l'affichage** 
   - Onglet "🎫 Mes billets" : Vos billets créés
   - Onglet "🏠 Accueil" : Billets récents
   - Onglet "🔍 Recherche" : Tous les billets

### **3. Changement d'utilisateur**
1. ✅ **Déconnexion rapide**
   - Allez dans l'onglet "👤 Profil"
   - Cliquez sur "🚀 Déconnexion rapide (Test)"
   - Confirmez la déconnexion

2. ✅ **Nouveau compte**
   - Cliquez sur "Créer un compte"
   - Utilisez un email différent (ex: user2@test.com)
   - Remplissez les informations

### **4. Test avec le deuxième utilisateur**
1. ✅ **Exploration**
   - Vérifiez que vous voyez les billets du premier utilisateur
   - Dans "🔍 Recherche" et "🏠 Accueil"

2. ✅ **Créez d'autres billets**
   - Créez des billets complémentaires
   - Utilisez des équipes/stades différents

3. ✅ **Testez les interactions**
   - Consultez les détails des billets d'autres utilisateurs
   - Vérifiez les informations affichées

### **5. Test avec un troisième utilisateur (optionnel)**
- Répétez les étapes 3-4 avec user3@test.com

## 🎯 Points à vérifier

### **Authentification**
- ✅ Création de compte fonctionne
- ✅ Connexion/déconnexion fluide
- ✅ Informations utilisateur correctes dans le profil

### **Gestion des billets**
- ✅ Création de billets
- ✅ Affichage des billets par utilisateur
- ✅ Visibilité des billets entre utilisateurs
- ✅ Données correctes (date, équipes, places, etc.)

### **Navigation**
- ✅ Tous les onglets fonctionnent
- ✅ Navigation entre écrans fluide
- ✅ Retour en arrière fonctionne

### **Interface utilisateur**
- ✅ Toasts/notifications s'affichent
- ✅ Loading states fonctionnent
- ✅ Erreurs bien gérées

## 🚀 Scénarios avancés

### **Test d'échange simple**
1. **Utilisateur A** : Crée un billet PSG vs OM, Tribune Paris
2. **Utilisateur B** : Crée un billet PSG vs OM, Tribune Boulogne  
3. **Vérification** : Chaque utilisateur peut voir les billets de l'autre

### **Test de recherche**
1. **Créez des billets** avec différents critères
2. **Testez la recherche** par équipe, stade, etc.
3. **Vérifiez** que les résultats sont cohérents

## ✅ Résultat attendu
À la fin des tests, vous devriez avoir :
- 2-3 comptes utilisateurs créés
- 5-10 billets au total dans l'application
- Confirmation que tous les utilisateurs voient les billets des autres
- Interface fonctionnelle et fluide

## 🆘 En cas de problème
- Consultez la console du navigateur (F12)
- Vérifiez l'onglet "📊 Stats" pour les statistiques
- Utilisez les boutons de test en mode développement

---
*Guide mis à jour le 4 septembre 2025*
