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
#### 详情和编辑表单通用样式

创建了 `ywhc-admin\ywhc-admin-frontend\src\css\detail-edit-common.scss` 文件，用于统一管理详情和编辑表单的样式。

详情页面样式 (Detail View Styles)
* .detail-form - 详情表单容器
* .detail-field-inline - 行内字段显示（标签和值同一行）
* .detail-field-block - 块级字段显示（标签在上，值在下）
* .code-block - 代码块样式（JSON、参数等）
* .error-block - 错误信息块样式
编辑表单样式 (Edit Form Styles)
* .edit-form - 编辑表单容器
* .form-section - 表单分组样式
对话框通用样式 (Dialog Common Styles)
* .dialog-card - 对话框卡片样式
* .dialog-header - 对话框头部样式
* .dialog-content - 对话框内容区域（含自定义滚动条）
* .dialog-footer - 对话框底部样式
特定对话框样式 (Specific Dialog Styles)
* .detail-dialog - 详情对话框特定样式
* .edit-dialog - 编辑对话框特定样式
* .dialog-sticky-actions - 粘性操作栏样式
工具类 (Utility Classes)
* .copy-btn - 复制按钮样式
* .status-badge - 状态徽章样式
* .section-divider - 分组分隔线样式
响应式设计 (Responsive Design)
移动端适配样式（768px以下）
动画效果 (Animations)
* .fade-enter-active / .fade-leave-active - 淡入淡出动画
* .slide-up-enter-active / .slide-up-leave-active - 滑入滑出动画
