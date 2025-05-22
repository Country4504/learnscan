const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const dotenv = require('dotenv');
// 添加EJS布局模块
const expressLayouts = require('express-ejs-layouts');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 开发环境配置
if (process.env.NODE_ENV !== 'production') {
  // 禁用模板缓存
  app.disable('view cache');
  // 启用更详细的日志
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// 配置中间件
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 设置视图引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// 配置EJS布局
app.use(expressLayouts);
app.set('layout', 'layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// 配置会话
app.use(session({
  secret: process.env.SESSION_SECRET || 'learnscan_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/learnscan',
    ttl: 14 * 24 * 60 * 60 // 14天
  }),
  cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 } // 14天
}));

// 设置路由
const indexRoutes = require('./src/controllers/indexController');
const surveyRoutes = require('./src/controllers/surveyController');
const reportRoutes = require('./src/controllers/reportController');
const userRoutes = require('./src/controllers/userController');

app.use('/', indexRoutes);
app.use('/survey', surveyRoutes);
app.use('/report', reportRoutes);
app.use('/user', userRoutes);

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb_app:27017/learnscan', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('成功连接到MongoDB数据库');
})
.catch(err => {
  console.error('数据库连接失败:', err);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 