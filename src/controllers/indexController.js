const express = require('express');
const router = express.Router();

// 首页路由
router.get('/', (req, res) => {
  res.render('index', {
    title: 'LearnScan - 发现你的学习超能力',
    user: req.session.user || null
  });
});

// 关于页面路由
router.get('/about', (req, res) => {
  res.render('about', {
    title: '关于LearnScan',
    user: req.session.user || null
  });
});

// 帮助页面路由
router.get('/help', (req, res) => {
  res.render('help', {
    title: '使用帮助',
    user: req.session.user || null
  });
});

module.exports = router; 