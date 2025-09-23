# API 目录说明

## 文件结构

```
src/api/
├── auth.js                 # 认证相关 API（集成了自动加密功能）
├── encryptionService.js    # 加密服务（统一管理 RSA 公钥和数据加密）
├── dict.js                 # 字典相关 API
├── index.js                # API 统一导出
├── stats.js                # 统计相关 API
├── monitor/                # 监控相关 API
└── system/                 # 系统管理相关 API
```

## 加密服务 (encryptionService.js)

### 功能特性

- **单例模式**：全局唯一实例，避免重复初始化
- **自动公钥管理**：自动获取和缓存 RSA 公钥
- **智能加密**：根据公钥状态自动决定是否加密
- **循环依赖解决**：直接使用 axios 实例，避免与 auth.js 的循环依赖
- **错误处理**：优雅处理加密失败，自动降级为明文传输

### 主要方法

- `loadPublicKey()`: 获取 RSA 公钥
- `encryptData(data, fields)`: 加密指定字段
- `reset()`: 重置加密状态
- `isEncryptionEnabled()`: 检查是否启用加密
- `isPublicKeyLoaded()`: 检查公钥是否已加载

## 认证 API (auth.js)

### 自动加密功能

- **登录 API**: 自动加密 `password` 字段，并添加 `encrypted: true` 标识
- **修改密码 API**: 自动加密 `oldPassword` 和 `newPassword` 字段，并添加 `encrypted: true` 标识
- **透明处理**: 调用方无需关心加密细节
- **智能降级**: 如果加密失败，自动设置 `encrypted: false` 并使用明文传输

### 数据格式

**加密成功时的请求数据**：
```javascript
{
  username: 'admin',
  password: 'lVRGNH8ayf65pYQ/ohta91BJXz4fbCxdCpmvABYELZJhGnurEGbcWe1n2R5/7BITdikg0VzJFpt46nCFbWINDeDnmOCy54sWZ1qp2Hd50S1uKWDyb0FcyJUMIc74HWgk890wr0TJ/OJwmMTk+g8M8gCSfQ4ag3sXwM7RVg32STFv4Fy5QUkDKbSye1GJE/viCVMPW2RYp08vuOBwVJawepMjYn2XJ/UBRaxNf0WaeMC/iO0cLroWsg0uy2nA4LbTlHTH3NiUhO/ESpeLHzEFdPp/NMRFUbLBX8ObulPUxTDZvIA8fguaakw9k/TeIP2hLeDf4eArovJtnStxfYWadg==',
  encrypted: true,  // 关键标识
  captchaToken: 'xxx',
  rememberMe: false
}
```

**加密失败时的请求数据**：
```javascript
{
  username: 'admin',
  password: 'admin123',  // 明文密码
  encrypted: false,      // 标识未加密
  captchaToken: 'xxx',
  rememberMe: false
}
```

### 使用示例

```javascript
import { authApi } from 'src/api/auth'

// 登录 - 密码会自动加密并添加 encrypted 标识
await authApi.login({
  username: 'admin',
  password: 'password123'
})

// 修改密码 - 旧密码和新密码会自动加密并添加 encrypted 标识
await authApi.changePassword({
  oldPassword: 'oldpass',
  newPassword: 'newpass'
})
```

## 优势

1. **避免循环依赖**: encryptionService 直接使用 axios 实例
2. **代码复用**: 消除重复的加密逻辑
3. **关注点分离**: API 层处理加密，组件专注业务逻辑
4. **易于维护**: 加密逻辑集中管理
5. **向后兼容**: 加密失败时自动降级为明文传输