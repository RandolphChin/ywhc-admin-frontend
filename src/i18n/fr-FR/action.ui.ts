/**
 * ---------------------------------------------------------------
 * ⚙️ Module : action.ui.ts
 * 🎯 Rôle  : Actions et boutons globaux réutilisables
 * ---------------------------------------------------------------
 * Utilisé dans : boutons, menus contextuels, dialogues de confirmation, etc.
 * ---------------------------------------------------------------
 */

export default {
  // 🧩 Actions principales
  save: "Enregistrer",
  cancel: "Annuler",
  delete: "Supprimer",
  edit: "Modifier",
  add: "Ajouter",
  confirm: "Confirmer",
  back: "Retour",
  close: "Fermer",
  refresh: "Rafraîchir",
  search: "Rechercher",
  reset: "Réinitialiser",
  next: "Suivant",
  previous: "Précédent",
  view: "Voir",              // ✅ ajouté
  generate: "Générer",       // ✅ ajouté

  // 🧰 Actions spécifiques aux générateurs / dialogues
  preview: "Aperçu",
  download: "Télécharger",
  download_code: "Télécharger le code",

  // 🪄 États ou résultats d'action
  addSuccess: "Création réussie",
  editSuccess: "Modification réussie",
  deleteSuccess: "Suppression réussie",
  operationSuccess: "Opération réussie",
  operationFail: "Échec de l’opération",

  // ⚠️ Dialogues et confirmations
  confirmResetTitle: "Confirmation de réinitialisation",
  confirmResetMessage: "Souhaitez-vous vraiment réinitialiser le formulaire ?",
  resetSuccess: "Formulaire réinitialisé",
  confirmDeleteTitle: "Confirmation de suppression",
  confirmDeleteMessage: "Souhaitez-vous vraiment supprimer cet élément ? Cette action est irréversible.",

  // 🔁 Pagination ou navigation (utile pour tableaux ou étapes)
  first: "Première",
  last: "Dernière",
};
