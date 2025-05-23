// 创建学习风格数据库
db = db.getSiblingDB('learning_scan');

// 创建集合
db.createCollection('users');
db.createCollection('surveys');  // 改为与 mongoose 模型匹配的名称
db.createCollection('reports');  // 添加报告集合
db.createCollection('admins');

// 创建索引
db.users.createIndex({ "username": 1 }, { unique: true });
db.surveys.createIndex({ "user": 1 });
db.reports.createIndex({ "user": 1 });
db.reports.createIndex({ "survey": 1 });
db.admins.createIndex({ "username": 1 }, { unique: true });

// 打印确认信息
console.log('数据库初始化完成');
console.log('创建了以下集合: users, surveys, reports, admins');
console.log('创建了相应的索引'); 