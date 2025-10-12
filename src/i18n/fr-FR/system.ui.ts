/**
 * ---------------------------------------------------------------
 * 🧩 Module : system.ui.ts
 * 🎯 Rôle  : Interfaces du module système (utilisateurs, rôles, menus, logs, générateur)
 * ---------------------------------------------------------------
 */
export default {
  // === Journaux système ===
  log: {
    title: "Journaux système",
    operationDesc: "Description de l’opération",
    operationType: "Type d’opération",
    clearLogs: "Vider les journaux",
    confirmClearMessage:
      "Êtes-vous sûr de vouloir supprimer tous les journaux ? Cette action est irréversible.",
    clearSuccess: "Journaux supprimés avec succès",
    updateSuccess: "Journal mis à jour",
    createSuccess: "Journal créé",
    operationFail: "Échec de l’opération",
  },

  // === Menus système ===
  menu: {
    title: "Menus système",
    name: "Nom du menu",
    type: "Type de menu",
    path: "Chemin de route",
    component: "Composant",
    permission: "Permission",
    sortOrder: "Ordre d’affichage",
    visibility: "Visibilité",
    dir: "Répertoire",
    menu: "Menu",
    button: "Bouton",
    rootMenu: "Menu racine",
    parentMenu: "Menu parent",
    addMenu: "Ajouter un menu",
    addSubmenu: "Ajouter un sous-menu",
    editMenu: "Modifier le menu",
    searchPlaceholder: "Saisir le nom du menu",
    pathHint: "Doit commencer par / + chemin parent + module, ex. /system/menu",
    componentHint: "Relatif à /pages, sans / au début, ex. system/menu/MenuPage.vue",
    permissionHint: "Format : module:ressource:action, ex. system:menu:add",
    icon: "Icône du menu",
    remark: "Remarque",
    updateSuccess: "Menu mis à jour avec succès",
    createSuccess: "Menu créé avec succès",
    deleteSuccess: "Menu supprimé avec succès",
    deleteFail: "Échec de la suppression du menu",
    confirmDelete: "Voulez-vous vraiment supprimer le menu « {name} » ?",
  },

  // === Utilisateurs système ===
  user: {
    title: "Utilisateurs du système",
    dept: "Département",
    role: "Rôle",
    nickname: "Surnom",
    username: "Nom d’utilisateur",
    email: "Adresse e-mail",
    mobile: "Téléphone",
    status: "Statut",
    actions: "Actions",
    addUser: "Ajouter un utilisateur",
    editUser: "Modifier l’utilisateur",
    deleteUser: "Supprimer l’utilisateur",
    resetPassword: "Réinitialiser le mot de passe",
    batchResetPassword: "Réinitialisation multiple",
    confirmDelete: "Voulez-vous vraiment supprimer l’utilisateur « {name} » ?",
    searchPlaceholder: "Saisir le nom ou le surnom",
    updateSuccess: "Utilisateur mis à jour avec succès",
    createSuccess: "Utilisateur créé avec succès",
    deleteSuccess: "Utilisateur supprimé avec succès",
    resetSuccess: "Mot de passe réinitialisé avec succès",
  },

  // === Générateur de code ===
  generator: {
    // 🗄️ Tables & colonnes
    table_name: "Nom de la table",
    table_comment: "Commentaire de la table",
    engine: "Moteur de stockage",
    create_time: "Date de création",
    actions: "Actions",

    // ⚙️ Processus & messages
    load_failed: "Échec du chargement des tables.",
    detail_failed: "Échec de la récupération des détails de la table.",
    preview_generating: "Génération de l’aperçu du code...",
    preview_failed: "Échec de l’aperçu du code.",
    generate_running: "Génération du code...",
    generate_success: "Code généré avec succès.",
    generate_failed: "Échec de la génération du code.",

    // 👁️ Aperçu du code
    code_preview: "Aperçu du code",
    total_files: "Total : {count} fichier(s)",
    file_list: "Liste des fichiers",
    select_file_prompt: "Veuillez sélectionner un fichier pour afficher son contenu",

    // 📦 Scripts SQL
    sql_scripts: "Scripts SQL",
    menu_sql: "Script SQL du menu",
    permission_sql: "Script SQL des permissions",

    // 🧾 Configuration de génération
    dialog_generate_config: "Configuration de génération de code",
    basic_info: "Informations de base",
    function_name: "Nom de la fonction",
    module_name: "Nom du module",
    module_hint: "Exemple : system, monitor",
    business_name: "Nom métier",
    business_hint: "Exemple : user, role, menu",
    package_name: "Nom du package",
    author: "Auteur",
    generate_options: "Options de génération",
    backend_code: "Code back-end",
    frontend_code: "Code front-end",
    vue_page: "Page Vue",
    vue_api: "API Vue",
  },
};
