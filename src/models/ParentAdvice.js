const mongoose = require('mongoose');

const parentAdviceSchema = new mongoose.Schema({
  report: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true,
    unique: true
  },
  advice: {
    '感知偏好': {
      '培养建议': String,
      '学习建议': String,
      '家庭活动建议': String,
      '家庭关系建议': String,
      '沟通建议': String
    },
    '信息处理方式': {
      '培养建议': String,
      '学习建议': String,
      '家庭活动建议': String,
      '家庭关系建议': String,
      '沟通建议': String
    },
    '学习环境偏好': {
      '培养建议': String,
      '学习建议': String,
      '家庭活动建议': String,
      '家庭关系建议': String,
      '沟通建议': String
    },
    '思维模式': {
      '培养建议': String,
      '学习建议': String,
      '家庭活动建议': String,
      '家庭关系建议': String,
      '沟通建议': String
    },
    '时间管理倾向': {
      '培养建议': String,
      '学习建议': String,
      '家庭活动建议': String,
      '家庭关系建议': String,
      '沟通建议': String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ParentAdvice = mongoose.model('ParentAdvice', parentAdviceSchema);

module.exports = ParentAdvice; 