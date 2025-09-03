#### 安装
nodejs 20+
```
npm i -g @quasar/cli
```
#### 运行
```
npm run dev
```

#### 目录结构
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
#### 映射关系
数据库中的 component 字段**（修复后）：
- 用户管理: `system/user`
- 角色管理: `system/role`
- 菜单管理: `system/menu`
- 日志管理: `system/log`

**后端组件映射的 key**：
- `system/user` ✅
- `system/role` ✅
- `system/menu` ✅
- `system/log` ✅

**后端组件映射的 value**：
- `system/user/UserPage.vue`
- `system/role/RolePage.vue`
- `system/menu/MenuPage.vue`
- `system/log/LogPage.vue`

**实际 Vue 文件路径**：
- `pages/system/user/UserPage.vue`
- `pages/system/role/RolePage.vue`
- `pages/system/menu/MenuPage.vue`
- `pages/system/log/LogPage.vue



| 层级 | 路径格式 | 示例 |
|------|----------|------|
| 路由路径 | `/system/user` | 用户访问的URL |
| 数据库component | `system/user` | 数据库存储的组件标识 |
| 组件映射key | `system/user` | API返回的键 |
| 组件映射value | `system/user` | API返回的值（简化） |
| Vue文件路径 | `pages/system/user/UserPage.vue` | 实际文件位置 |

**前端路径构建逻辑**：
1. 接收到 `system/user`
2. 分割路径得到模块名 `user`
3. 首字母大写得到 `User`
4. 构建完整路径 `../pages/system/user/UserPage.vue


菜单 | path | component | Vue文件路径 |
|------|------|-----------|------------|
| 用户管理 | `/system/user` | `system/user` | `pages/system/user/UserPage.vue` |
| 角色管理 | `/system/role` | `system/role` | `pages/system/role/RolePage.vue` |
| 菜单管理 | `/system/menu` | `system/menu` | `pages/system/menu/MenuPage.vue` |
| 日志管理 | `/system/log` | `system/log` | `pages/system/log/LogPage.vue` |


#### 创建权限指令系统

创建了 `ywhc-admin\ywhc-admin-frontend\src\directives\permission.js` 权限指令，支持：
- `v-permission` 指令用于控制按钮和元素的权限显示
- `v-role` 指令用于控制基于角色的权限显示
```
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
```
### 注册权限指令

创建了 `ywhc-admin\ywhc-admin-frontend\src\boot\directives.js` 启动文件，并在 `quasar.config.js` 中注册。
