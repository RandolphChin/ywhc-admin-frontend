/**
 * ---------------------------------------------------------------
 * 🔐 Module : encryptionService.ui.ts
 * 🎯 Rôle  : Textes relatifs au service de chiffrement RSA
 * ---------------------------------------------------------------
 */
export default {
  // 🔑 Clé publique RSA
  fetchingPublicKey: "Obtention de la clé publique RSA...",
  publicKeyLoaded: "Clé publique RSA chargée avec succès",
  publicKeyFailed: "Échec de l’obtention de la clé publique RSA",
  publicKeyWarning: "Échec de la récupération de la clé publique, les données seront transmises en clair",
  publicKeyFormatError: "Format de clé publique invalide",

  // 🔐 Chiffrement des données
  fieldEncryptSuccess: "Champ chiffré avec succès",
  fieldEncryptFailed: "Échec du chiffrement du champ",
  dataEncryptSuccess: "Données chiffrées avec succès",
  noFieldsToEncrypt: "Aucun champ à chiffrer",
}
