const express = require('express');
const router = express.Router();
const openai = require('../services/openai-service');

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

// 智能学习规划引擎页面路由
router.get('/plan', (req, res) => {
  res.render('plan/plan', {
    title: '智能学习规划引擎',
    user: req.session.user || null
  });
});

// 学习目标智能解析AI接口
router.post('/plan/goal-analysis', async (req, res) => {
  const { goalType, goalContent } = req.body;
  if (!goalType || !goalContent) {
    return res.status(400).json({ error: '缺少目标类型或内容' });
  }
  try {
    const aiResult = await openai.analyzeGoal({ goalType, goalContent, user: req.session.user });
    res.json(aiResult);
  } catch (err) {
    res.status(500).json({ error: 'AI解析失败', detail: err.message });
  }
});

// 智能作业辅导系统页面路由
router.get('/homework', (req, res) => {
  res.render('homework/homework', {
    title: '智能作业辅导系统',
    user: req.session.user || null
  });
});

// 语文学习助手页面路由
router.get('/chinese', (req, res) => {
  res.render('chinese/chinese', {
    title: '语文学习助手',
    user: req.session.user || null
  });
});

// 数学学习助手页面路由
router.get('/math', (req, res) => {
  res.render('math/math', {
    title: '数学学习助手',
    user: req.session.user || null
  });
});

// 个性化学习路径生成AI接口
router.post('/plan/path-analysis', async (req, res) => {
  const { styleType, levelMath, levelChinese, studyTime, studyPreference } = req.body;
  if (!styleType || !levelMath || !levelChinese || !studyTime) {
    return res.status(400).json({ error: '缺少必要的基础信息' });
  }
  try {
    const aiResult = await openai.analyzePath({ styleType, levelMath, levelChinese, studyTime, studyPreference, user: req.session.user });
    res.json(aiResult);
  } catch (err) {
    res.status(500).json({ error: 'AI路径生成失败', detail: err.message });
  }
});

// 智能作业辅导系统AI接口
router.post('/homework/analyze', async (req, res) => {
  const { questionText, subject, imageBase64 } = req.body;
  if (!questionText && !imageBase64) {
    return res.status(400).json({ error: '题目内容或图片不能为空' });
  }
  try {
    let aiResult;
    if (imageBase64) {
      aiResult = await openai.analyzeHomeworkWithImage({ imageBase64, questionText, subject, user: req.session.user });
    } else {
      aiResult = await openai.analyzeHomework({ questionText, subject, user: req.session.user });
    }
    res.json(aiResult);
  } catch (err) {
    res.status(500).json({ error: 'AI题目分析失败', detail: err.message });
  }
});

router.post('/homework/guidance', async (req, res) => {
  const { questionText, currentStep, imageBase64 } = req.body;
  if (!questionText && !imageBase64) {
    return res.status(400).json({ error: '题目内容或图片不能为空' });
  }
  try {
    const aiResult = await openai.progressiveGuidance({ 
      questionText, 
      currentStep, 
      imageBase64,
      user: req.session.user 
    });
    res.json(aiResult);
  } catch (err) {
    res.status(500).json({ error: 'AI思维引导失败', detail: err.message });
  }
});

router.post('/homework/parent-support', async (req, res) => {
  const { questionText, subject, imageBase64  } = req.body;
  
  if (!questionText  && !imageBase64) {
    return res.status(400).json({ error: '题目内容不能为空' });
  }
  try {
    const aiResult = await openai.parentSupport({ questionText, subject, imageBase64 });
    res.json(aiResult);
  } catch (err) {
    res.status(500).json({ error: 'AI家长支持失败', detail: err.message });
  }
});

// AI OCR图片识别接口
router.post('/homework/ai-ocr', async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: '缺少图片数据' });
  }
  try {
    // 调用AI OCR服务
    const aiResult = await openai.ocrImage({ imageBase64 });
    res.json({ text: aiResult.text || '' });
  } catch (err) {
    res.status(500).json({ error: 'AI图片识别失败', detail: err.message });
  }
});

module.exports = router; 