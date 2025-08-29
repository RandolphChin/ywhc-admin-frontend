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