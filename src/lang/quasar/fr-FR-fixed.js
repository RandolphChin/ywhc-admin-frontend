/*!
 * Quasar Framework v2.18.5 – Pack de langue français corrigé
 * ------------------------------------------------------------
 * Ce fichier adapte le pack officiel FR pour une compatibilité
 * complète avec les composants Quasar (QTree, QTable, etc.)
 * et corrige la clé manquante `tree.noNodes`.
 * ------------------------------------------------------------
 */

export default {
  isoName: "fr",
  nativeName: "Français",

  // 🌍 Libellés génériques utilisés dans tout Quasar
  label: {
    clear: "Effacer",
    ok: "OK",
    cancel: "Annuler",
    close: "Fermer",
    set: "Régler",
    select: "Sélectionner",
    reset: "Réinitialiser",
    remove: "Supprimer",
    update: "Mettre à jour",
    create: "Créer",
    search: "Rechercher",
    filter: "Filtrer",
    refresh: "Rafraîchir",
    expand: (label) => (label ? `Développer "${label}"` : "Développer"),
    collapse: (label) => (label ? `Réduire "${label}"` : "Réduire")
  },

  // 📅 Libellés des composants de date
  date: {
    days: "Dimanche_Lundi_Mardi_Mercredi_Jeudi_Vendredi_Samedi".split("_"),
    daysShort: "Dim_Lun_Mar_Mer_Jeu_Ven_Sam".split("_"),
    months:
      "Janvier_Février_Mars_Avril_Mai_Juin_Juillet_Août_Septembre_Octobre_Novembre_Décembre".split(
        "_"
      ),
    monthsShort:
      "Jan_Fév_Mar_Avr_Mai_Juin_Juil_Aoû_Sep_Oct_Nov_Déc".split("_"),
    headerTitle: (date) =>
      new Intl.DateTimeFormat("fr", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(date),
    firstDayOfWeek: 1,
    format24h: true,
    pluralDay: "jours",
    prevMonth: "Mois précédent",
    nextMonth: "Mois suivant",
    prevYear: "Année précédente",
    nextYear: "Année suivante",
    today: "Aujourd'hui",
    prevRangeYears: (n) => `Précédent ${n} années`,
    nextRangeYears: (n) => `Suivant ${n} années`,
  },

  // 📊 Tables et pagination
  table: {
    noData: "Aucune donnée à afficher",
    noResults: "Aucune donnée trouvée",
    loading: "Chargement...",
    selectedRecords: (rows) =>
      rows > 0
        ? `${rows} ${rows === 1 ? "ligne sélectionnée" : "lignes sélectionnées"}.`
        : "Aucune ligne sélectionnée.",
    recordsPerPage: "Lignes par page :",
    allRows: "Tous",
    pagination: (start, end, total) => `${start}-${end} sur ${total}`,
    columns: "Colonnes"
  },

  pagination: {
    first: "Première page",
    prev: "Page précédente",
    next: "Page suivante",
    last: "Dernière page"
  },

  // ✍️ Éditeur de texte (QEditor)
  editor: {
    url: "URL",
    bold: "Gras",
    italic: "Italique",
    strikethrough: "Barré",
    underline: "Souligné",
    unorderedList: "Liste non ordonnée",
    orderedList: "Liste ordonnée",
    subscript: "Indice",
    superscript: "Exposant",
    hyperlink: "Hyperlien",
    toggleFullscreen: "Basculer en plein écran",
    quote: "Citation",
    left: "Aligner à gauche",
    center: "Aligner au centre",
    right: "Aligner à droite",
    justify: "Justifier",
    print: "Imprimer",
    outdent: "Diminuer l'indentation",
    indent: "Augmenter l'indentation",
    removeFormat: "Supprimer la mise en forme",
    formatting: "Mise en forme",
    fontSize: "Taille de police",
    align: "Aligner",
    hr: "Insérer une règle horizontale",
    undo: "Annuler",
    redo: "Refaire",
    heading1: "Titre 1",
    heading2: "Titre 2",
    heading3: "Titre 3",
    heading4: "Titre 4",
    heading5: "Titre 5",
    heading6: "Titre 6",
    paragraph: "Paragraphe",
    code: "Code",
    size1: "Très petit",
    size2: "Petit",
    size3: "Normal",
    size4: "Moyen",
    size5: "Grand",
    size6: "Très grand",
    size7: "Maximum",
    defaultFont: "Police par défaut",
    viewSource: "Voir la source"
  },

  // 🌳 Arbre (QTree)
  tree: {
    noNodes: "Aucun nœud à afficher", // ✅ ajouté pour compatibilité zh-CN
    noData: "Aucun nœud à afficher",  // rétrocompatibilité
    noResults: "Aucun nœud trouvé"
  }
};
