/**
 * ---------------------------------------------------------------
 * 🌍 Module : common.ui.ts
 * 🎯 Rôle  : Libellés génériques de l'interface utilisateur
 * ---------------------------------------------------------------
 * Utilisé pour les champs, colonnes de tableau, statuts et
 * messages communs à l’ensemble des modules.
 * ---------------------------------------------------------------
 */
export default {
  // 🧱 Champs de base
  username: "Nom d’utilisateur",
  password: "Mot de passe",
  nickname: "Surnom",
  email: "Adresse e-mail",
  mobile: "Téléphone",
  gender: "Sexe",
  roles: "Rôles",
  status: "Statut",
  actions: "Actions",
  remark: "Remarque",
  sortOrder: "Ordre d’affichage",

  // 🧭 Informations générales
  createTime: "Date de création",
  updateTime: "Date de mise à jour",
  timeRange: "Période",
  ipAddress: "Adresse IP",
  requestUrl: "URI",
  requestMethod: "Méthode HTTP",
  executionTime: "Durée d’exécution",
  visibility: "Visibilité",

  // 🔄 États d’affichage
  loading: "Chargement...",
  noData: "Aucune donnée disponible",
  noResults: "Aucun résultat trouvé",
  enabled: "Activé",
  disabled: "Désactivé",

  // 📊 Pagination
  perPage: "Lignes par page :",                  // Utilisé dans certaines tables
  totalRecords: "Total : {count} enregistrements", // Exemple : “Total : 125 enregistrements”
  perPagePrefix: "Afficher",                     // Exemple : “Afficher [10] lignes par page”
  perPageSuffix: "lignes par page",

  // 🧰 Messages génériques
  clearFail: "Échec de la suppression",
  confirmClearTitle: "Confirmation de suppression",
  confirmDeleteTitle: "Confirmation de suppression",
  operationFail: "Échec de l’opération",
  copySuccess: "Copié dans le presse-papiers",
  copyFail: "Échec de la copie",

  // 🌐 Données techniques
  userAgent: "Agent utilisateur",
  requestParams: "Paramètres de la requête",
  responseResult: "Résultat de la réponse",
  errorMsg: "Message d’erreur",
};
