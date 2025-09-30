## 项目介绍 - 前端

一个基于 Vue 3 + Quasar Framework v2 UI框架构建的现代化企业级后台管理系统前端应用。

## 🌐 语言 / Language

**中文** | [English](README-en.md)

## 🔗 快速导航

| 项目 | 描述 | 链接 |
|------|------|------|
| 🖥️ **后端项目** | Spring Boot 后端服务 | [ywhc-admin-backend](https://github.com/your-org/ywhc-admin/tree/main/ywhc-admin-backend) |
| 🌐 **前端项目** | Vue3 + Quasar 前端应用 | [ywhc-admin-frontend](https://github.com/your-org/ywhc-admin/tree/main/ywhc-admin-frontend) |

## 📋 功能特性

- 🎨 **现代化 UI** - 基于 Material Design 的美观界面
- 👥 **用户管理** - 用户相关配置，默认密码admin123
- 🏢 **部门管理** - 组织架构管理，树形表格形式
- 🎯 **角色权限** - 灵活的 RBAC 权限控制
- 📊 **数据权限** - 数据范围控制（全部/部门/部门及以下/仅本人）
- 📋 **菜单管理** - 动态菜单配置，前端动态菜单路由
- 🔐 **用户认证与授权** - 基于 JWT 的安全认证体系
- 📝 **操作日志** - 完整的系统操作审计
- 📚 **数据字典** - 系统配置管理
- 🖼️ **滑块验证码** - 安全的图形验证
- 📈 **在线用户监控** - 实时用户状态管理
- 📊 **代码生成** - 代码预览、下载，生成前后端代码


## 🛠️ 技术栈

- **Vue 3** 3.4.18 - 渐进式 JavaScript 框架
- **Quasar Framework** 2.6.0 - Vue.js 组件库和框架
- **Vue Router** 4.0.12 - 官方路由管理器
- **Pinia** 2.1.7 - 状态管理库
- **Vite** - 现代化构建工具
- **Axios** 1.6.0 - HTTP 客户端
- **go-captcha-vue** 2.0.6 - 滑块验证码组件
- **jsencrypt** 3.5.4 - RSA 加密库

## 📋 环境要求

### 必需环境
- **Node.js** 18.0+ 或更高版本
- **npm** 8.0+ 或 **yarn** 1.21.1+
- **现代浏览器** (Chrome 87+, Firefox 78+, Safari 13.1+, Edge 88+，不支持IE)


## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/your-org/ywhc-admin.git
cd ywhc-admin/ywhc-admin-frontend
```

### 2. 安装依赖
```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

### 4. 启动开发服务器
```bash
# 开发模式
npm run dev
# 或
yarn dev

# 应用将在 http://localhost:3000 启动
```


## 📁 项目结构

```
ywhc-admin-frontend/
├── public/                  # 静态资源
│   └── icons/              # 应用图标
├── src/
│   ├── api/                # API 接口定义
│   │   ├── monitor/        # 监控相关API
│   │   │   └── online/     # 在线用户API
│   │   ├── system/         # 系统管理API
│   │   │   ├── dept/       # 部门管理API
│   │   │   ├── generator/  # 代码生成API
│   │   │   ├── log/        # 日志管理API
│   │   │   ├── menu/       # 菜单管理API
│   │   │   ├── role/       # 角色管理API
│   │   │   └── user/       # 用户管理API
│   │   ├── test/           # 测试相关API
│   │   │   └── enterprise/ # 企业测试API
│   │   ├── auth.js         # 认证API
│   │   ├── dict.js         # 字典API
│   │   └── stats.js        # 统计API
│   ├── boot/               # Quasar 启动文件
│   │   ├── auth.js         # 认证配置
│   │   ├── axios.js        # HTTP 请求配置
│   │   ├── directives.js   # 指令配置
│   │   ├── pinia.js        # 状态管理配置
│   │   └── router.js       # 路由配置
│   ├── components/         # 公共组件
│   │   ├── DataTablePagination.vue  # 数据表格分页
│   │   ├── DictSelect.vue           # 字典选择器
│   │   ├── IconSelector.vue         # 图标选择器
│   │   └── SlideCaptcha.vue         # 滑块验证码
│   ├── css/                # 样式文件
│   │   ├── themes/         # 主题样式
│   │   │   └── modern-theme.scss    # 现代主题
│   │   ├── app.scss        # 主样式文件
│   │   ├── detail-edit-common.scss  # 详情编辑通用样式
│   │   └── quasar.variables.scss    # Quasar 变量
│   ├── directives/         # 自定义指令
│   │   └── permission.js   # 权限指令
│   ├── layouts/            # 页面布局
│   │   └── MainLayout.vue  # 主布局
│   ├── pages/              # 页面组件
│   │   ├── monitor/        # 系统监控页面
│   │   │   └── online/     # 在线用户监控
│   │   ├── system/         # 系统管理页面
│   │   │   ├── dept/       # 部门管理
│   │   │   ├── dict/       # 字典管理
│   │   │   ├── generator/  # 代码生成
│   │   │   ├── log/        # 日志管理
│   │   │   ├── menu/       # 菜单管理
│   │   │   ├── role/       # 角色管理
│   │   │   └── user/       # 用户管理
│   │   ├── DashboardPage.vue        # 仪表板页面
│   │   ├── ErrorNotFound.vue        # 404页面
│   │   ├── LoginPage.vue            # 登录页面
│   │   └── ProfilePage.vue          # 个人资料页面
│   ├── router/             # 路由配置
│   │   ├── dynamicRoutes.js         # 动态路由
│   │   ├── index.js        # 路由主文件
│   │   └── routes.js       # 静态路由定义
│   ├── stores/             # Pinia 状态管理
│   │   └── auth.js         # 认证状态管理
│   ├── utils/              # 工具函数
│   │   ├── crypto.js       # 加密工具
│   │   ├── dict.js         # 字典工具
│   │   └── index.js        # 通用工具
│   ├── App.vue             # 根组件
│   └── README.md           # 源码说明
├── images/                 # 系统截图
├── .env.development        # 开发环境配置
├── .env.production         # 生产环境配置
├── .eslintrc.js           # ESLint 配置
├── .gitignore             # Git 忽略文件
├── index.html             # HTML 入口文件
├── package.json           # 项目依赖配置
├── quasar.config.js       # Quasar 配置文件
└── README.md              # 项目说明文档
```

## 📸 系统截图

### 登录界面
![登录界面](images/登录.png)

### 用户界面
![用户界面](images/用户.png)

### 角色界面
![角色界面](images/角色.png)

### 字典界面
![字典界面](images/字典.png)

### 菜单界面
![菜单界面](images/菜单.png)

### 日志界面
![日志界面](images/日志.png)

### 代码生成功能
![代码生成](images/代码生成.png)

### 业务示例
![业务示例](images/业务示例.png)


## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。


## 🙏 致谢

感谢以下开源项目：
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Quasar Framework](https://quasar.dev/) - Vue.js 组件库

---

⭐ 如果这个项目对你有帮助，请给我一个 Star！
