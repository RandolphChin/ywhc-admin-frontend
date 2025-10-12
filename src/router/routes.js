/**
 * ======================================================================
 * 📁 MODULE : src/router/routes.js
 * 🧩 RÔLE  : Déclaration des routes statiques de base de l’application
 * 🔗 LIÉ À : src/router/index.js | src/router/dynamicRoutes.js
 * 🌍 Version i18n : les titres sont traduits via clés de langue
 * ======================================================================
 *
 * ---------------------------------------------------------------
 * 🧠  FONCTION :
 * ---------------------------------------------------------------
 *   - Déclare les routes accessibles sans API
 *   - Sert de socle avant l’injection dynamique
 *   - Gère les redirections 404 et la hiérarchie des layouts
 * 
 * 🧭 OBJECTIFS :
 * -------------
 * Ce module définit la **configuration de base du routeur Vue**.
 * Il contient toutes les routes dites “statiques” — celles qui sont
 * accessibles sans requête API et indépendantes du rôle utilisateur.
 *
 * Ces routes forment le **socle initial** du système de navigation,
 * avant l’injection des routes dynamiques depuis le backend.
 *
 * ---------------------------------------------------------------
 * ⚙️  FONCTIONNEMENT GLOBAL :
 * ---------------------------------------------------------------
 * 1️⃣ Le routeur charge d’abord les routes statiques définies ici :
 *      • /login        → Page publique de connexion
 *      • /             → Layout principal (MainLayout)
 *          ├─ /dashboard → Tableau de bord
 *          └─ /profile   → Profil utilisateur
 *      • /404          → Page d’erreur “non trouvée”
 *
 * 2️⃣ Lorsqu’un utilisateur se connecte :
 *      - Le store `auth` récupère ses menus via API
 *      - Ces menus sont transformés en routes dynamiques
 *        par `dynamicRoutes.js`
 *      - Les nouvelles routes sont injectées sous `MainLayout`
 *
 * 3️⃣ Lorsqu’un utilisateur se déconnecte :
 *      - Les routes dynamiques sont supprimées
 *        via `resetDynamicRoutes()` pour garantir un état propre.
 *
 * ---------------------------------------------------------------
 * 🔧  DÉTAILS TECHNIQUES :
 * ---------------------------------------------------------------
 * - `MainLayout.vue` agit comme le conteneur principal
 *   (sidebar, header, contenu).
 * - Les sous-routes (Dashboard, Profil, etc.) sont affichées
 *   dans son `<router-view>`.
 * - Les titres et libellés sont **internationalisés (i18n)** :
 *   chaque route utilise une clé `meta.title = "routes.xxx"`,
 *   traduite automatiquement selon la langue active.
 * - La route `/:catchAll(.*)*` capture tout chemin inconnu
 *   et redirige vers `/404`.
 *
 * ---------------------------------------------------------------
 * 🧩  RÔLE DE CE MODULE DANS L’ARCHITECTURE :
 * ---------------------------------------------------------------
 * Ce fichier est le **point d’ancrage statique** du système de navigation.
 * Toutes les autres routes (dynamiques, personnalisées, API) viennent
 * s’y greffer au runtime via :
 *   👉 `src/router/dynamicRoutes.js`
 *   👉 `initDynamicRoutes(router)`
 *
 * ---------------------------------------------------------------
 * 📚  RAPPELS IMPORTANTS :
 * ---------------------------------------------------------------
 * - Les routes définies ici sont toujours disponibles, même avant login.
 * - Elles servent à initialiser la structure de base du routeur.
 * - Les routes dynamiques héritent du même layout pour assurer
 *   la cohérence visuelle et la gestion unifiée des permissions.
 * - La route `/404` doit **toujours rester en dernier**.
 *
 * ---------------------------------------------------------------
 * 📎  FICHIERS CONNEXES :
 * ---------------------------------------------------------------
 *   • src/router/index.js         → Création du routeur + garde d’accès
 *   • src/router/dynamicRoutes.js → Injection dynamique depuis le backend
 *   • src/stores/auth.js          → Gestion des tokens, menus, permissions
 *   • src/layouts/MainLayout.vue  → Structure visuelle globale
 *   • src/i18n/fr-FR/index.ts     → Libellés traduits des routes
 *
 * ======================================================================
 */

const routes = [
  /**
   * 🟢 Page de connexion
   * Accessible publiquement, hors authentification.
   */
  {
    path: "/login",
    component: () => import("pages/LoginPage.vue"),
    meta: { title: "routes.login" }, // i18n
  },

  /**
   * 🏠 Mise en page principale
   * Contient les routes enfants authentifiées.
   */
  {
    path: "/",
    name: "MainLayout",
    component: () => import("layouts/MainLayout.vue"),
    redirect: "/dashboard",

    children: [
      /**
       * 📊 Tableau de bord
       */
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("pages/DashboardPage.vue"),
        meta: {
          title: "routes.dashboard", // i18n
          icon: "dashboard",
        },
      },

      /**
       * 👤 Profil utilisateur
       */
      {
        path: "profile",
        name: "Profile",
        component: () => import("pages/ProfilePage.vue"),
        meta: {
          title: "routes.profile", // i18n
          icon: "account_circle",
        },
      },
    ],
  },

  /**
   * 🚫 Page d’erreur 404
   */
  {
    path: "/404",
    component: () => import("pages/ErrorNotFound.vue"),
    meta: { title: "routes.not_found" }, // i18n
  },

    // 
  /**
   * 🚧 À garder absolument en dernier !!!
   * 🔁 Catch-all : redirection vers /404
   * Si aucune route ne correspond, redirection automatique vers la 404
   */
  {
    path: "/:catchAll(.*)*",
    redirect: "/404",
  },
];

export default routes;
