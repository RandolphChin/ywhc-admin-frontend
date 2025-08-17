<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">仪表盘</div>
    
    <!-- 统计卡片 -->
    <div class="row q-gutter-md q-mb-xl">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-blue-5 text-white">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6">用户总数</div>
                <div class="text-h4">{{ stats.userCount }}</div>
              </div>
              <div class="col-auto">
                <q-icon name="people" size="48px" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-green-5 text-white">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6">角色总数</div>
                <div class="text-h4">{{ stats.roleCount }}</div>
              </div>
              <div class="col-auto">
                <q-icon name="assignment_ind" size="48px" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-orange-5 text-white">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6">菜单总数</div>
                <div class="text-h4">{{ stats.menuCount }}</div>
              </div>
              <div class="col-auto">
                <q-icon name="menu" size="48px" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-purple-5 text-white">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6">今日访问</div>
                <div class="text-h4">{{ stats.todayVisit }}</div>
              </div>
              <div class="col-auto">
                <q-icon name="visibility" size="48px" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="row q-gutter-md q-mb-xl">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">快捷操作</div>
            <div class="row q-gutter-sm">
              <q-btn
                color="primary"
                icon="person_add"
                label="添加用户"
                @click="$router.push('/system/user')"
              />
              <q-btn
                color="secondary"
                icon="add_circle"
                label="添加角色"
                @click="$router.push('/system/role')"
              />
              <q-btn
                color="accent"
                icon="menu_book"
                label="菜单管理"
                @click="$router.push('/system/menu')"
              />
              <q-btn
                color="info"
                icon="description"
                label="查看日志"
                @click="$router.push('/system/log')"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">系统信息</div>
            <q-list dense>
              <q-item>
                <q-item-section>
                  <q-item-label>系统版本</q-item-label>
                  <q-item-label caption>YWHC Admin v1.0.0</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label>后端框架</q-item-label>
                  <q-item-label caption>Spring Boot 3.x</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label>前端框架</q-item-label>
                  <q-item-label caption>Quasar Framework v2</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label>数据库</q-item-label>
                  <q-item-label caption>MySQL 8.0</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 最近操作日志 -->
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">最近操作日志</div>
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

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'

export default defineComponent({
  name: 'DashboardPage',

  setup() {
    const stats = ref({
      userCount: 0,
      roleCount: 0,
      menuCount: 0,
      todayVisit: 0
    })

    const recentLogs = ref([])

    const logColumns = [
      {
        name: 'username',
        label: '操作用户',
        field: 'username',
        align: 'left'
      },
      {
        name: 'operation',
        label: '操作类型',
        field: 'operation',
        align: 'left'
      },
      {
        name: 'method',
        label: '请求方法',
        field: 'method',
        align: 'center'
      },
      {
        name: 'uri',
        label: '请求URI',
        field: 'uri',
        align: 'left'
      },
      {
        name: 'createTime',
        label: '操作时间',
        field: 'createTime',
        align: 'center',
        format: (val) => new Date(val).toLocaleString()
      }
    ]

    const loadStats = async () => {
      try {
        // 模拟数据，实际应该从后端API获取
        stats.value = {
          userCount: 156,
          roleCount: 8,
          menuCount: 24,
          todayVisit: 1024
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    }

    const loadRecentLogs = async () => {
      try {
        // 模拟数据，实际应该从后端API获取
        recentLogs.value = [
          {
            id: 1,
            username: 'admin',
            operation: '用户登录',
            method: 'POST',
            uri: '/auth/login',
            createTime: new Date()
          },
          {
            id: 2,
            username: 'admin',
            operation: '查看用户列表',
            method: 'GET',
            uri: '/system/user/list',
            createTime: new Date(Date.now() - 300000)
          },
          {
            id: 3,
            username: 'admin',
            operation: '添加用户',
            method: 'POST',
            uri: '/system/user',
            createTime: new Date(Date.now() - 600000)
          }
        ]
      } catch (error) {
        console.error('加载操作日志失败:', error)
      }
    }

    onMounted(() => {
      loadStats()
      loadRecentLogs()
    })

    return {
      stats,
      recentLogs,
      logColumns
    }
  }
})
</script>
