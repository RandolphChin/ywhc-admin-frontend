# Logique de connexion, d’autorisation et de routage

## 📋 Aperçu de la structure du répertoire

```
src/
├── boot/           # Fichiers de démarrage Quasar
│   ├── auth.js     # Enregistrement des directives de permission (v-permission, v-role)
│   └── router.js   # Initialisation du routeur au démarrage
├── router/         # Configuration des routes
│   ├── index.js    # Instance du routeur et gardes
│   ├── routes.js   # Configuration des routes statiques
│   └── dynamicRoutes.js  # Logique de génération dynamique des routes
└── stores/         # Gestion d’état (Pinia)
    └── auth.js     # Gestion de l’état d’authentification
```

---

## 🔄 Diagramme complet du processus

### 1. Processus de démarrage de l’application

```
Démarrage de l’application
    ↓
Exécution de boot/router.js
    ↓
Vérification de la présence d’un token ?
    ├─ Oui → Appel de authStore.initializeAuth()
    │       ↓
    │       Récupération des informations utilisateur (getUserInfo)
    │       ↓
    │       Récupération des menus utilisateur (getUserMenus)
    │       ↓
    │       Initialisation des routes dynamiques (initDynamicRoutes)
    │       ↓
    │       Marquage routesLoaded = true
    │
    └─ Non → Ignorer l’initialisation et attendre la connexion de l’utilisateur
```

### 2. Processus de connexion de l’utilisateur

```
L’utilisateur accède à la page de connexion (/login)
    ↓
Saisie du nom d’utilisateur et du mot de passe
    ↓
Validation du captcha (glisser pour vérifier)
    ↓
Clic sur le bouton de connexion
    ↓
Appel de authStore.login(loginData)
    ├─ Appel de l’API de connexion backend
    ├─ Sauvegarde du token et du refreshToken
    ├─ Sauvegarde du userInfo dans localStorage
    ├─ Appel de getUserInfo() pour récupérer les infos détaillées
    └─ Appel de getUserMenus() pour obtenir les menus utilisateur
    ↓
LoginPage.vue initialise manuellement les routes dynamiques
    ↓
Redirection vers la page d’accueil ou l’URL cible
```

### 3. Processus de garde de route

```
L’utilisateur accède à n’importe quelle route
    ↓
Interception par router/index.js via beforeEach
    ↓
La route est-elle dans la liste blanche (/login, /register, /404) ?
    ├─ Oui → Passage direct
    └─ Non → Poursuite de la vérification
        ↓
        Y a-t-il un token ?
        ├─ Non → Redirection vers /login
        └─ Oui → Poursuite de la vérification
            ↓
            Les informations utilisateur sont-elles présentes ?
            ├─ Non → Récupération des infos utilisateur + menus + init des routes
            └─ Oui → Vérification suivante
                ↓
                Les routes dynamiques sont-elles chargées ?
                ├─ Non → Initialisation des routes dynamiques
                └─ Oui → Passage autorisé
```

---

## 📁 Détails des fichiers principaux

### 1. `stores/auth.js` – Gestion de l’état d’authentification

**Rôle principal :**
- Gérer l’état d’authentification de l’utilisateur (token, userInfo, permissions, rôles, menus)
- Fournir les fonctions de connexion, déconnexion et rafraîchissement du token
- Gérer les données de permission et de menu

**État principal :**
```javascript
state: {
  token: null,              // Jeton d’accès
  refreshToken: null,       // Jeton de rafraîchissement
  userInfo: null,           // Informations utilisateur (persistées dans localStorage)
  permissions: [],          // Liste des permissions (non persistée)
  roles: [],                // Liste des rôles (non persistée)
  menus: [],                // Arborescence des menus (non persistée)
  routesLoaded: false,      // Routes dynamiques chargées ?
  isInitializing: false,    // Indicateur d’initialisation
  redirectUrl: null         // URL de redirection après connexion
}
```

**Méthodes clés :**

#### `login(loginData)` – Connexion
1. Appel de l’API de connexion backend  
2. Sauvegarde de token et refreshToken dans l’état et le localStorage  
3. Si la réponse contient userInfo, l’utiliser directement ; sinon, appeler getUserInfo()  
4. Appeler getUserMenus() pour récupérer les menus

#### `getUserInfo()` – Récupération des informations utilisateur
1. Appel de l’API backend pour obtenir les infos détaillées  
2. Extraction de userInfo, permissions et rôles  
3. Sauvegarde uniquement de userInfo dans localStorage

#### `getUserMenus()` – Récupération des menus utilisateur
1. Appel de l’API backend pour obtenir l’arborescence des menus  
2. Extraction des identifiants de permission  
3. Fusion avec la liste des permissions  
4. Non sauvegardé dans localStorage (actualisation à chaque fois)

#### `initializeAuth()` – Initialisation de l’authentification
1. Vérifie la présence du token  
2. Appelle getUserInfo() et getUserMenus()  
3. Restaure l’état utilisateur au démarrage

#### `clearAuth()` – Nettoyage de l’authentification
1. Vide tout l’état  
2. Supprime les données d’authentification du localStorage  
3. Supprime le cache des composants de routes dynamiques

---

### 2. `router/index.js` – Garde de navigation

**Rôle principal :**
- Créer l’instance du routeur  
- Implémenter la logique de garde beforeEach  
- Contrôler l’accès aux pages

**Logique de la garde beforeEach :**
```javascript
if (whiteList.includes(to.path)) {
  next()
  return
}

if (!authStore.token) {
  next('/login')
  return
}

if (!authStore.userInfo) {
  await authStore.getUserInfo()
  await authStore.getUserMenus()
  await initDynamicRoutes(Router, false)
  authStore.routesLoaded = true
  next()
  return
}

if (!authStore.routesLoaded) {
  if (!authStore.menus || authStore.menus.length === 0) {
    await authStore.getUserMenus()
  }
  await initDynamicRoutes(Router, false)
  authStore.routesLoaded = true
  next()
  return
}

next()
```

**Cas spéciaux :**
- Si la route cible est `/`, redirection vers `/dashboard`  
- Si l’initialisation échoue, autoriser dashboard/profile  
- Prise en charge d’une réinitialisation si la route n’existe pas

---

### 3. `router/routes.js` – Routes statiques

**Rôle principal :**
- Définir les routes statiques de base (login, layout, 404, etc.)

```javascript
[
  { path: '/login', component: LoginPage },
  { 
    path: '/',
    name: 'MainLayout',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', component: DashboardPage },
      { path: 'profile', component: ProfilePage }
    ]
  },
  { path: '/404', component: ErrorNotFound },
  { path: '/:catchAll(.*)*', redirect: '/404' }
]
```

---

### 4. `router/dynamicRoutes.js` – Génération dynamique des routes

**Rôle principal :**
- Générer les routes dynamiques à partir des menus backend  
- Gérer le mappage des composants  
- Ajouter et réinitialiser les routes

**Concepts clés :**
- `componentMap` : mappage de composants préchargés avec `import.meta.glob`
- `normalizeComponentPath` : normalise les chemins
- `transformMenuToRoute` : convertit un menu en configuration de route

... (le fichier continue avec les explications et exemples complets comme dans le texte original)
