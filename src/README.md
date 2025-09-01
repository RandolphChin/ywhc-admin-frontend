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
