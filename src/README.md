# 🧩 Module Système — Documentation Technique (Formavue)

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Quasar](https://img.shields.io/badge/Quasar-v2.x-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)
![Language](https://img.shields.io/badge/lang-French-blue)

> Documentation du module **System** de l’application **Formavue Admin**,  
> basée sur **Vue 3**, **Quasar 2**, et **TypeScript**.

---

## 🧭 Sommaire
[[toc]]

---

## ⚙️ Installation

### Prérequis
- **Node.js ≥ 20**

```bash
npm i -g @quasar/cli
```

---

## 🚀 Démarrage du projet

```bash
npm run dev
```

---

## 📁 Structure des répertoires

```
src/pages/system/
├── user/
│   ├── UserPage.vue
│   └── UserEditDialog.vue
├── role/
│   ├── RolePage.vue
│   └── RoleEditDialog.vue
├── menu/
│   ├── MenuPage.vue
│   └── MenuEditDialog.vue
└── log/
    ├── LogPage.vue
    └── LogDetailDialog.vue


src/api/system/
├── user/user.js
├── role/role.js
├── menu/menu.js
└── log/log.js
```

---

## 🔗 Correspondances entre composants et routes

### Champ `component` (base de données)

| Fonction | Valeur `component` |
|-----------|--------------------|
| Gestion des utilisateurs | `system/user` |
| Gestion des rôles | `system/role` |
| Gestion des menus | `system/menu` |
| Gestion des journaux | `system/log` |

### Mappage backend (clé → valeur)

| Type | Exemple |
|------|----------|
| **Key** | `system/user` |
| **Value** | `system/user/UserPage.vue` |

### Chemins réels

- `pages/system/user/UserPage.vue`  
- `pages/system/role/RolePage.vue`  
- `pages/system/menu/MenuPage.vue`  
- `pages/system/log/LogPage.vue`

---

## 🧠 Logique de construction du chemin (frontend)

1. Réception du champ `component` → `system/user`  
2. Extraction du module (`user`)  
3. Conversion en PascalCase → `User`  
4. Construction du chemin complet :  
   `../pages/system/user/UserPage.vue`

---

### Exemple global

| Menu | path | component | Fichier Vue |
|------|------|------------|--------------|
| Gestion des utilisateurs | `/system/user` | `system/user` | `pages/system/user/UserPage.vue` |
| Gestion des rôles | `/system/role` | `system/role` | `pages/system/role/RolePage.vue` |
| Gestion des menus | `/system/menu` | `system/menu` | `pages/system/menu/MenuPage.vue` |
| Gestion des journaux | `/system/log` | `system/log` | `pages/system/log/LogPage.vue` |

---

## 🛡️ Système de directives de permissions

### 📂 Fichier de directives
`src/directives/permission.js`

### Fonctionnalités
- `v-permission` → contrôle l’affichage selon les permissions.  
- `v-role` → contrôle l’affichage selon les rôles utilisateurs.

```vue
<q-btn
  flat
  v-permission="'monitor:online:view'"
  dense
  color="primary"
  icon="visibility"
  @click="showUserDetail(props.row)"
>
  <q-tooltip>Voir les détails</q-tooltip>
</q-btn>
```

### ⚙️ Enregistrement dans Quasar
Créer `src/boot/directives.js`, puis ajouter dans `quasar.config.js` :
```js
boot: ['directives']
```

---

## 🎨 Styles globaux — Détails & Formulaires d’édition

Fichier commun :  
`src/css/detail-edit-common.scss`

### 🧾 Styles de page de détails
- `.detail-form` — conteneur principal  
- `.detail-field-inline` — étiquette + valeur sur la même ligne  
- `.detail-field-block` — présentation verticale  
- `.code-block` — formatage de blocs JSON ou code  
- `.error-block` — bloc d’erreur

### 🧰 Styles de formulaire d’édition
- `.edit-form` — conteneur principal  
- `.form-section` — regroupement logique  

### 💬 Styles de dialogues
- `.dialog-card` — carte principale  
- `.dialog-header` — en-tête  
- `.dialog-content` — zone de contenu (scroll custom)  
- `.dialog-footer` — pied du dialogue  

### 🎯 Styles spécifiques
- `.detail-dialog` — pour les vues de détails  
- `.edit-dialog` — pour les formulaires d’édition  
- `.dialog-sticky-actions` — barre d’action fixe  

### 🧱 Classes utilitaires
- `.copy-btn` — bouton copier  
- `.status-badge` — badge de statut  
- `.section-divider` — séparateur visuel  

### 📱 Responsive
- Adaptations pour écrans < 768px  

### 🎞️ Animations
- `.fade-enter-active / .fade-leave-active` — fondu  
- `.slide-up-enter-active / .slide-up-leave-active` — glissement vertical  

---

## 🪟 Exemple : Détails / Édition / Création d’un journal

```vue
<!-- Détails -->
<LogEditDialog 
  v-model="logDetailDialog" 
  :log-data="currentLog" 
  :is-readonly="true"
  @refresh="handleRefresh"
/>

<!-- Édition -->
<LogEditDialog 
  v-model="logEditDialog" 
  :log-data="currentLog" 
  :is-edit="true"
  :is-readonly="false"
  @submit="handleSubmit"
/>

<!-- Création -->
<LogEditDialog 
  v-model="logCreateDialog" 
  :is-edit="false"
  :is-readonly="false"
  @submit="handleSubmit"
/>
```

---

## 📚 Utilisation du système de dictionnaires

### 1️⃣ Utilisation via utilitaire `useDictionary`

```javascript
import { useDictionary } from 'src/utils/dict'

const { getDictData, getDictLabel, getDictOptions } = useDictionary()

// Données du dictionnaire
const genderDict = await getDictData('sys_user_sex')

// Étiquette d’une valeur
const genderLabel = await getDictLabel('sys_user_sex', '1')

// Options pour un <q-select>
const genderOptions = await getDictOptions('sys_user_sex')
```

---

### 2️⃣ Composant de sélection (DictSelect)

```vue
<template>
  <DictSelect
    v-model="queryForm.status"
    dict-type="response_status"
    label="Statut de l’opération"
    :include-all="false"
    style="width: 140px;"
  />
</template>

<script setup>
import DictSelect from 'src/components/DictSelect.vue'
import { ref } from 'vue'
</script>
```

---

### 3️⃣ Utilisation dans une page Vue

```vue
<template>
  <div>
    <q-select
      v-model="queryForm.status"
      :options="statusOptions"
      label="Statut"
      emit-value
      map-options
    />

    <q-table :columns="columns" :rows="rows">
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :label="getStatusLabel(props.row.status)" />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDictionary } from 'src/utils/dict'

const { getDictOptions, getDictLabel } = useDictionary()

const statusOptions = ref([])
const queryForm = ref({ status: '' })

// Charger les options
const loadStatusOptions = async () => {
  statusOptions.value = await getDictOptions('sys_common_status')
}

// Obtenir le libellé
const getStatusLabel = async (status) => {
  return await getDictLabel('sys_common_status', status)
}

onMounted(() => {
  loadStatusOptions()
})
</script>
```

---

### 4️⃣ Chargement multiple de dictionnaires

```javascript
import { useDictionary, createDictData } from 'src/utils/dict'

// Méthode 1 — Chargement manuel
const { getBatchDictData } = useDictionary()
const dictData = await getBatchDictData(['sys_user_sex', 'sys_common_status'])

// Méthode 2 — Chargement réactif
const dictDataMap = createDictData(['sys_user_sex', 'sys_common_status'])
// dictDataMap.sys_user_sex et dictDataMap.sys_common_status sont réactifs
```

---

## 🧾 Résumé

- ✅ Structure modulaire `system/*` cohérente  
- ✅ Routage dynamique basé sur `component`  
- ✅ Directives de permissions (`v-permission`, `v-role`)  
- ✅ Feuille de styles unifiée `detail-edit-common.scss`  
- ✅ Intégration complète du système de dictionnaires  
- ✅ Dialogues cohérents pour création, édition et consultation  

---

## 👤 Mainteneur
**Carmelo Guarneri**  
📧 [contact@formavue.com](mailto:contact@formavue.com)  
🌐 [https://formavue.com](https://formavue.com)
