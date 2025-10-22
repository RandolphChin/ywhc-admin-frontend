/**
 * ---------------------------------------------------------------
 * 🔐 Module : auth.ui.ts
 * 🎯 Rôle  : Interface de connexion, session et sécurité
 * ---------------------------------------------------------------
 * Utilisé pour les écrans :
 *  - de connexion / déconnexion
 *  - d’enregistrement ou récupération de mot de passe
 *  - de session expirée ou connexion sécurisée
 * ---------------------------------------------------------------
 * clés : auth.xxx
 */
export default {
  // 🧩 Formulaire d’authentification
  title: "Connexion à votre compte",
  login: "Se connecter",
  logout: "Se déconnecter",
  register: "Créer un compte",
  remember: "Se souvenir de moi",
  forgot_password: "Mot de passe oublié ?",
  reset_password: "Réinitialiser le mot de passe",

  // ✅ Statuts et messages
  success: "Connexion réussie",
  failed: "Échec de la connexion",
  invalid_credentials: "Identifiants invalides",
  session_expired: "Session expirée. Veuillez vous reconnecter.",

  // 🔒 Sécurité
  encryption_enabled: "Transmission chiffrée activée",
  encryption_loading: "Chargement de la clé de chiffrement...",
  verifying: "Vérification du CAPTCHA...",
  verified: "Vérifié avec succès",
  verify_first: "Veuillez d’abord vérifier le CAPTCHA",
  captcha_title: "Vérification de sécurité",
};
