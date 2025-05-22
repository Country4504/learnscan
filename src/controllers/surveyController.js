const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');
const Report = require('../models/Report');
const { calculateLearningStyle } = require('../utils/styleCalculator');

// 检查用户是否登录的中间件
const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/user/login?error=请先登录');
  }
  next();
};

// 开始问卷页面
router.get('/start', isAuthenticated, (req, res) => {
  res.render('survey-intro', {
    title: '学习风格测评问卷',
    user: req.session.user
  });
});

// 问卷页面
router.get('/questions', isAuthenticated, (req, res) => {
  res.render('survey-questions', {
    title: '学习风格测评问卷',
    user: req.session.user
  });
});

// 提交问卷
router.post('/submit', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { answers, ageGroup, challenges, expectations, otherInfo } = req.body;
    
    // 创建新的问卷记录
    const newSurvey = new Survey({
      user: userId,
      answers,
      ageGroup,
      challenges: challenges || [],
      expectations: expectations || [],
      otherInfo: otherInfo || ''
    });
    
    await newSurvey.save();
    
    // 计算学习风格
    const styleResults = calculateLearningStyle(answers);
    
    // 生成报告
    const newReport = new Report({
      survey: newSurvey._id,
      user: userId,
      scores: {
        perception: {
          visual: styleResults.perception.visual,
          auditory: styleResults.perception.auditory,
          kinesthetic: styleResults.perception.kinesthetic
        },
        processing: {
          systematic: styleResults.processing.systematic,
          global: styleResults.processing.global
        },
        environment: {
          structured: styleResults.environment.structured,
          flexible: styleResults.environment.flexible
        },
        thinking: {
          analytical: styleResults.thinking.analytical,
          creative: styleResults.thinking.creative
        },
        timeManagement: {
          planned: styleResults.timeManagement.planned,
          adaptive: styleResults.timeManagement.adaptive
        }
      },
      dominantType: {
        perceptionType: styleResults.dominantType.perceptionType,
        processingType: styleResults.dominantType.processingType,
        environmentType: styleResults.dominantType.environmentType,
        thinkingType: styleResults.dominantType.thinkingType,
        timeManagementType: styleResults.dominantType.timeManagementType
      },
      learningTypeCode: styleResults.learningTypeCode,
      learningTypeDescription: styleResults.learningTypeDescription,
      isMixedType: styleResults.isMixedType,
      strengths: styleResults.strengths,
      challenges: styleResults.challenges,
      strategies: styleResults.strategies,
      subjectStrategies: styleResults.subjectStrategies
    });
    
    await newReport.save();
    
    res.redirect(`/report/view/${newReport._id}`);
  } catch (error) {
    console.error('提交问卷错误:', error);
    res.status(500).render('error', {
      title: '提交失败',
      message: '处理问卷提交时出错',
      error: error
    });
  }
});

// 查看用户的所有问卷
router.get('/history', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const surveys = await Survey.find({ user: userId }).sort({ completedAt: -1 });
    
    res.render('survey-history', {
      title: '我的测评历史',
      user: req.session.user,
      surveys: surveys
    });
  } catch (error) {
    console.error('获取问卷历史错误:', error);
    res.status(500).render('error', {
      title: '获取失败',
      message: '获取测评历史时出错',
      error: error
    });
  }
});

module.exports = router; 