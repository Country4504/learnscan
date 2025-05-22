// 创建学习风格数据库
db = db.getSiblingDB('learning_scan');

// 创建集合
db.createCollection('users');
db.createCollection('surveys');  // 改为与 mongoose 模型匹配的名称
db.createCollection('reports');  // 添加报告集合

// 创建索引
db.users.createIndex({ "username": 1 }, { unique: true });
db.surveys.createIndex({ "user": 1 });
db.reports.createIndex({ "user": 1 });
db.reports.createIndex({ "survey": 1 });

// 打印确认信息
print('MongoDB 初始化完成'); 