const mongoose = require('mongoose');
const Admin = require('../src/models/Admin');
require('dotenv').config();

async function createAdmin() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://root:password@localhost:27017/learning_scan?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('成功连接到数据库');
    
    // 检查是否已存在admin用户
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('管理员账户已存在');
      process.exit(0);
    }
    
    // 创建admin用户
    const admin = new Admin({
      username: 'admin',
      password: 'admin123',  // 会被中间件自动加密
      name: '系统管理员',
      role: 'super_admin'
    });
    
    await admin.save();
    console.log('管理员账户创建成功');
    console.log('用户名: admin');
    console.log('密码: admin123');
    console.log('角色: super_admin');
    
  } catch (error) {
    console.error('创建管理员账户失败:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createAdmin(); 