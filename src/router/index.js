/**
 * ======================================================================
 * 📁 MODULE : src/router/index.js
 * 🧩 RÔLE  : Point d’entrée principal du système de routage Vue / Quasar
 * 🔗 LIÉ À : authGuard.js | dynamicRoutes.js | routes.js
 * 🌍 Version i18n : les messages sont traduits via clés de langue
 * ======================================================================
 *
 * 🧭 FONCTION :
 * -------------
 * Ce fichier initialise et configure le **routeur principal** de l’application.
 * Il assemble :
 *   • les **routes statiques** définies dans `routes.js`
 *   • les **routes dynamiques** injectées après authentification
 *     via `dynamicRoutes.js`
 *
 * Le routeur constitue le cœur de la navigation de l’application.
 * Il gère la logique d’accès, les redirections et les transitions
 * entre pages.
 *
 * ---------------------------------------------------------------
 * ⚙️  FONCTIONNEMENT GÉNÉRAL :
 * ---------------------------------------------------------------
 * 1️⃣ Initialisation :
 *     - Crée une instance de `vue-router` via Quasar Wrapper.
 *     - Sélectionne automatiquement le mode d’historique (`history` / `hash`)
 *       selon la configuration du build Quasar (`VUE_ROUTER_MODE`).
 *     - Définit un comportement de défilement qui revient toujours en haut
 *       (`scrollBehavior: () => ({ left: 0, top: 0 })`).
 *
 * 2️⃣ Gestion des routes :
 *     - Charge les **routes statiques** (importées depuis `routes.js`).
 *     - Injecte dynamiquement les routes utilisateur après connexion
 *       grâce au module `dynamicRoutes.js`.
 *
 * 3️⃣ Authentification :
 *     - Applique un **garde de navigation (beforeEach)** avant chaque changement de route.
 *     - Ce garde est géré par `authGuard.js`, qui vérifie :
 *         🔒 la présence du token utilisateur
 *         👤 le chargement des informations de profil
 *         📜 la disponibilité des routes dynamiques
 *         🚫 la redirection automatique vers `/login` si non connecté
 *
 * 4️⃣ Gestion des erreurs :
 *     - `Router.onError()` capture toute erreur liée à la navigation.
 *     - Les erreurs sont affichées dans la console (`❌ Erreur de routage`).
 *
 * ---------------------------------------------------------------
 * 🧩  NOTES ET SPÉCIFICITÉS :
 * ---------------------------------------------------------------
 * • Les routes statiques forment la base : elles sont toujours présentes.
 * • Les routes dynamiques sont ajoutées après login sous le layout principal
 *   (`MainLayout.vue`) pour conserver une structure cohérente (menu latéral, en-tête, etc.).
 * • Le délai volontaire (`setTimeout(50)`) dans le garde d’accès garantit
 *   que les routes injectées soient bien enregistrées avant navigation.
 * • L’internationalisation (`i18n`) est supportée : les titres et menus
 *   peuvent être traduits selon la langue active.
 *
 * ---------------------------------------------------------------
 * 📚  SCHÉMA DE FLUX SIMPLIFIÉ :
 * ---------------------------------------------------------------
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │                        NAVIGATION                          │
 *  └─────────────────────────────────────────────────────────────┘
 *          │
 *          ▼
 *   [ beforeEach guard ]
 *          │
 *          ├─▶ Route en liste blanche → accès direct
 *          │
 *          ├─▶ Non authentifié → redirection vers /login
 *          │
 *          ├─▶ Authentifié mais routes non chargées
 *          │      → initDynamicRoutes()
 *          │
 *          ├─▶ Utilisateur connu mais menus absents
 *          │      → getUserMenus() + initDynamicRoutes()
 *          │
 *          └─▶ Sinon → next()
 *
 * ---------------------------------------------------------------
 * 🧱  STRUCTURE ET DÉPENDANCES :
 * ---------------------------------------------------------------
 * • `vue-router`              → moteur de routage SPA
 * • `quasar/wrappers`         → initialisation spécifique à Quasar
 * • `src/router/routes.js`    → configuration des routes statiques
 * • `src/router/dynamicRoutes.js` → génération et injection de routes dynamiques
 * • `src/router/guards/authGuard.js` → vérification d’accès utilisateur
 * • `src/stores/auth.js`      → gestion du token, menus et profil utilisateur
 * • `src/boot/pinia.js`       → instance globale de Pinia pour les stores
 * • `src/i18n`                → traduction des titres et libellés de routes
 *
 * ---------------------------------------------------------------
 * 🧠  RÔLE DU MODULE :
 * ---------------------------------------------------------------
 *   - Point d’entrée du système de navigation
 *   - Initialise le routeur Vue / Quasar
 *   - Applique la garde d’accès centralisée (authGuard)
 *   - Capte et journalise les erreurs de navigation
 *   - Assure la compatibilité entre routes statiques et dynamiques
 * ======================================================================
 */

import { route } from "quasar/wrappers";
import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import { authGuard } from "./guards/authGuard";
import { i18n } from "src/boot/i18n"; // 🌐 instance globale i18n

export default route(function ({ store /*, ssrContext */ }) {
  // 🌍 Utilisation du traducteur global
  const { t } = i18n.global;

  // 🔧 Détermination du mode d’historique selon le build
  const createHistory = process.env.SERVER
    ? createWebHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  // 🧭 Initialisation du routeur Vue
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // 🚦 Application du garde d’accès (route guard)
  Router.beforeEach((to, from, next) => authGuard(to, from, next, Router));

  // ⚠️ Gestion globale des erreurs de navigation (traduite)
  Router.onError((error) => {
    console.error(`❌ ${t("error.router_error")}:`, error);
  });

  return Router;
});

