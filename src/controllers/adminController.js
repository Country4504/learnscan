const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const User = require('../models/User');

// 检查管理员是否登录的中间件
const isAdminAuthenticated = (req, res, next) => {
  if (!req.session.admin) {
    return res.redirect('/admin/login?error=请先登录');
  }
  next();
};

// 检查是否为超级管理员的中间件
const isSuperAdmin = (req, res, next) => {
  if (!req.session.admin || req.session.admin.role !== 'super_admin') {
    return res.status(403).render('admin/error', {
      title: '权限不足',
      message: '只有超级管理员才能访问此功能',
      admin: req.session.admin,
      layout: false
    });
  }
  next();
};

// 管理员登录页面
router.get('/login', (req, res) => {
  if (req.session.admin) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', {
    title: '管理员登录',
    error: req.query.error || null,
    layout: false  // 禁用默认布局
  });
});

// 管理员登录处理
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.redirect('/admin/login?error=用户名或密码错误');
    }
    
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.redirect('/admin/login?error=用户名或密码错误');
    }
    
    req.session.admin = {
      id: admin._id.toString(),
      username: admin.username,
      name: admin.name,
      role: admin.role
    };
    
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('管理员登录错误:', error);
    res.redirect('/admin/login?error=登录过程中发生错误');
  }
});

// 管理员仪表板
router.get('/dashboard', isAdminAuthenticated, async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' }).sort({ createdAt: -1 });
    const recentUsers = await User.find({ status: { $in: ['approved', 'rejected'] } })
      .sort({ reviewedAt: -1 })
      .limit(10);
    
    res.render('admin/dashboard', {
      title: '管理员仪表板',
      admin: req.session.admin,
      pendingUsers,
      recentUsers,
      layout: false  // 禁用默认布局
    });
  } catch (error) {
    console.error('获取仪表板数据错误:', error);
    res.status(500).send('服务器错误');
  }
});

// 用户审核列表
router.get('/users/pending', isAdminAuthenticated, async (req, res) => {
  try {
    const users = await User.find({ status: 'pending' })
      .sort({ createdAt: -1 });
    
    res.render('admin/pending-users', {
      title: '待审核用户',
      admin: req.session.admin,
      users,
      layout: false  // 禁用默认布局
    });
  } catch (error) {
    console.error('获取待审核用户列表错误:', error);
    res.status(500).send('服务器错误');
  }
});

// 审核用户
router.post('/users/:userId/review', isAdminAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, comment } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: '无效的审核状态' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      {
        status,
        reviewComment: comment || '',
        reviewedBy: req.session.admin.id,
        reviewedAt: new Date()
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json({ message: '审核完成', user });
  } catch (error) {
    console.error('审核用户错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 管理员列表 (仅超级管理员)
router.get('/admins', isAdminAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const admins = await Admin.find({}, 'username name role createdAt').sort({ createdAt: -1 });
    
    res.render('admin/admin-list', {
      title: '管理员管理',
      admin: req.session.admin,
      admins,
      layout: false
    });
  } catch (error) {
    console.error('获取管理员列表错误:', error);
    res.status(500).send('服务器错误');
  }
});

// 添加管理员页面 (仅超级管理员)
router.get('/admins/create', isAdminAuthenticated, isSuperAdmin, (req, res) => {
  res.render('admin/create-admin', {
    title: '添加管理员',
    admin: req.session.admin,
    error: req.query.error || null,
    layout: false
  });
});

// 创建管理员 (仅超级管理员)
router.post('/admins/create', isAdminAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const { username, password, confirmPassword, name, role } = req.body;
    
    // 验证密码一致性
    if (password !== confirmPassword) {
      return res.redirect('/admin/admins/create?error=两次输入的密码不一致');
    }
    
    // 检查用户名是否已存在
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.redirect('/admin/admins/create?error=管理员用户名已存在');
    }
    
    // 验证角色
    if (!['admin', 'super_admin'].includes(role)) {
      return res.redirect('/admin/admins/create?error=无效的角色');
    }
    
    // 创建新管理员
    const newAdmin = new Admin({
      username,
      password,
      name,
      role
    });
    
    await newAdmin.save();
    
    res.redirect('/admin/admins?success=管理员创建成功');
  } catch (error) {
    console.error('创建管理员错误:', error);
    res.redirect('/admin/admins/create?error=创建管理员过程中发生错误');
  }
});

// 删除管理员 (仅超级管理员)
router.delete('/admins/:adminId', isAdminAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const { adminId } = req.params;
    
    // 不能删除自己
    if (adminId === req.session.admin.id) {
      return res.status(400).json({ error: '不能删除自己的账户' });
    }
    
    const admin = await Admin.findByIdAndDelete(adminId);
    if (!admin) {
      return res.status(404).json({ error: '管理员不存在' });
    }
    
    res.json({ message: '管理员删除成功' });
  } catch (error) {
    console.error('删除管理员错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 管理员登出
router.get('/logout', (req, res) => {
  req.session.admin = null;
  res.redirect('/admin/login');
});

// 用户管理页面
router.get('/users/manage', isAdminAuthenticated, async (req, res) => {
  try {
    const status = req.query.status || 'all';
    let query = {};
    
    if (status !== 'all') {
      query.status = status;
    }
    
    const users = await User.find(query).sort({ createdAt: -1 });
    
    res.render('admin/user-manage', {
      title: '用户管理',
      users,
      currentStatus: status,
      admin: req.session.admin,
      layout: false
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// 设置用户测评次数
router.post('/users/:id/set-test-count', isAdminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { count } = req.body;
    
    if (count < 0) {
      return res.status(400).json({ error: '测评次数不能为负数' });
    }
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    user.testCount = parseInt(count);
    await user.save();
    
    res.json({ 
      success: true, 
      message: `成功将用户 ${user.name} 的测评次数设置为 ${count}`,
      newCount: user.testCount
    });
  } catch (error) {
    console.error('设置测评次数错误:', error);
    res.status(500).json({ error: '设置测评次数失败' });
  }
});

module.exports = router; 