const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 10,
    max: 16
  },
  grade: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewComment: {
    type: String,
    default: ''
  },
  testCount: {
    type: Number,
    default: 2,
    min: 0
  },
  testHistory: [{
    testDate: {
      type: Date,
      default: Date.now
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 使用测评次数
userSchema.methods.useTestCount = async function(reportId) {
  if (this.testCount > 0) {
    this.testCount -= 1;
    this.testHistory.push({
      testDate: new Date(),
      reportId: reportId
    });
    await this.save();
    return true;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 