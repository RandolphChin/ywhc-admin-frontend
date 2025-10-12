<template>
  <q-page>
    <!-- <div class="text-h4 q-mb-md">Gestion des journaux</div> -->

    <!-- 🔍 Barre de recherche et zone d’action -->
    <q-card class="q-mb-xs">
      <q-card-section>
        <div class="row q-gutter-sm items-center">
          <!-- Champ : utilisateur opérateur -->
          <q-input
            v-model="queryForm.username"
            :label="t('common.username')"
            outlined
            dense
            clearable
            style="width: 160px;"
          />

          <!-- Champ : description de l’opération -->
          <q-input
            v-model="queryForm.operationDesc"
            :label="t('system.log.operationDesc')"
            outlined
            dense
            clearable
            style="width: 160px;"
          />

          <!-- Sélecteur : méthode HTTP -->
          <q-select
            v-model="queryForm.requestMethod"
            :options="methodOptions"
            :label="t('common.requestMethod')"
            outlined
            dense
            clearable
            emit-value
            map-options
            style="width: 160px;"
          />

          <!-- Sélecteur : statut de la requête -->
          <DictSelect
            v-model="queryForm.status"
            dict-type="response_status"
            :label="t('common.status')"
            :include-all="false"
            style="width: 140px;"
          />

          <!-- Sélecteur : plage de dates -->
          <q-input
            v-model="dateRangeDisplay"
            :label="t('common.timeRange')"
            outlined
            dense
            clearable
            readonly
            style="width: 250px;"
            class="cursor-pointer"
            @clear="clearDateRange"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer" />
            </template>
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="queryForm.dateRange" mask="YYYY-MM-DD" range>
                <div class="row items-center justify-end">
                  <q-btn v-close-popup :label="t('action.cancel')" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-input>

          <!-- Boutons d’action -->
          <q-btn
            color="primary"
            icon="search"
            :label="t('action.search')"
            @click="loadLogs"
          />
          <q-btn
            color="secondary"
            icon="refresh"
            :label="t('action.refresh')"
            @click="resetQuery"
          />
          <q-btn
            color="warning"
            icon="clear_all"
            :label="t('system.log.clearLogs')"
            @click="clearLogs"
            v-permission="'system:log:clear'"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- 📋 Tableau des journaux -->
    <q-card>
      <q-card-section>
        <q-table
          :rows="logs"
          :columns="columns"
          row-key="id"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
          binary-state-sort
          :rows-per-page-options="rowsPerPageOptions"
          :no-data-label="t('common.noData')"
          :no-results-label="t('common.noResults')"
          :loading-label="t('common.loading')"
          :rows-per-page-label="t('common.perPage')"
        >
          <!-- Colonne : méthode HTTP (GET, POST, etc.) -->
          <template v-slot:body-cell-method="props">
            <q-td :props="props">
              <q-badge :color="getMethodColor(props.row.method)" :label="props.row.method" />
            </q-td>
          </template>

          <!-- Colonne : statut de la réponse -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.status == 1 ? 'positive' : 'negative'"
                :label="getStatusLabel(props.row.status)"
              />
            </q-td>
          </template>

          <!-- Colonne : durée d’exécution -->
          <template v-slot:body-cell-executionTime="props">
            <q-td :props="props">
              <q-badge
                :color="getTimeColor(props.row.executionTime)"
                :label="props.row.executionTime + 'ms'"
              />
            </q-td>
          </template>

          <!-- Colonne : actions (voir / modifier) -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                color="primary"
                icon="visibility"
                @click="showLogDetail(props.row)"
              >
                <q-tooltip>{{ t('action.view') ?? 'Voir le détail' }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                color="primary"
                icon="edit"
                @click="showLogEdit(props.row)"
                v-permission="'system:log:edit'"
              >
                <q-tooltip>{{ t('action.edit') }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <!-- Pagination inférieure -->
          <template v-slot:bottom>
            <DataTablePagination
              :pagination="pagination"
              :rows-per-page-options="rowsPerPageOptions"
              @rows-per-page-change="onRowsPerPageChange"
              @page-change="onPageChange"
            />
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- 🧩 Fenêtres de dialogue -->
    <LogEditDialog
      v-model="logDetailDialog"
      :log-data="currentLog"
      :is-readonly="true"
      @refresh="handleRefresh"
    />
    <LogEditDialog
      v-model="logEditDialog"
      :log-data="currentLog"
      :is-edit="true"
      :is-readonly="false"
      @submit="handleSubmit"
    />
    <LogEditDialog
      v-model="logCreateDialog"
      :is-edit="false"
      :is-readonly="false"
      @submit="handleSubmit"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useI18n } from "vue-i18n"
import { logApi } from "src/api"
import { useQuasar } from "quasar"
import DataTablePagination from "src/components/DataTablePagination.vue"
import LogEditDialog from "./LogEditDialog.vue"
import { formatTime } from "src/utils/index"
import { createDictData } from "src/utils/dict"
import DictSelect from "src/components/DictSelect.vue"

defineOptions({ name: "SystemLogPage" })
const { t } = useI18n()
const $q = useQuasar()

// --- États principaux ---
const loading = ref(false)
const logDetailDialog = ref(false)
const logEditDialog = ref(false)
const logCreateDialog = ref(false)
const logs = ref([])
const currentLog = ref(null)

// --- Formulaire de recherche ---
const queryForm = ref({
  username: "",
  requestMethod: "",
  status: null,
  dateRange: null,
})

// --- Pagination par défaut ---
const pagination = ref({
  sortBy: "createTime",
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

// --- Définition des colonnes du tableau ---
const columns = [
  { name: "username", label: t("common.username"), field: "username", align: "left", sortable: true },
  { name: "operationDesc", label: t("system.log.operationDesc"), field: "operationDesc", align: "left", sortable: true },
  { name: "operationType", label: t("system.log.operationType"), field: "operationType", align: "left", format: val => getOperationTypeDescription(val) },
  { name: "requestMethod", label: t("common.requestMethod"), field: "requestMethod", align: "center" },
  { name: "requestUrl", label: t("common.requestUrl"), field: "requestUrl", align: "left" },
  { name: "ipAddress", label: t("common.ipAddress"), field: "ipAddress", align: "left" },
  { name: "status", label: t("common.status"), field: "status", align: "center" },
  { name: "executionTime", label: t("common.executionTime"), field: "executionTime", align: "center" },
  { name: "createTime", label: t("common.createTime"), field: "createTime", align: "center", format: val => formatTime(val, "YYYY-MM-DD HH:mm:ss"), sortable: true },
  { name: "actions", label: t("common.actions"), field: "actions", align: "center" },
]

// --- Chargement des dictionnaires ---
const dictDataMap = createDictData(["request_methods", "response_status"])

// --- Liste déroulante des méthodes HTTP ---
const methodOptions = computed(() =>
  dictDataMap.request_methods?.value?.map(item => ({
    label: item.dictLabel,
    value: item.dictLabel,
  })) ?? []
)

// --- Options d’affichage de pagination ---
const rowsPerPageOptions = [5, 10, 20, 50, 100]

// --- Calcul de la plage de dates ---
const dateRangeDisplay = computed(() => {
  const dateRange = queryForm.value.dateRange
  if (!dateRange) return ""
  const start = dateRange.from ?? dateRange
  const end = dateRange.to ?? dateRange
  return start && end ? `${start} ~ ${end}` : ""
})

// --- Couleurs dynamiques pour les badges ---
const getMethodColor = m => ({ GET: "blue", POST: "green", PUT: "orange", DELETE: "red" }[m] || "grey")
const getTimeColor = t => (t < 500 ? "positive" : t < 1000 ? "warning" : "negative")

// --- Traduction du type d’opération ---
const getOperationTypeDescription = code => {
  const map = { 1: t("action.add") ?? "Ajout", 2: t("action.edit") ?? "Modification", 3: t("action.delete") ?? "Suppression", 4: t("action.search") ?? "Consultation", 5: "Connexion", 6: "Déconnexion" }
  return map[code] || "Inconnu"
}

// --- Chargement des journaux ---
const loadLogs = async (props) => {
  loading.value = true
  try {
    const { page, rowsPerPage, sortBy, descending } = props?.pagination || pagination.value
    const params = {
      current: page,
      size: rowsPerPage,
      orderBy: sortBy || "createTime",
      orderDirection: descending ? "desc" : "asc",
      usernameLike: queryForm.value.username,
      operationDescLike: queryForm.value.operationDesc,
      requestMethod: queryForm.value.requestMethod,
      status: queryForm.value.status,
    }

    const range = queryForm.value.dateRange
    if (range?.from && range?.to) {
      params.createTimeBetween = [`${range.from} 00:00:01`, `${range.to} 23:59:59`]
    }

    const response = await logApi.getList(params)
    const data = response.data.data
    logs.value = data.records || []
    pagination.value.rowsNumber = data.total || 0
  } catch (e) {
    console.error("Erreur de chargement des journaux :", e)
  } finally {
    loading.value = false
  }
}

// --- Événements de pagination ---
const onRequest = (props) => loadLogs(props)
const onRowsPerPageChange = (n) => { pagination.value.rowsPerPage = n; pagination.value.page = 1; loadLogs() }
const onPageChange = (p) => { pagination.value.page = p; onRequest({ pagination: pagination.value }) }

// --- Réinitialiser la recherche ---
const resetQuery = () => {
  queryForm.value = { username: "", requestMethod: "", status: null, dateRange: null }
  loadLogs()
}

// --- Gestion des dialogues ---
const showLogDetail = (log) => { currentLog.value = log; logDetailDialog.value = true }
const showLogEdit = (log) => { currentLog.value = log; logEditDialog.value = true }

// --- Suppression des journaux ---
const clearLogs = () => {
  $q.dialog({
    title: t("common.confirmClearTitle"),
    message: t("system.log.confirmClearMessage"),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await logApi.clear()
      $q.notify({ type: "positive", message: t("system.log.clearSuccess") })
      loadLogs()
    } catch (error) {
      $q.notify({ type: "negative", message: t("common.clearFail") })
    }
  })
}

// --- Récupération du label de statut depuis le dictionnaire ---
const getStatusLabel = (status) => {
  const list = dictDataMap.response_status?.value || []
  const item = list.find(i => i.dictValue == status)
  return item ? item.dictLabel : status
}

// --- Réinitialiser la plage de dates ---
const clearDateRange = () => (queryForm.value.dateRange = { from: "", to: "" })

// --- Rafraîchissement manuel ---
const handleRefresh = () => loadLogs()

// --- Soumission (création / édition) ---
const handleSubmit = async (logData) => {
  try {
    if (logData.id) {
      await logApi.update(logData.id, logData)
      $q.notify({ type: "positive", message: t("system.log.updateSuccess") })
    } else {
      await logApi.create(logData)
      $q.notify({ type: "positive", message: t("system.log.createSuccess") })
    }
    loadLogs()
  } catch (error) {
    $q.notify({ type: "negative", message: t("system.log.operationFail") })
  }
}

// --- Chargement initial ---
onMounted(() => loadLogs())
</script>

<style lang="scss" scoped></style>
