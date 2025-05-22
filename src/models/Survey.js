const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: {
    type: [String],
    required: true,
    validate: {
      validator: function(array) {
        return array.length === 40;
      },
      message: '问卷必须完成所有40个问题'
    }
  },
  ageGroup: {
    type: String,
    enum: ['10-12', '13-16'],
    required: true
  },
  challenges: {
    type: [String],
    default: []
  },
  expectations: {
    type: [String],
    default: []
  },
  otherInfo: {
    type: String,
    default: ''
  },
  completedAt: {
    type: Date,
    default: Date.now,
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: '完成时间不能是未来的日期'
    }
  },
  createdBy: {
    type: String,
    required: true,
    default: 'USER'
  }
});

// 添加保存前的验证钩子
surveySchema.pre('save', function(next) {
  if (this.completedAt > new Date()) {
    next(new Error('完成时间不能是未来的日期'));
  }
  next();
});

const Survey = mongoose.model('Survey', surveySchema);

module.exports = Survey; 