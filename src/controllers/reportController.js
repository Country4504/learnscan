const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const OpenAIService = require('../services/openai-service');

// 检查用户是否登录的中间件
const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/user/login?error=请先登录');
  }
  next();
};

// 验证ObjectId的中间件
const validateObjectId = (req, res, next) => {
  const id = req.params.reportId || req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).render('error', {
      title: '无效的报告ID',
      message: '请求的报告ID格式不正确',
      error: new Error('无效的ObjectId格式'),
      user: req.session.user
    });
  }
  next();
};

// 查看特定报告
router.get('/view/:reportId', isAuthenticated, validateObjectId, async (req, res) => {
  try {
    const reportId = req.params.reportId;
    const userId = req.session.user.id;
    
    // 查找报告并验证权限
    const report = await Report.findById(reportId)
      .populate('survey')
      .populate('user', 'name age grade');
    
    if (!report) {
      return res.status(404).render('error', {
        title: '报告未找到',
        message: '无法找到请求的报告',
        user: req.session.user
      });
    }
    
    // 确保只有报告所有者可以查看
    if (report.user._id.toString() !== userId) {
      return res.status(403).render('error', {
        title: '访问被拒绝',
        message: '您没有权限查看此报告',
        user: req.session.user
      });
    }
    
    res.render('report-view', {
      title: '学习风格诊断报告',
      user: req.session.user,
      report: report
    });
  } catch (error) {
    console.error('查看报告错误:', error);
    res.status(500).render('error', {
      title: '获取失败',
      message: '获取报告数据时出错',
      error: error,
      user: req.session.user
    });
  }
});

// 查看用户的所有报告
router.get('/history', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // 确保userId是有效的ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('无效的用户ID');
    }
    
    const reports = await Report.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('survey', 'completedAt');
    
    res.render('report-history', {
      title: '我的报告历史',
      user: req.session.user,
      reports: reports || [] // 确保reports始终是数组
    });
  } catch (error) {
    console.error('获取报告历史错误:', error);
    res.status(500).render('error', {
      title: '获取失败',
      message: '获取报告历史时出错',
      error: error,
      user: req.session.user
    });
  }
});

// 获取AI家长建议
router.get('/view/:id/parent-advice', isAuthenticated, validateObjectId, async (req, res) => {
  try {
    const reportId = req.params.id;
    
    // 查找报告
    const report = await Report.findById(reportId)
      .populate('survey')
      .populate('user', 'name age grade');
    
    if (!report) {
      return res.status(404).json({ 
        success: false, 
        message: '报告未找到' 
      });
    }
    
    // 确保只有报告所有者可以查看
    if (report.user._id.toString() !== req.session.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: '您没有权限查看此报告' 
      });
    }
    
    // 生成AI建议 - 直接使用导入的服务，不进行new实例化
    const parentAdvice = await OpenAIService.generateParentAdvice(report);
    
    return res.json({
      success: true,
      data: parentAdvice
    });
  } catch (error) {
    console.error('获取AI家长建议错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取AI家长建议时出错',
      error: error.message
    });
  }
});

module.exports = router; 