const mongoose = require('mongoose');
const ParentAdvice = require('../models/ParentAdvice');
require('dotenv').config();

async function clearAdviceData() {
  try {
    // 连接数据库（添加认证信息）
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('未找到MONGODB_URI环境变量');
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      authSource: 'admin',  // 添加认证源
      user: process.env.MONGODB_USER,  // 添加用户名
      pass: process.env.MONGODB_PASS   // 添加密码
    });
    console.log('数据库连接成功');

    // 删除所有AI建议数据
    const result = await ParentAdvice.deleteMany({});
    console.log(`成功删除 ${result.deletedCount} 条AI建议数据`);

    console.log('数据清理完成');
    process.exit(0);
  } catch (error) {
    console.error('清理数据时出错:', error);
    process.exit(1);
  }
}

clearAdviceData(); 