// 测试加密服务的功能
// 在浏览器控制台中运行以下代码进行测试：

/*
// 测试登录数据加密
import encryptionService from '../encryptionService.js'

const testLoginData = {
  username: 'admin',
  password: 'admin123',
  captchaToken: 'test-token',
  rememberMe: false
}

console.log('原始登录数据:', testLoginData)

encryptionService.encryptData(testLoginData, ['password']).then(encryptedData => {
  console.log('加密后登录数据:', encryptedData)
  console.log('是否包含 encrypted 字段:', 'encrypted' in encryptedData)
  console.log('encrypted 字段值:', encryptedData.encrypted)
  console.log('密码是否已加密:', encryptedData.password !== testLoginData.password)
})

// 测试修改密码数据加密
const testPasswordData = {
  oldPassword: 'oldpass123',
  newPassword: 'newpass456'
}

console.log('原始密码数据:', testPasswordData)

encryptionService.encryptData(testPasswordData, ['oldPassword', 'newPassword']).then(encryptedData => {
  console.log('加密后密码数据:', encryptedData)
  console.log('是否包含 encrypted 字段:', 'encrypted' in encryptedData)
  console.log('encrypted 字段值:', encryptedData.encrypted)
  console.log('旧密码是否已加密:', encryptedData.oldPassword !== testPasswordData.oldPassword)
  console.log('新密码是否已加密:', encryptedData.newPassword !== testPasswordData.newPassword)
})
*/

export default {
  // 这个文件主要用于文档说明，实际测试在浏览器控制台进行
}