/**
 * ===============================================================
 * ⚙️ Module : system.diagnostics.ts
 * ---------------------------------------------------------------
 * Messages techniques et de diagnostic du framework
 * ---------------------------------------------------------------
 * 🧠 Rôle :
 *   Centralise les logs et avertissements du runtime Quasar/Bleetz :
 *   - Démarrage (boot)
 *   - Initialisation i18n, router, directives
 *   - Avertissements Vue (double enregistrement)
 *   - Erreurs système détectées au runtime
 * ===============================================================
 */

export default {
  // === Directives ===
  directiveRegistered: 'La directive "{name}" a été enregistrée avec succès.',
  directiveAlreadyRegistered: 'La directive "{name}" est déjà enregistrée, opération ignorée.',

  // === Initialisation ===
  routeSkipped: 'Aucune information utilisateur, initialisation des routes ignorée.',
  i18nInitialized: '🌐 i18n initialisé → langue : {lang}.',
  accessCheck: '🚦 Vérification d’accès : {from} → {to}',
  publicAccessGranted: '✅ Route publique, accès autorisé.',
  userInfoNull: '✅ Données utilisateur traitées : null',

  // === Erreurs de démarrage ===
  bootError: '❌ Erreur de démarrage dans le module "{module}" : {error}',
  bootCompleted: '🟢 Module "{module}" initialisé avec succès.',
}
