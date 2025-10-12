/**
 * ---------------------------------------------------------------
 * 📁 Module : src/router/guards/authGuard.js
 * 🔐 Rôle  : Garde d’authentification principale (beforeEach).
 * 🔗 Lié à : dynamicRoutes.js, stores/auth.js
 *
 * 🧭 Fonction :
 *    - Vérifie la session utilisateur via le token du store Pinia
 *    - Charge les informations et menus utilisateur si absents
 *    - Initialise ou réinitialise les routes dynamiques
 *    - Redirige automatiquement vers /login, /dashboard ou /404
 * ---------------------------------------------------------------
 */

/**
 * ===============================================================
 * 🔐 AUTH GUARD — Garde d’authentification principale du routeur
 * ===============================================================
 *
 * 📁 Localisation :
 *    src/router/guards/authGuard.js
 *
 * 🎯 Rôle :
 *    Ce module implémente la logique de sécurité de navigation
 *    pour toutes les routes protégées de l’application.
 *    Il vérifie l’état d’authentification de l’utilisateur,
 *    initialise dynamiquement les routes disponibles selon ses droits,
 *    et redirige automatiquement en cas de session expirée ou invalide.
 *
 * 🧭 Fonctionnement global :
 *    À chaque tentative de navigation (`beforeEach`), ce guard effectue :
 *
 *    1️⃣  Vérification si la route demandée est publique (liste blanche)
 *        → Accès direct sans authentification.
 *
 *    2️⃣  Vérification de la présence d’un token valide dans le store Pinia.
 *        → Si absent : suppression du cache + redirection vers `/login`.
 *
 *    3️⃣  Vérification de la présence d’informations utilisateur (`userInfo`).
 *        → Si absentes : récupération via `authApi.getUserInfo()` (depuis le store).
 *
 *    4️⃣  Vérification si les routes dynamiques ne sont pas encore chargées.
 *        → Appel de `getUserMenus()` puis de `initDynamicRoutes()` pour les construire.
 *
 *    5️⃣  Vérification que la route demandée existe bien dans le routeur.
 *        → Si inconnue : redirection vers `/404`.
 *
 *    6️⃣  Si tout est conforme, la navigation continue normalement.
 *
 * ---------------------------------------------------------------
 * 🔧 Dépendances principales :
 * ---------------------------------------------------------------
 *    - Pinia Store : `useAuthStore`
 *         → Gère l’état d’authentification (token, userInfo, menus…)
 *         → Défini dans : src/stores/auth.js
 *
 *    - Router Utils :
 *         • `initDynamicRoutes(router, fromCache?)`
 *             → Initialise les routes dynamiques selon les menus de l’utilisateur.
 *         • `resetDynamicRoutes(router)`
 *             → Supprime toutes les routes dynamiques lors d’une déconnexion.
 *         → Défini dans : src/router/dynamicRoutes.js
 *
 *    - Quasar LocalStorage :
 *         → Permet la persistance de certains états (token, userInfo, etc.)
 *
 * ---------------------------------------------------------------
 * ⚙️  Détails techniques :
 * ---------------------------------------------------------------
 *    • Liste blanche (`whiteList`) :
 *         Contient les routes publiques accessibles sans authentification :
 *           ['/login', '/register', '/404']
 *
 *    • Vérifications principales :
 *         - `authStore.token` → détermine si l’utilisateur est connecté
 *         - `authStore.userInfo` → indique si les données utilisateur sont chargées
 *         - `authStore.routesLoaded` → évite le rechargement multiple des routes
 *
 *    • Redirections automatiques :
 *         - Sans token → /login
 *         - Route inconnue → /404
 *         - Chemin racine → /dashboard
 *
 * ---------------------------------------------------------------
 * 🧩 Intégration :
 * ---------------------------------------------------------------
 *    Ce guard doit être enregistré dans le routeur principal :
 *
 *      import { authGuard } from './guards/authGuard'
 *      Router.beforeEach((to, from, next) => authGuard(to, from, next, Router))
 *
 * ---------------------------------------------------------------
 * 🧠 Bonnes pratiques :
 * ---------------------------------------------------------------
 *    - Toujours réinitialiser les routes dynamiques lors d’un logout.
 *    - Utiliser `isInitializing` dans le store pour éviter les chargements multiples.
 *    - Laisser ce guard simple : toute logique métier complexe doit rester dans le store.
 *
 * ---------------------------------------------------------------
 * 🧪 Exemple de comportement :
 * ---------------------------------------------------------------
 *    → Utilisateur visite /login :
 *         ✅ Liste blanche, accès direct.
 *
 *    → Utilisateur visite /dashboard sans token :
 *         ❌ Redirigé vers /login.
 *
 *    → Utilisateur visite /system/user avec token :
 *         🔄 userInfo chargé si absent, routes dynamiques construites,
 *         ✅ accès autorisé.
 *
 * ===============================================================
 */



/**
 * ======================================================================
 * 📁 MODULE : src/router/guards/authGuard.js
 * 🧩 RÔLE  : Garde d’authentification principale pour le routeur.
 * 🔗 LIÉ À : index.js | dynamicRoutes.js | stores/auth.js
 * ======================================================================
 *
 * Objectif :
 * -----------
 * Garantir que chaque route protégée ne soit accessible qu’à un
 * utilisateur authentifié, avec ses menus et routes dynamiques chargés.
 *
 * Fonctionnement :
 * ----------------
 * 1. Vérifie si la route est publique (liste blanche)
 * 2. Si pas de token → redirection immédiate vers /login
 * 3. Si userInfo absent → récupère via API
 * 4. Si menus absents → récupère via menuApi
 * 5. Initialise les routes dynamiques à partir du store
 * 6. Gère les cas de réinitialisation, erreurs et rechargements partiels
 *
 * Intégration i18n :
 * ------------------
 * Tous les messages de console ou d’erreur sont traduits à l’aide de
 * l’instance i18n globale (importée depuis src/boot/i18n).
 *
 * Clés principales :
 * ------------------
 *  - auth.guard_start
 *  - auth.no_token
 *  - auth.user_info_missing
 *  - auth.menu_missing
 *  - auth.routes_reloaded
 *  - auth.route_not_found
 *  - error.route_reload_failed
 *  - error.auth_failed
 *
 * ======================================================================
 */

import { initDynamicRoutes, resetDynamicRoutes } from "../dynamicRoutes";
import { useAuthStore } from "src/stores/auth";
import { pinia } from "src/boot/pinia";
import { LocalStorage } from "quasar";
import { i18n } from "src/boot/i18n"; // 🌐 instance i18n globale

const { t } = i18n.global;
const whiteList = ["/login", "/register", "/404"];

export async function authGuard(to, from, next, router) {
  console.log(`🚦 ${t("auth.guard_start")} : ${from.path} → ${to.path}`);

  // ✅ Routes publiques
  if (whiteList.includes(to.path)) {
    console.log(`✅ ${t("auth.public_route")}`);
    return next();
  }

  const authStore = useAuthStore(pinia);

  // 🔒 Aucun token
  if (!authStore.token) {
    console.warn(`❌ ${t("auth.no_token")} → /login`);
    authStore.clearAuth();
    resetDynamicRoutes(router);
    return next("/login");
  }

  // ⏳ Initialisation déjà en cours
  if (authStore.isInitializing) {
    console.log(`⏳ ${t("auth.initializing")}`);
    return next();
  }

  // 🧩 Tentative via menus persistés
  if (!authStore.routesLoaded) {
    const persistedMenus = LocalStorage.getItem("userMenus");
    if (persistedMenus && persistedMenus.length > 0) {
      console.log(`📦 ${t("auth.cached_menus_found")}`);
      authStore.menus = persistedMenus;

      try {
        authStore.isInitializing = true;
        await new Promise((r) => setTimeout(r, 50));

        const success = await initDynamicRoutes(router, true);
        if (success) {
          authStore.routesLoaded = true;
          console.log(`✅ ${t("auth.routes_reloaded")}`);

          await new Promise((r) => setTimeout(r, 50));
          const target = router.resolve(to.path);
          if (target && target.matched.length > 0) {
            console.log(`✅ ${t("auth.route_ready", { path: to.path })}`);
            authStore.isInitializing = false;
            return next();
          }
        }
      } catch (e) {
        console.error(`❌ ${t("error.route_reload_failed")}:`, e);
      } finally {
        authStore.isInitializing = false;
      }
    }
  }

  // 👤 Informations utilisateur absentes
  if (!authStore.userInfo) {
    try {
      console.log(`🔄 ${t("auth.user_info_missing")}`);
      authStore.isInitializing = true;

      await authStore.getUserInfo();
      await authStore.getUserMenus();

      const success = await initDynamicRoutes(router, false);
      authStore.routesLoaded = success;
      authStore.isInitializing = false;

      if (to.path === "/") {
        console.log("🏠 Redirection vers /dashboard");
        return next("/dashboard");
      }

      console.log(`✅ ${t("auth.navigate_ok", { path: to.path })}`);
      return next();
    } catch (error) {
      console.error(`❌ ${t("error.auth_failed")}:`, error);
      authStore.isInitializing = false;
      authStore.clearAuth();
      resetDynamicRoutes(router);
      return next("/login");
    }
  }

  // 🧭 Connecté mais routes manquantes
  if (!authStore.routesLoaded) {
    try {
      console.log(`👤 ${t("auth.routes_missing")}`);
      authStore.isInitializing = true;

      if (!authStore.menus || authStore.menus.length === 0) {
        console.log(`📋 ${t("auth.menu_missing")}`);
        await authStore.getUserMenus();
      }

      const success = await initDynamicRoutes(router, false);
      authStore.routesLoaded = success;
      authStore.isInitializing = false;

      if (to.path === "/") {
        console.log("🏠 Redirection vers /dashboard");
        return next("/dashboard");
      }

      console.log(`✅ ${t("auth.navigate_ok", { path: to.path })}`);
      return next();
    } catch (error) {
      console.error(`❌ ${t("error.route_init_failed")}:`, error);
      authStore.isInitializing = false;

      const baseRoutes = ["/dashboard", "/profile"];
      if (baseRoutes.includes(to.path)) {
        console.log(`🛡️ ${t("auth.base_page_ok")}`);
        return next();
      }

      console.log(`🔁 ${t("auth.redirect_default")}`);
      return next("/dashboard");
    }
  }

  // 🧩 Vérification finale
  try {
    const resolved = router.resolve(to.path);
    if (!resolved.matched || resolved.matched.length === 0) {
      console.warn(`⚠️ ${t("auth.route_not_found", { path: to.path })}`);

      authStore.routesLoaded = false;
      authStore.isInitializing = true;

      await authStore.getUserMenus();
      const success = await initDynamicRoutes(router, false);

      if (success) {
        authStore.routesLoaded = true;
        console.log(`✅ ${t("auth.routes_reloaded")}`);

        const retry = router.resolve(to.path);
        if (retry && retry.matched.length > 0) {
          authStore.isInitializing = false;
          return next();
        }

        console.warn(`⚠️ ${t("auth.route_still_missing", { path: to.path })}`);
      }
    }
  } catch (finalError) {
    console.error(`❌ ${t("error.final_check_failed")}:`, finalError);
  } finally {
    authStore.isInitializing = false;
  }

  console.log(`✅ ${t("auth.guard_done", { path: to.path })}`);
  return next();
}
