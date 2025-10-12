/**
 * ---------------------------------------------------------------
 * 📁 Module : src/router/dynamicRoutes.js
 * 🧱 Rôle  : Gestion centralisée des routes dynamiques et du mapping des composants.
 * 🔗 Lié à : authGuard.js, menuApi, stores/auth.js
 *
 * 🧭 Fonction :
 *    - Génère les routes à partir des menus renvoyés par l’API
 *    - Crée les correspondances entre noms logiques et composants Vue (.vue)
 *    - Charge dynamiquement les modules via import.meta.glob
 *    - Fournit des outils utilitaires : reset, validation, listing
 * ---------------------------------------------------------------
 */

/**
 * =====================================================================
 * ⚙️  Gestion des routes dynamiques (dynamicRoutes.js)
 * =====================================================================
 *
 * Objectif :
 * -----------
 * Ce module gère la création, l’injection et la maintenance des routes
 * dynamiques dans l’application Quasar/Vue.  
 * Les routes dynamiques sont construites à partir des **menus renvoyés
 * par l’API backend** (via `menuApi.getUserMenus()`).
 *
 * Fonctionnement général :
 * ------------------------
 * 1. Les menus utilisateur sont récupérés depuis le backend :
 *    → Chaque entrée contient un chemin (`path`), un composant (`component`),
 *      et des métadonnées (`meta` : titre, icône, permission, cache...).
 *
 * 2. Le module cherche le composant Vue correspondant :
 *    - soit via `import.meta.glob("../pages/**\/*.vue")`
 *      (préchargement statique des pages à la compilation),
 *    - soit via une correspondance définie dans `componentMap`,
 *      que le backend peut aussi fournir via `getComponentMapping()`.
 *
 * 3. Les menus valides sont transformés en objets `RouteRecordRaw`
 *    (conformes à vue-router) via `transformMenuToRoute(menu)`.
 *
 * 4. Ces routes sont ajoutées sous la route “MainLayout” grâce à :
 *    → `router.addRoute("MainLayout", route)`
 *
 * 5. Le système conserve l’état des routes dynamiques :
 *    - `initDynamicRoutes()` : charge et enregistre les routes
 *    - `resetDynamicRoutes()` : les supprime lors d’une déconnexion
 *    - `getUserRoutes()` : reconstitue la hiérarchie à partir des menus
 *
 * Composants et outils principaux :
 * ---------------------------------
 * 🧩 componentMap
 *    - Une table (Map) de correspondance entre noms logiques et composants réels.
 *    - Alimentée par les modules trouvés via `import.meta.glob`.
 *    - Peut être mise à jour depuis le backend.
 *
 * 🧩 normalizeComponentPath()
 *    - Nettoie et uniformise les chemins de composants avant la recherche.
 *
 * 🧩 getComponent()
 *    - Récupère un composant d’après un chemin, en testant plusieurs variantes.
 *
 * 🧩 transformMenuToRoute()
 *    - Convertit une entrée de menu (objet API) en route vue-router.
 *
 * 🧩 loadComponentMappingFromAPI()
 *    - Charge une table de correspondance (clé → composant Vue)
 *      depuis l’API si elle est disponible.
 *
 * 🧩 addDynamicRoutes()
 *    - Ajoute toutes les routes générées à l’instance active du routeur.
 *
 * 🧩 resetDynamicRoutes()
 *    - Supprime toutes les routes dynamiques pour revenir à l’état initial.
 *
 * 🧩 setFallbackComponentMapping()
 *    - Définit des correspondances par défaut (fallback)
 *      utilisées si le chargement depuis l’API échoue.
 *
 * Notes importantes :
 * -------------------
 * - Tous les composants Vue doivent se trouver sous `src/pages/**`.
 * - Les menus backend doivent pointer vers des chemins cohérents
 *   avec cette arborescence (ex: `"system/user"` → `pages/system/user/UserPage.vue`).
 * - En mode déconnecté, les routes de secours (“fallback mappings”)
 *   permettent de garder un fonctionnement minimal.
 *
 * Fichiers liés :
 * ---------------
 *   • src/router/index.js   → garde de navigation et initialisation du routeur
 *   • src/router/routes.js  → routes statiques de base
 *   • src/stores/auth.js    → gestion du token, des menus et de l’état utilisateur
 *   • src/api/menuApi.js    → point d’accès pour les données de menu/permissions
 *
 * =====================================================================
 */


import { menuApi } from "src/api";
import { LocalStorage } from "quasar";

/**
 * 🧩 Tableau de correspondance des composants (componentMap)
 * ---------------------------------------------------------
 * Sert à relier les chemins de composants (ex: "system/user") aux vraies
 * importations Vite/Webpack de fichiers Vue (.vue)
 *
 * Pourquoi une table de correspondance est nécessaire :
 * 1. Vite/Webpack effectue une analyse statique au moment de la compilation
 * 2. Les importations dynamiques (import()) doivent contenir suffisamment
 *    d’informations de chemin pour être reconnues par l’outil de bundling
 * 3. Cela garantit le bon découpage du code (code splitting) et le lazy-loading
 *
 * Utilisation :
 * - Pré-enregistrer les composants fréquemment utilisés
 * - Permettre l’enregistrement dynamique de nouveaux composants à l’exécution
 * - Fournir des outils de normalisation et de mappage des chemins de composants
 */

// Préchargement de tous les composants du dossier "pages" via import.meta.glob
const modules = import.meta.glob("../pages/**/*.vue");

console.log("🗂️ Modules de composants préchargés par Vite :", Object.keys(modules));

const componentMap = new Map();

// État d’initialisation de la correspondance des composants
let componentMappingLoaded = false;

/**
 * Normalise un chemin de composant pour supporter plusieurs formats possibles
 */
const normalizeComponentPath = (componentPath) => {
  if (!componentPath) return [];

  // Supprime les slash initiaux et le préfixe "pages/"
  let normalized = componentPath.replace(/^\/+/, "").replace(/^pages?\//, "");

  // Supprime l’extension ".vue" éventuelle
  normalized = normalized.replace(/\.vue$/, "");

  // Crée plusieurs variantes de chemins possibles
  const pathVariants = [
    normalized, // ex: system/user
    `pages/${normalized}`, // ajoute le préfixe "pages/"
    `pages/${normalized}Page`, // variante "userPage"
    normalized + "/index", // ajoute "/index"
    normalized.replace(/\/index$/, ""), // supprime "/index"
  ];

  // Si le chemin ne contient pas "Page", on essaie de construire des variantes standards
  if (!normalized.includes("Page")) {
    const pathParts = normalized.split("/");
    const moduleName = pathParts[pathParts.length - 1];
    if (moduleName) {
      const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
      pathVariants.push(`${normalized}/${capitalizedModule}Page`);
      pathVariants.push(`pages/${normalized}/${capitalizedModule}Page`);
    }
  }

  return pathVariants;
};

/**
 * Récupère un composant à partir de son chemin.
 * Supporte plusieurs formats et variations de chemins.
 */
const getComponent = (componentPath) => {
  if (!componentPath) return null;

  // 1. Vérifie si déjà dans la map
  if (componentMap.has(componentPath)) {
    console.log(`✅ Composant trouvé : ${componentPath}`);
    return componentMap.get(componentPath);
  }

  // 2. Essaie avec les variantes normalisées
  const pathVariants = normalizeComponentPath(componentPath);

  for (const variant of pathVariants) {
    if (componentMap.has(variant)) {
      console.log(`✅ Composant trouvé : ${componentPath} -> ${variant}`);
      return componentMap.get(variant);
    }
  }

  // Ancien mécanisme de génération automatique désactivé (voir commentaire d’origine)
  console.warn(
    `⚠️ Aucun composant trouvé pour : ${componentPath} — chemins testés :`,
    pathVariants
  );
  return null;
};

/**
 * Génère un nom de route lisible à partir du chemin (ex: system/user → SystemUser)
 */
const generateRouteName = (path) => {
  if (!path) return "";

  return path
    .replace(/^\/+/, "")
    .replace(/\/+/g, "-")
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
};

/**
 * Transforme un élément de menu (du backend) en route Vue Router.
 */
const transformMenuToRoute = (menu) => {
  // Ignore les boutons, les menus cachés ou désactivés
  if (menu.menuType === 2 || menu.isVisible === 0 || menu.status === 0) {
    return null;
  }

  // Ignore les entrées sans chemin
  if (!menu.path) {
    return null;
  }

  console.log(
    `🔄 Traitement du menu : ${menu.menuName}, chemin : ${menu.path}, type : ${menu.menuType}, composant : ${menu.component}`
  );

  // Création de l’objet route
  const route = {
    path: menu.path.startsWith("/") ? menu.path.substring(1) : menu.path,
    name: generateRouteName(menu.path),
    meta: {
      title: menu.menuName,
      icon: menu.icon,
      permission: menu.permission,
      keepAlive: menu.isCache === 1,
      hidden: menu.isVisible === 0,
    },
  };

  // Ajout du composant associé (uniquement pour les menus)
  if (menu.menuType === 1 && menu.component) {
    const component = getComponent(menu.component);
    if (component) {
      route.component = component;
    } else {
      console.warn(`❌ Échec du chargement du composant, menu ignoré : ${menu.menuName}`);
      return null;
    }
  }

  // Gestion des sous-menus
  if (menu.children && menu.children.length > 0) {
    const children = [];

    menu.children.forEach((childMenu) => {
      if (childMenu.menuType === 2 || childMenu.isVisible === 0 || childMenu.status === 0) {
        return;
      }

      if (!childMenu.path) {
        return;
      }

      // Calcule le chemin relatif du sous-menu
      let childPath;
      const normalizedParentPath = menu.path.startsWith("/")
        ? menu.path.substring(1)
        : menu.path;
      const normalizedChildPath = childMenu.path.startsWith("/")
        ? childMenu.path.substring(1)
        : childMenu.path;

      if (normalizedChildPath.startsWith(normalizedParentPath + "/")) {
        childPath = normalizedChildPath.substring(normalizedParentPath.length + 1);
      } else {
        const segments = normalizedChildPath.split("/").filter(Boolean);
        childPath = segments[segments.length - 1];
      }

      if (!childPath || childPath.trim() === "") {
        console.warn(`⚠️ Sous-chemin invalide ignoré : ${childMenu.path}`);
        return;
      }

      const childRoute = {
        path: childPath,
        name: generateRouteName(childMenu.path),
        meta: {
          title: childMenu.menuName,
          icon: childMenu.icon,
          permission: childMenu.permission,
          keepAlive: childMenu.isCache === 1,
          hidden: childMenu.isVisible === 0,
        },
      };

      // Ajoute le composant du sous-menu
      if (childMenu.menuType === 1 && childMenu.component) {
        const childComponent = getComponent(childMenu.component);
        if (childComponent) {
          childRoute.component = childComponent;
          children.push(childRoute);
          console.log(`✅ Sous-route créée : ${childMenu.path} → ${childPath}`);
        }
      }
    });

    if (children.length > 0) {
      route.children = children;

      // Si c’est un répertoire, crée une redirection vers le premier enfant
      if (menu.menuType === 0) {
        const firstChild = children[0];
        if (firstChild) {
          route.redirect = firstChild.path;
          console.log(`🔀 Redirection dossier : ${route.path} → ${firstChild.path}`);
        }
      }
    }
  }

  return route;
};

/**
 * Récupère les routes dynamiques de l’utilisateur
 */
export const getUserRoutes = async (usePersistedMenus = false) => {
  try {
    let menuData = [];

    if (usePersistedMenus) {
      // Essaie d’utiliser les menus persistés (LocalStorage)
      const persistedMenus = LocalStorage.getItem("userMenus");
      if (persistedMenus && persistedMenus.length > 0) {
        console.log("📋 Utilisation des menus persistés :", persistedMenus);
        menuData = persistedMenus;
      } else {
        console.log("📋 Aucun menu persisté, récupération depuis l’API...");
        const response = await menuApi.getUserMenus();
        if (response.data && response.data.code === 200) {
          menuData = response.data.data || [];
        }
      }
    } else {
      console.log("🔄 Récupération des menus utilisateur depuis l’API...");
      const response = await menuApi.getUserMenus();
      if (response.data && response.data.code === 200) {
        menuData = response.data.data || [];
      }
    }

    // Vérifie que le mapping de composants est chargé
    if (!componentMappingLoaded) {
      console.log("📦 Mapping de composants non chargé, chargement en cours...");
      const loadResult = await loadComponentMappingFromAPI();
      if (!loadResult.success) {
        console.warn("⚠️ Échec du chargement du mapping, poursuite du processus.");
      }
    }

    console.log("📋 Données de menu :", menuData);

    const routes = [];

    menuData.forEach((menu) => {
      const route = transformMenuToRoute(menu);
      if (route) {
        routes.push(route);
      }
    });

    console.log("✅ Routes dynamiques générées :", routes);
    return routes;
  } catch (error) {
    console.error("❌ Échec de la récupération des routes utilisateur :", error);
    return [];
  }
};

/**
 * Ajoute les routes dynamiques dans le routeur
 */
export const addDynamicRoutes = (router, routes) => {
  if (!routes || routes.length === 0) {
    console.log("📝 Aucune route dynamique à ajouter");
    return;
  }

  console.log("🚀 Début de l’ajout des routes dynamiques...");

  let successCount = 0;

  routes.forEach((route) => {
    try {
      console.log(`➕ Ajout de la route : ${route.path}`, {
        name: route.name,
        component: !!route.component,
        children: route.children?.length || 0,
        redirect: route.redirect,
      });

      if (!route.path || route.path.trim() === "") {
        console.warn(`⚠️ Route invalide ignorée : ${route.path}`);
        return;
      }

      router.addRoute("MainLayout", route);

      successCount++;
      console.log(`✅ Route ajoutée avec succès : ${route.path}`);
    } catch (error) {
      console.error(`❌ Échec de l’ajout de la route : ${route.path}`, error);
    }
  });

  console.log(`📊 Ajout terminé — succès : ${successCount}/${routes.length}`);

  const allRoutes = router.getRoutes();
  console.log("📜 Total actuel de routes :", allRoutes.length);
};

/**
 * Initialise toutes les routes dynamiques (appelée au login)
 */
export const initDynamicRoutes = async (router, usePersistedMenus = true) => {
  try {
    console.log("🔧 Initialisation du système de routes dynamiques...");

    console.log("📊 État actuel du mapping :", {
      loaded: componentMappingLoaded,
      count: componentMap.size,
      components: Array.from(componentMap.keys()),
    });

    const routes = await getUserRoutes(usePersistedMenus);

    if (routes.length === 0) {
      console.log("📋 Aucune route dynamique à ajouter");
      return true;
    }

    addDynamicRoutes(router, routes);

    console.log("🎉 Initialisation des routes dynamiques terminée !");

    const allRoutes = router.getRoutes();
    console.log("📜 État final des routes :", {
      total: allRoutes.length,
      dynamic: routes.length,
      routeNames: allRoutes.map((r) => r.name).filter(Boolean),
    });

    return true;
  } catch (error) {
    console.error("❌ Échec de l’initialisation des routes dynamiques :", error);
    return false;
  }
};

/**
 * Réinitialise (supprime) toutes les routes dynamiques
 */
export const resetDynamicRoutes = (router) => {
  try {
    console.log("🧹 Nettoyage des routes dynamiques...");

    const allRoutes = router.getRoutes();
    const baseRoutes = ["/", "/login", "/404", "/:catchAll(.*)*", "/dashboard", "/profile"];
    const baseNames = ["Dashboard", "Profile", "MainLayout"];

    let removedCount = 0;

    allRoutes.forEach((route) => {
      if (
        route.name &&
        !baseNames.includes(route.name) &&
        !baseRoutes.includes(route.path)
      ) {
        try {
          router.removeRoute(route.name);
          console.log(`🗑️ Route supprimée : ${route.name}`);
          removedCount++;
        } catch (error) {
          console.warn(`⚠️ Échec lors de la suppression de la route : ${route.name}`, error);
        }
      }
    });

    console.log(`✅ Nettoyage terminé — ${removedCount} routes supprimées`);
  } catch (error) {
    console.error("❌ Échec du reset des routes dynamiques :", error);
  }
};

/**
 * Enregistre un composant dans la map
 * (peut être fait individuellement ou en masse)
 */
export const registerComponent = (path, component) => {
  if (!path || !component) {
    console.warn("⚠️ Échec de l’enregistrement : paramètres invalides");
    return false;
  }

  componentMap.set(path, component);
  console.log(`✅ Composant enregistré : ${path}`);
  return true;
};

/**
 * Enregistre plusieurs composants d’un coup
 */
export const registerComponents = (components) => {
  if (!components || typeof components !== "object") {
    console.warn("⚠️ Échec de l’enregistrement multiple : paramètres invalides");
    return false;
  }

  let successCount = 0;
  Object.entries(components).forEach(([path, component]) => {
    if (registerComponent(path, component)) {
      successCount++;
    }
  });

  console.log(`✅ Enregistrement multiple terminé : ${successCount}/${Object.keys(components).length}`);
  return successCount > 0;
};

/**
 * Récupère la correspondance des composants depuis le backend
 * (mise à jour dynamique du componentMap)
 */
export const loadComponentMappingFromAPI = async () => {
  try {
    console.log("🔄 Récupération du mapping des composants depuis le backend...");

    const response = await menuApi.getComponentMapping();

    if (response.data && response.data.code === 200 && response.data.data) {
      const mappings = response.data.data;
      let registeredCount = 0;

      componentMap.clear();
      console.log("📦 Données de mapping renvoyées par le backend :", mappings);

      Object.entries(mappings).forEach(([key, componentPath]) => {
        try {
          console.log(`🔧 Traitement du mapping : ${key} → ${componentPath}`);

          const componentImport = () => {
            console.log(`🚀 Chargement du composant : ${key}`);
            console.log(`📍 Identifiant : ${componentPath}`);

            const pathParts = componentPath.split("/");
            const moduleName = pathParts[pathParts.length - 1];
            const capitalizedModule =
              moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

            const possiblePaths = [
              `../pages/${componentPath}/${capitalizedModule}Page.vue`,
              `../pages/${componentPath}Page.vue`,
              `../pages/${componentPath}.vue`,
            ];

            console.log(`🔗 Chemins testés :`, possiblePaths);

            for (const fullModulePath of possiblePaths) {
              if (modules[fullModulePath]) {
                console.log(`✅ Module trouvé : ${fullModulePath}`);
                return modules[fullModulePath]();
              }
            }

            const matchedPath = Object.keys(modules).find(
              (path) => path.includes(componentPath) && path.includes("Page.vue")
            );

            if (matchedPath) {
              console.log(`✅ Module correspondant trouvé : ${componentPath} → ${matchedPath}`);
              return modules[matchedPath]();
            } else {
              console.error(`❌ Aucun module trouvé pour : ${componentPath}`);
              console.log(`📋 Chemins attendus :`, possiblePaths);
              console.log(
                `📋 Modules disponibles :`,
                Object.keys(modules).filter((path) => path.includes(componentPath))
              );

              const errorPagePath = "../pages/ErrorNotFound.vue";
              if (modules[errorPagePath]) {
                console.log(`⚠️ Utilisation de la page d’erreur à la place : ${componentPath}`);
                return modules[errorPagePath]();
              } else {
                throw new Error(`Composant introuvable et page d’erreur manquante : ${componentPath}`);
              }
            }
          };

          componentMap.set(key, componentImport);
          registeredCount++;
          console.log(`✅ Mapping enregistré : ${key} → ${componentPath}`);
        } catch (error) {
          console.error(`❌ Échec de l’enregistrement du mapping : ${key}`, error);
        }
      });

      componentMappingLoaded = true;
      console.log(`✅ Mapping chargé depuis l’API : ${registeredCount}/${Object.keys(mappings).length}`);

      return { success: true, count: registeredCount };
    } else {
      console.warn("⚠️ Format de données inattendu :", response.data);
      return { success: false, error: "Format de données invalide" };
    }
  } catch (error) {
    console.error("❌ Échec de la récupération du mapping :", error);
    console.log("🔄 Application d’un mapping de secours...");
    setFallbackComponentMapping();
    return { success: false, error: error.message };
  }
};

/**
 * Définit un mappage de secours des composants
 * (utilisé si l’appel à l’API échoue)
 */
const setFallbackComponentMapping = () => {
  const fallbackMappings = {
    "system/user": "system/user",
    "system/role": "system/role",
    "system/menu": "system/menu",
    "system/log": "system/log",
    "system/dept": "system/dept",
    "system/dict": "system/dict",
    "monitor/online": "monitor/online",
    "test/log": "test/log",
  };

  Object.entries(fallbackMappings).forEach(([key, componentPath]) => {
    const componentImport = () => {
      // 🔧 Construction améliorée du chemin du module
      const pathParts = componentPath.split("/");
      const moduleName = pathParts[pathParts.length - 1];
      const capitalizedModule =
        moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

      // 🧭 Essaie plusieurs formats de chemins possibles
      const possiblePaths = [
        `../pages/${componentPath}/${capitalizedModule}Page.vue`,
        `../pages/${componentPath}Page.vue`,
        `../pages/${componentPath}.vue`,
      ];

      for (const path of possiblePaths) {
        if (modules[path]) {
          console.log(`✅ Module trouvé dans le mappage de secours : ${key} → ${path}`);
          return modules[path]();
        }
      }

      // 🚨 Si aucun module trouvé, on retourne la page d’erreur générique
      console.warn(`⚠️ Aucun composant trouvé dans le mappage de secours : ${key}`);
      return (
        modules["../pages/ErrorNotFound.vue"]?.() ||
        Promise.reject(new Error("ErrorNotFound.vue introuvable"))
      );
    };
    componentMap.set(key, componentImport);
  });

  componentMappingLoaded = true;
  console.log("✅ Mappage de secours configuré avec succès");
};

/**
 * Récupère la liste de tous les composants actuellement enregistrés
 */
export const getRegisteredComponents = () => {
  return Array.from(componentMap.keys());
};

/**
 * Retourne des informations détaillées sur la table de correspondance des composants
 */
export const getComponentMapInfo = () => {
  return {
    total: componentMap.size,
    components: Array.from(componentMap.keys()),
    loaded: componentMappingLoaded,
  };
};

/**
 * Supprime tous les composants dynamiquement enregistrés
 * (les composants prédéfinis restent inchangés)
 */
export const clearAllComponents = () => {
  const clearCount = componentMap.size;
  componentMap.clear();
  componentMappingLoaded = false;

  console.log(`🧹 Tous les composants ont été effacés (${clearCount} éléments supprimés)`);
  return clearCount;
};

/**
 * Vérifie si un chemin de composant existe réellement
 * Utile pour tester dynamiquement la disponibilité d’un composant
 */
export const validateComponentPath = async (componentPath) => {
  const component = getComponent(componentPath);
  if (!component) {
    return { valid: false, error: "Composant introuvable" };
  }

  try {
    await component();
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};
