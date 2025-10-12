import enUS from "./en-US";
import frFR from "./fr-FR";
import zhTW from "./zh-TW";

export default {
  "en-US": enUS,
  "fr-FR": frFR,
  "zh-TW": zhTW,
};

// Auto-importe tous les fichiers *.js dans les sous-dossiers de src/i18n/

// const languages = import.meta.glob('./*/index.js', { eager: true })

// const messages = {}
// for (const path in languages) {
//   const match = path.match(/\.\/([^/]+)\//)
//   if (match) {
//     messages[match[1]] = languages[path].default
//   }
// }

// export default messages