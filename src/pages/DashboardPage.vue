<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">{{ t('dashboard.title') }}</div>
    
    <!-- Cartes de statistiques -->
    <div class="row q-gutter-md q-mb-xl">
      <div class="col-12 col-sm-6 col-md-3" v-for="card in statCards" :key="card.key">
        <q-card :class="card.color + ' text-white'">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6">{{ t(card.label) }}</div>
                <div class="text-h4">{{ stats[card.key] }}</div>
              </div>
              <div class="col-auto">
                <q-icon :name="card.icon" size="48px" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Actions rapides -->
    <div class="row q-gutter-md q-mb-xl">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ t('dashboard.shortcuts') }}</div>
            <div class="row q-gutter-sm">
              <q-btn color="primary" icon="person_add" :label="t('dashboard.add_user')" @click="$router.push('/system/user')" />
              <q-btn color="secondary" icon="add_circle" :label="t('dashboard.add_role')" @click="$router.push('/system/role')" />
              <q-btn color="accent" icon="menu_book" :label="t('dashboard.menu_management')" @click="$router.push('/system/menu')" />
              <q-btn color="info" icon="description" :label="t('dashboard.view_logs')" @click="$router.push('/system/log')" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ t('dashboard.system_info') }}</div>
            <q-list dense>
              <q-item>
                <q-item-section>
                  <q-item-label>{{ t('dashboard.version') }}</q-item-label>
                  <q-item-label caption>YWHC Admin v1.0.0</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label>{{ t('dashboard.backend') }}</q-item-label>
                  <q-item-label caption>Spring Boot 3.x</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label>{{ t('dashboard.frontend') }}</q-item-label>
                  <q-item-label caption>Quasar Framework v2</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label>{{ t('dashboard.database') }}</q-item-label>
                  <q-item-label caption>MySQL 8.0</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dernières opérations -->
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">{{ t('dashboard.recent_logs') }}</div>
        <q-table
          :rows="recentLogs"
          :columns="logColumns"
          row-key="id"
          :pagination="{ rowsPerPage: 5 }"
          flat
          bordered
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const stats = ref({
  userCount: 0,
  roleCount: 0,
  menuCount: 0,
  todayVisit: 0
});

const recentLogs = ref([]);

const statCards = [
  { key: 'userCount', label: 'dashboard.total_users', color: 'bg-blue-5', icon: 'people' },
  { key: 'roleCount', label: 'dashboard.total_roles', color: 'bg-green-5', icon: 'assignment_ind' },
  { key: 'menuCount', label: 'dashboard.total_menus', color: 'bg-orange-5', icon: 'menu' },
  { key: 'todayVisit', label: 'dashboard.today_visits', color: 'bg-purple-5', icon: 'visibility' }
];

const logColumns = [
  { name: 'username', label: t('dashboard.user'), field: 'username', align: 'left' },
  { name: 'operation', label: t('dashboard.operation'), field: 'operation', align: 'left' },
  { name: 'method', label: t('dashboard.method'), field: 'method', align: 'center' },
  { name: 'uri', label: t('dashboard.uri'), field: 'uri', align: 'left' },
  { name: 'createTime', label: t('dashboard.time'), field: 'createTime', align: 'center', format: (val: string) => new Date(val).toLocaleString() }
];

const loadStats = async () => {
  stats.value = { userCount: 156, roleCount: 8, menuCount: 24, todayVisit: 1024 };
};

const loadRecentLogs = async () => {
  recentLogs.value = [
    { id: 1, username: 'admin', operation: t('dashboard.login'), method: 'POST', uri: '/auth/login', createTime: new Date() },
    { id: 2, username: 'admin', operation: t('dashboard.view_users'), method: 'GET', uri: '/system/user/list', createTime: new Date(Date.now() - 300000) },
    { id: 3, username: 'admin', operation: t('dashboard.add_user'), method: 'POST', uri: '/system/user', createTime: new Date(Date.now() - 600000) }
  ];
};

onMounted(() => {
  loadStats();
  loadRecentLogs();
});
</script>
