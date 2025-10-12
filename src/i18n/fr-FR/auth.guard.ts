/**
 * ---------------------------------------------------------------
 * 🧩 Module : auth.guard.ts
 * 🎯 Rôle  : Messages du guard d’authentification
 * ---------------------------------------------------------------
 * ⚠️ Correction à appliquer dans le code :
 *    - Remplacer t('auth.route_not_found') → t('router.error.not_found')
 */
export default {
  guard_start: "Vérification d’accès",
  public_route: "Route publique, accès autorisé",
  no_token: "Aucun token d’authentification détecté",
  initializing: "Initialisation déjà en cours",
  cached_menus_found: "Menus persistés détectés dans le cache local",
  routes_reloaded: "Routes dynamiques rechargées avec succès",
  route_ready: "Route {path} disponible après reconstruction",
  user_info_missing: "Aucune information utilisateur trouvée — récupération en cours",
  routes_missing: "Profil présent mais routes absentes — initialisation…",
  menu_missing: "Aucun menu trouvé — récupération depuis l’API",
  navigate_ok: "Navigation vers {path}",
  base_page_ok: "Page de base autorisée",
  redirect_default: "Redirection vers le tableau de bord",
  guard_done: "Vérification d’accès terminée pour {path}",
};
