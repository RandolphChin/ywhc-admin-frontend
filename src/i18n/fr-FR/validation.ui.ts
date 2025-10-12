/**
 * ---------------------------------------------------------------
 * 🧾 ui/validation.ui.ts
 * 🎯 Messages de validation uniformisés et réutilisables
 * ---------------------------------------------------------------
 * ➤ Centralise tous les messages d’erreur liés à la saisie,
 *   aux formulaires et aux contraintes utilisateur côté front.
 * ➤ Les validations système (réseau, session, etc.)
 *   restent dans core/error.ui.ts.
 * ---------------------------------------------------------------
 */
export default {
  // Champs obligatoires
  required: "Le champ {field} est obligatoire.",
  confirmAction: "Veuillez confirmer votre action.",

  // Formats et types
  invalidEmail: "Veuillez saisir une adresse e-mail valide.",
  invalidNumber: "Veuillez saisir un nombre valide.",
  invalidFormat: "Le format du champ {field} est invalide.",

  // Longueurs et limites
  minLength: "La longueur minimale est de {min} caractères.",
  maxLength: "La longueur maximale est de {max} caractères.",

  // Mots de passe
  passwordLength: "Le mot de passe doit contenir au moins 6 caractères.",
  passwordMismatch: "Les deux mots de passe ne correspondent pas.",
  oldRequired: "Veuillez saisir l’ancien mot de passe.",
  newRequired: "Veuillez saisir un nouveau mot de passe.",
  confirmRequired: "Veuillez confirmer le mot de passe.",

  // Numériques et ordonnancement
  sortOrder: "L’ordre doit être un entier supérieur ou égal à 0.",
  invalidRange: "La valeur doit être comprise entre {min} et {max}.",

  // Formulaire global
  formInvalid: "Veuillez corriger les erreurs du formulaire avant de continuer.",
  fieldInvalid: "Le champ {field} contient une valeur invalide.",
};
