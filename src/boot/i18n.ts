import { boot } from "quasar/wrappers"
import { createI18n } from "vue-i18n"
import messages from "src/i18n"

/**
 * 🌍 Boot i18n — Initialisation du système de traduction global
 * --------------------------------------------------------------
 * 🧩 Fonctionnalités :
 * - Utilise la Composition API (`useI18n`)
 * - Injection globale activée (accès direct via `$t` dans les templates)
 * - Détection automatique de la langue du navigateur si disponible
 * - Fallback automatique vers le français
 * - Export de l’instance pour usage dans les stores et services
 */

const browserLocale =
  navigator.language && Object.keys(messages).includes(navigator.language)
    ? navigator.language
    : "fr-FR"

// 🧠 Création de l’instance i18n
export const i18n = createI18n({
  legacy: false, // ⚡ Active le mode Composition API
  globalInjection: true, // Permet d’utiliser $t() directement dans les templates
  locale: browserLocale, // Langue courante (auto-détectée)
  fallbackLocale: "fr-FR", // Langue par défaut
  messages, // Dictionnaires importés depuis src/i18n
})

// 🚀 Boot : injection dans l’application Vue
export default boot(({ app }) => {
  app.use(i18n)
  console.log(`🌐 i18n initialisé → langue : ${i18n.global.locale.value}`)
})

// ✅ Export vide pour compatibilité Quasar
export {}
