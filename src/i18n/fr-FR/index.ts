/**
 * ===============================================================
 * 🌍 Fichier principal de traduction — Français (fr-FR)
 * ===============================================================
 *
 * 🔗 Structure modulaire et organisation des fichiers :
 *
 * 🧩 1. Cœur du système
 *   - core.ui.ts           → Interface système (libellés généraux du framework)
 *   - core.error.ts        → Messages d’erreurs système et réseau
 *   - common.ui.ts         → Champs et libellés communs à tous les modules
 *
 * 🔐 2. Authentification & sécurité
 *   - auth.ui.ts           → Interface d’authentification (connexion, mot de passe, etc.)
 *   - auth.guard.ts        → Messages liés à la sécurité, aux permissions et aux statuts d’accès
 *   - captcha.ui.ts        → Vérification glissée / Captcha générique réutilisable
 *
 * 🧭 3. Navigation & routage
 *   - router.error.ts      → Erreurs et redirections de navigation
 *   - menu.ui.ts           → Noms et libellés des menus
 *
 * ⚙️ 4. Modules système et applicatifs
 *   - system.ui.ts         → Interface du module Système (départements, rôles, menus, permissions, logs, etc.)
 *   - dashboard.ui.ts      → Tableau de bord et indicateurs clés
 *   - user.ui.ts           → Interface et gestion des utilisateurs
 *   - user.profile.ui.ts   → Profil utilisateur (désactivé actuellement)
 *
 * 🧰 5. Actions et validations
 *   - action.ui.ts         → Boutons et actions globales (CRUD, navigation, confirmation, etc.)
 *   - validation.ui.ts     → Messages de validation et règles de formulaire
 *
 * ===============================================================
 * ⚙️ Notes d’intégration :
 *   - Chaque fichier définit un namespace propre (ex. t('auth.login'))
 *   - Le fallback automatique est activé → clé brute affichée si manquante
 *   - Structure “plate” de fusion : les modules sont combinés selon leur domaine logique
 *   - Tous les fichiers sont importés et fusionnés dans le présent index.ts
 *
 * ✏️ Historique :
 *   - Carmelo Guarneri — conception, structure et organisation modulaire
 *   - ChatGPT — documentation, regroupement et normalisation des clés i18n
 * ===============================================================
 */


// === Imports des modules ===

// 1️⃣ Cœur du système
import coreUi from "./core.ui";
import coreError from "./core.error";
import commonUi from "./common.ui";

// 2️⃣ Authentification & sécurité
import authUi from "./auth.ui";
import authGuard from "./auth.guard";
import captchaUi from "./captcha.ui";

// 3️⃣ Navigation & routage
import routerError from "./router.error";
import menuUi from "./menu.ui";

// 4️⃣ Modules système et applicatifs
import systemUi from "./system.ui";
import dashboardUi from "./dashboard.ui";
import userUi from "./user.ui";
// import userProfileUi from "./user.profile.ui"; // (désactivé pour l’instant)

// 5️⃣ Actions et validations
import actionUi from "./action.ui";
import validationUi from "./validation.ui";

import encryptionService from './encryptionService.ui'

// === Fusion des messages ===
const messages = {
  core: { ...coreUi, ...coreError },
  common: { ...commonUi },
  auth: { ...authUi, ...authGuard },
  captcha: { ...captchaUi },
  router: { ...routerError },
  menu: { ...menuUi },
  system: { ...systemUi },
  dashboard: { ...dashboardUi },
  user: { ...userUi },
  action: { ...actionUi },
  validation: { ...validationUi },
  encryptionService: { ...encryptionService },

};

// === Export ===
export default messages;



// import coreUi from "./core.ui";
// import coreError from "./core.error";
// import commonUi from "./common.ui";

// import actionUi from "./action.ui";

// import systemUi from './system.ui'

// import authUi from "./auth.ui";
// import authGuard from "./auth.guard";
// import routerError from "./router.error";

// import menuUi from "./menu.ui";

// import dashboardUi from "./dashboard.ui";

// import userUi from "./user.ui";
// //import userProfileUi from "./user.profile.ui";

// import captchaUi from "./captcha.ui";

// const messages = {
//   core: { ...coreUi, ...coreError },
//   common: { ...commonUi, },
  
//   system: { ...systemUi,},

//   auth: { ...authUi, ...authGuard },
//   router: { ...routerError },
//   menu: menuUi,
//   dashboard: dashboardUi,
//   user: userUi ,
//   action: actionUi,
//   captcha: captchaUi,
// };

// export default messages;
