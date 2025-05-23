const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:password@mongodb:27016/learning_scan?authSource=admin';

async function initTestCount() {
  try {
    // 连接数据库
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('已连接到数据库');
    
    // 查找所有没有testCount字段或testCount为0的用户
    const usersToUpdate = await User.find({
      $or: [
        { testCount: { $exists: false } },
        { testCount: { $eq: null } }
      ]
    });
    
    console.log(`找到 ${usersToUpdate.length} 个需要初始化测评次数的用户`);
    
    if (usersToUpdate.length === 0) {
      console.log('所有用户都已有测评次数设置');
      process.exit(0);
    }
    
    // 为每个用户设置默认测评次数为2
    for (const user of usersToUpdate) {
      user.testCount = 2;
      await user.save();
      console.log(`为用户 ${user.name} (${user.username}) 设置测评次数为 2`);
    }
    
    console.log(`\n成功为 ${usersToUpdate.length} 个用户初始化测评次数`);
    
  } catch (error) {
    console.error('初始化测评次数时出错:', error);
  } finally {
    // 关闭数据库连接
    await mongoose.disconnect();
    console.log('已断开数据库连接');
    process.exit(0);
  }
}

// 运行脚本
initTestCount(); 