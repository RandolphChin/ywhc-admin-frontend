/**
 * ---------------------------------------------------------------
 * 💥 core/error.ui.ts
 * 🎯 Messages d’erreurs système et exceptions globales
 * ---------------------------------------------------------------
 * 🇨🇳 系统错误与全局异常提示
 * 🇫🇷 Utilisé pour les erreurs réseau, serveur, autorisation,
 *      logique métier ou exceptions inattendues.
 * 🇬🇧 Used for network, server, authorization, business logic,
 *      or unexpected exceptions.
 * ---------------------------------------------------------------
 */

export default {
  // ⚙️ Erreurs système / System errors
  unknown: "Une erreur inconnue est survenue.", // 🇬🇧 An unknown error occurred.
  serverError: "Erreur interne du serveur.", // 🇬🇧 Internal server error.
  networkError: "Erreur réseau — impossible de contacter le serveur.", // 🇬🇧 Network error — unable to reach the server.
  timeout: "La requête a expiré.", // 🇬🇧 The request timed out.
  unavailable: "Service temporairement indisponible.", // 🇬🇧 Service temporarily unavailable.
  requestTimeout: "Le délai de la requête a expiré.", // 🇬🇧 The request deadline has expired.

  // 🔐 Sécurité / Authentification / Session
  unauthorized: "Authentification requise ou session expirée.", // 🇬🇧 Authentication required or session expired.
  forbidden: "Accès refusé.", // 🇬🇧 Access denied.
  permissionDenied: "Permission insuffisante pour effectuer cette action.", // 🇬🇧 Insufficient permission to perform this action.
  tokenExpired: "Le jeton d’accès a expiré, veuillez vous reconnecter.", // 🇬🇧 Access token has expired, please log in again.
  tokenInvalid: "Le jeton d’accès est invalide.", // 🇬🇧 The access token is invalid.
  invalidToken: "Jeton d’authentification invalide ou expiré.", // 🇬🇧 Authentication token invalid or expired.
  refreshFail: "Impossible de rafraîchir le jeton d’accès.", // 🇬🇧 Unable to refresh the access token.
  sessionExpired: "Votre session a expiré. Veuillez vous reconnecter.", // 🇬🇧 Your session has expired. Please log in again.

  // 💾 Données / Ressources
  notFound: "La ressource demandée est introuvable.", // 🇬🇧 The requested resource was not found.
  conflict: "Conflit de données détecté.", // 🇬🇧 Data conflict detected.
  duplicate: "Un enregistrement identique existe déjà.", // 🇬🇧 A duplicate record already exists.
  saveFailed: "Échec de l’enregistrement des données.", // 🇬🇧 Failed to save data.
  deleteFailed: "Échec de la suppression de l’élément.", // 🇬🇧 Failed to delete the item.
  loadFailed: "Impossible de charger les données.", // 🇬🇧 Failed to load data.
  fetchFailed: "Erreur lors de la récupération des informations.", // 🇬🇧 Error fetching data.

  // 🧩 Application / Logique
  invalidState: "L’application est dans un état inattendu.", // 🇬🇧 The application is in an unexpected state.
  operationAborted: "L’opération a été interrompue.", // 🇬🇧 The operation was aborted.
  operationFail: "Échec de l’opération.", // 🇬🇧 Operation failed.
  dependencyError: "Une dépendance nécessaire est manquante ou défaillante.", // 🇬🇧 A required dependency is missing or failing.
  forbiddenAction: "Action interdite.", // 🇬🇧 Forbidden action.
};
