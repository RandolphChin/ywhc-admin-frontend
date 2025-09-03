<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">在线用户</div>

    <!-- 搜索和操作栏 -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-gutter-sm items-center">
          <!-- 用户名查询 -->
          <div class="column q-gutter-xs">
            <q-input
              v-model="queryForm.username"
              label="用户名"
              outlined
              dense
              clearable
              style="width: 160px"
            />
          </div>

          <!-- 昵称查询 -->
          <q-input
            v-model="queryForm.nickname"
            label="昵称 (模糊)"
            outlined
            dense
            clearable
            style="width: 160px"
          />

          <!-- IP地址查询 -->
          <q-input
            v-model="queryForm.ipAddress"
            label="IP地址"
            outlined
            dense
            clearable
            style="width: 160px"
          />

          <!-- 设备类型查询 -->
          <q-select
            v-model="queryForm.deviceType"
            :options="deviceTypeOptions"
            label="设备类型"
            outlined
            dense
            clearable
            emit-value
            map-options
            style="width: 140px"
          />

          <!-- 状态查询 -->
          <q-select
            v-model="queryForm.status"
            :options="statusOptions"
            label="状态"
            outlined
            dense
            clearable
            emit-value
            map-options
            style="width: 120px"
          />

          <q-input
            v-model="dateRangeDisplay"
            label="登录时间范围"
            outlined
            dense
            clearable
            style="width: 250px"
            class="cursor-pointer"
            @clear="clearDateRange"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="queryForm.dateRange" mask="YYYY-MM-DD" range>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="关闭" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="queryForm.dateRange" mask="YYYY-MM-DD" range>
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="关闭" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-input>

          <q-btn
            color="primary"
            icon="search"
            label="搜索"
            @click="loadOnlineUsers"
          />
          <q-btn
            color="secondary"
            icon="refresh"
            label="重置"
            @click="resetQuery"
          />
          <q-btn
            color="info"
            icon="cleaning_services"
            label="清理过期"
            @click="cleanExpiredUsers"
            v-permission="'monitor:online:clean'"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- 统计信息卡片 -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-gutter-md items-center">
          <div class="column items-center">
            <div class="text-h6">{{ onlineUserCount }}</div>
            <div class="text-caption">在线用户总数</div>
          </div>
          <q-separator vertical />
          <div class="column items-center">
            <div class="text-h6">{{ pcUserCount }}</div>
            <div class="text-caption">PC端用户</div>
          </div>
          <q-separator vertical />
          <div class="column items-center">
            <div class="text-h6">{{ mobileUserCount }}</div>
            <div class="text-caption">移动端用户</div>
          </div>
          <q-separator vertical />
          <div class="text-caption q-ml-auto">
            最后更新: {{ lastUpdateTime }}
          </div>
          <q-btn
            color="primary"
            icon="refresh"
            dense
            round
            @click="refreshCount"
          >
            <q-tooltip>刷新统计</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>

    <!-- 在线用户表格 -->
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">在线用户列表</div>

        <q-table
          :rows="onlineUsers"
          :columns="columns"
          row-key="accessToken"
          :loading="loading"
          virtual-scroll
          :rows-per-page-options="[0]"
          :no-data-label="'暂无在线用户'"
          :no-results-label="'未找到匹配的用户'"
          :loading-label="'加载中...'"
        >
          <template v-slot:body-cell-avatar="props">
            <q-td :props="props">
              <q-avatar size="32px">
                <img v-if="props.row.avatar" :src="props.row.avatar" />
                <q-icon v-else name="person" />
              </q-avatar>
            </q-td>
          </template>

          <template v-slot:body-cell-deviceType="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.deviceType == 1 ? 'blue' : 'green'"
                :label="props.row.deviceTypeDesc"
                :icon="props.row.deviceType == 1 ? 'computer' : 'phone_android'"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.status == 1 ? 'positive' : 'negative'"
                :label="props.row.statusDesc"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-browser="props">
            <q-td :props="props">
              <div class="text-caption">
                <div>{{ props.row.browser }}</div>
                <div class="text-grey-6">{{ props.row.os }}</div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-onlineDuration="props">
            <q-td :props="props">
              <q-badge
                :color="getDurationColor(props.row.onlineDuration)"
                :label="formatDuration(props.row.onlineDuration)"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                v-permission="'monitor:online:view'"
                dense
                color="primary"
                icon="visibility"
                @click="showUserDetail(props.row)"
              >
                <q-tooltip>查看详情</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                color="negative"
                icon="logout"
                @click="forceLogout(props.row)"
                v-permission="'monitor:online:forceLogout'"
              >
                <q-tooltip>强制下线</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                color="warning"
                icon="block"
                @click="forceLogoutAllSessions(props.row)"
                v-permission="'monitor:online:forceLogout'"
              >
                <q-tooltip>下线所有会话</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- 用户详情对话框 -->
    <OnlineUserDetailDialog
      v-model="userDetailDialog"
      :user-data="currentUser"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import { onlineUserApi } from "src/api";
import { useQuasar } from "quasar";
import OnlineUserDetailDialog from "./OnlineUserDetailDialog.vue";

defineOptions({
  name: "OnlinePage",
});

const $q = useQuasar();

const loading = ref(false);
const userDetailDialog = ref(false);
const onlineUsers = ref([]);
const currentUser = ref(null);
const onlineUserCount = ref(0);
const lastUpdateTime = ref("");
let autoRefreshTimer = null;

const queryForm = ref({
  username: "",
  nickname: "",
  ipAddress: "",
  deviceType: null,
  status: null,
  dateRange: null,
});

const columns = [
  {
    name: "avatar",
    label: "头像",
    field: "avatar",
    align: "center",
    style: "width: 60px",
  },
  {
    name: "username",
    label: "用户名",
    field: "username",
    align: "left",
    sortable: true,
  },
  {
    name: "nickname",
    label: "昵称",
    field: "nickname",
    align: "left",
    sortable: true,
  },
  {
    name: "ipAddress",
    label: "IP地址",
    field: "ipAddress",
    align: "left",
  },
  {
    name: "location",
    label: "登录地点",
    field: "location",
    align: "left",
  },
  {
    name: "browser",
    label: "浏览器/系统",
    field: "browser",
    align: "left",
  },
  {
    name: "deviceType",
    label: "设备类型",
    field: "deviceType",
    align: "center",
  },
  {
    name: "status",
    label: "状态",
    field: "status",
    align: "center",
  },
  {
    name: "loginTime",
    label: "登录时间",
    field: "loginTime",
    align: "center",
    format: (val) => new Date(val).toLocaleString(),
    sortable: true,
  },
  {
    name: "lastAccessTime",
    label: "最后活动",
    field: "lastAccessTime",
    align: "center",
    format: (val) => new Date(val).toLocaleString(),
    sortable: true,
  },
  {
    name: "onlineDuration",
    label: "在线时长",
    field: "onlineDuration",
    align: "center",
  },
  {
    name: "actions",
    label: "操作",
    field: "actions",
    align: "center",
    style: "width: 150px",
  },
];

const deviceTypeOptions = [
  { label: "PC端", value: 1 },
  { label: "移动端", value: 2 },
];

const statusOptions = [
  { label: "在线", value: 1 },
  { label: "离线", value: 0 },
];

const dateRangeDisplay = computed(() => {
  if (!queryForm.value.dateRange) return "";
  if (queryForm.value.dateRange.from && queryForm.value.dateRange.to) {
    return `${queryForm.value.dateRange.from} ~ ${queryForm.value.dateRange.to}`;
  }
  if (queryForm.value.dateRange && !queryForm.value.dateRange.from) {
    return `${queryForm.value.dateRange} ~ ${queryForm.value.dateRange}`;
  }
  return "";
});

const pcUserCount = computed(() => {
  return onlineUsers.value.filter((user) => user.deviceType === 1).length;
});

const mobileUserCount = computed(() => {
  return onlineUsers.value.filter((user) => user.deviceType === 2).length;
});

const getDurationColor = (duration) => {
  if (duration < 30) return "info";
  if (duration < 120) return "positive";
  if (duration < 300) return "warning";
  return "deep-orange";
};

const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}小时${remainingMinutes}分钟`;
};

const loadOnlineUsers = async () => {
  loading.value = true;

  try {
    // 构建查询参数
    const params = {
      username: queryForm.value.username,
      nicknameLike: queryForm.value.nickname,
      ipAddress: queryForm.value.ipAddress,
      deviceType: queryForm.value.deviceType,
      status: queryForm.value.status,
    };

    // 日期范围查询
    const dateRange = queryForm.value.dateRange;
    if (dateRange) {
      const startDate = dateRange?.from ?? dateRange;
      const endDate = dateRange?.to ?? dateRange;

      params.loginTimeRange = {
        startTime: `${startDate} 00:00:00`,
        endTime: `${endDate} 23:59:59`,
      };
    }

    const response = await onlineUserApi.getList(params);
    onlineUsers.value = response.data.data || [];

    // 更新统计信息
    await refreshCount();
  } catch (error) {
    console.error("加载在线用户列表失败:", error);
    $q.notify({
      type: "negative",
      message: "加载在线用户列表失败",
    });
  } finally {
    loading.value = false;
  }
};

const refreshCount = async () => {
  try {
    const response = await onlineUserApi.getCount();
    onlineUserCount.value = response.data.data || 0;
    lastUpdateTime.value = new Date().toLocaleString();
  } catch (error) {
    console.error("获取在线用户数量失败:", error);
  }
};

const resetQuery = () => {
  queryForm.value = {
    username: "",
    nickname: "",
    ipAddress: "",
    deviceType: null,
    status: null,
    dateRange: null,
  };
  loadOnlineUsers();
};

const showUserDetail = (user) => {
  currentUser.value = user;
  userDetailDialog.value = true;
};

const forceLogout = (user) => {
  $q.dialog({
    title: "确认强制下线",
    message: `确定要强制用户 "${user.username}" 下线吗？`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await onlineUserApi.forceLogout(user.accessToken);
      $q.notify({
        type: "positive",
        message: "用户已强制下线",
      });
      loadOnlineUsers();
    } catch (error) {
      $q.notify({
        type: "negative",
        message: error.response?.data?.message || "强制下线失败",
      });
    }
  });
};

const forceLogoutAllSessions = (user) => {
  $q.dialog({
    title: "确认下线所有会话",
    message: `确定要强制用户 "${user.username}" 的所有会话下线吗？`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await onlineUserApi.forceLogoutByUserId(user.userId);
      $q.notify({
        type: "positive",
        message: "用户所有会话已强制下线",
      });
      loadOnlineUsers();
    } catch (error) {
      $q.notify({
        type: "negative",
        message: error.response?.data?.message || "强制下线失败",
      });
    }
  });
};

const cleanExpiredUsers = () => {
  $q.dialog({
    title: "确认清理过期用户",
    message: "确定要清理所有过期的在线用户数据吗？",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await onlineUserApi.cleanExpired();
      $q.notify({
        type: "positive",
        message: "过期用户清理完成",
      });
      loadOnlineUsers();
    } catch (error) {
      $q.notify({
        type: "negative",
        message: error.response?.data?.message || "清理失败",
      });
    }
  });
};

const clearDateRange = () => {
  queryForm.value.dateRange = null;
};

// 自动刷新功能
const startAutoRefresh = () => {
  autoRefreshTimer = setInterval(() => {
    loadOnlineUsers();
  }, 30000); // 每30秒自动刷新
};

const stopAutoRefresh = () => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
  }
};

onMounted(() => {
  loadOnlineUsers();
  startAutoRefresh();
});

onBeforeUnmount(() => {
  stopAutoRefresh();
});
</script>

<style lang="scss" scoped></style>
