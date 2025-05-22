const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Survey = require('../models/Survey');
const Report = require('../models/Report');

// 用户登录页面
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/user/dashboard');
  }
  res.render('login', {
    title: '用户登录',
    error: req.query.error || null,
    user: null
  });
});

// 用户登录处理
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.redirect('/user/login?error=用户名或密码错误');
    }
    
    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.redirect('/user/login?error=用户名或密码错误');
    }
    
    // 创建会话
    req.session.user = {
      id: user._id.toString(),
      username: user.username,
      name: user.name,
      age: user.age,
      grade: user.grade
    };
    
    res.redirect('/user/dashboard');
  } catch (error) {
    console.error('登录错误:', error);
    res.redirect('/user/login?error=登录过程中发生错误');
  }
});

// 用户注册页面
router.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/user/dashboard');
  }
  res.render('register', {
    title: '用户注册',
    error: req.query.error || null,
    user: null
  });
});

// 用户注册处理
router.post('/register', async (req, res) => {
  try {
    const { username, password, confirmPassword, name, age, grade } = req.body;
    
    // 验证密码一致性
    if (password !== confirmPassword) {
      return res.redirect('/user/register?error=两次输入的密码不一致');
    }
    
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.redirect('/user/register?error=用户名已存在');
    }
    
    // 创建新用户
    const newUser = new User({
      username,
      password,
      name,
      age: parseInt(age),
      grade
    });
    
    await newUser.save();
    
    // 检查并删除任何可能存在的测评记录
    const existingSurveys = await Survey.find({ user: newUser._id });
    if (existingSurveys.length > 0) {
      console.error(`检测到新用户 ${newUser._id} 存在自动生成的测评记录，正在清理...`);
      await Survey.deleteMany({ user: newUser._id });
      await Report.deleteMany({ user: newUser._id });
    }
    
    // 自动登录
    req.session.user = {
      id: newUser._id.toString(),
      username: newUser.username,
      name: newUser.name,
      age: newUser.age,
      grade: newUser.grade
    };
    
    res.redirect('/user/dashboard');
  } catch (error) {
    console.error('注册错误:', error);
    res.redirect('/user/register?error=注册过程中发生错误');
  }
});

// 用户仪表盘
router.get('/dashboard', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/user/login');
  }

  try {
    const userId = req.session.user.id;

    // 获取最近的测评报告
    const recentReports = await Report.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('survey');

    // 获取最新的报告
    const latestReport = recentReports[0];

    // 获取用户统计信息
    const userStats = {
      completedSurveys: await Report.countDocuments({ user: userId }),
      totalStrategies: latestReport ? (latestReport.strategies ? latestReport.strategies.length : 0) : 0,
      latestStyle: latestReport ? latestReport.learningTypeCode : null
    };

    // 学习风格描述
    const styleDescriptions = {
      '视觉型': '您通过看到的信息学习效果最佳，偏好图表、图像、文字等视觉材料。',
      '听觉型': '您通过听到的信息学习效果最佳，偏好口头讲解、讨论等听觉材料。',
      '动觉型': '您通过动手实践学习效果最佳，偏好实验、操作等实践活动。',
      '系统型': '您喜欢按照逻辑顺序处理信息，注重细节和从基础到高级的学习路径。',
      '整体型': '您喜欢先了解整体框架，再关注细节，善于把握知识间的联系。',
      '结构化': '您在安静、有序的学习环境中表现最佳，需要明确的规则和期望。',
      '灵活型': '您适应性强，能在不同环境中学习，喜欢自由和变化。',
      '计划型': '您喜欢制定详细计划并按计划执行，有条理且善于管理截止日期。',
      '适应型': '您灵活应对变化，能根据实际情况调整学习计划和方法。'
    };

    res.render('dashboard', {
      title: '个人中心',
      user: req.session.user,
      recentReports,
      latestReport,
      userStats,
      styleDescriptions
    });
  } catch (error) {
    console.error('获取仪表盘数据错误:', error);
    res.status(500).render('error', {
      title: '获取失败',
      message: '获取个人中心数据时出错',
      error: error,
      user: req.session.user
    });
  }
});

// 用户退出
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router; 