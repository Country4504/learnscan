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
      '核心特征分析': String,
      '学习方法指导': String,
      '家长支持策略': String,
      '环境创设建议': String,
      '能力发展规划': String,
      '沟通技巧指导': String,
      '常见问题应对': String,
      '长期发展建议': String
    },
    '信息处理方式': {
      '核心特征分析': String,
      '学习方法指导': String,
      '家长支持策略': String,
      '环境创设建议': String,
      '能力发展规划': String,
      '沟通技巧指导': String,
      '常见问题应对': String,
      '长期发展建议': String
    },
    '学习环境偏好': {
      '核心特征分析': String,
      '学习方法指导': String,
      '家长支持策略': String,
      '环境创设建议': String,
      '能力发展规划': String,
      '沟通技巧指导': String,
      '常见问题应对': String,
      '长期发展建议': String
    },
    '思维模式': {
      '核心特征分析': String,
      '学习方法指导': String,
      '家长支持策略': String,
      '环境创设建议': String,
      '能力发展规划': String,
      '沟通技巧指导': String,
      '常见问题应对': String,
      '长期发展建议': String
    },
    '时间管理倾向': {
      '核心特征分析': String,
      '学习方法指导': String,
      '家长支持策略': String,
      '环境创设建议': String,
      '能力发展规划': String,
      '沟通技巧指导': String,
      '常见问题应对': String,
      '长期发展建议': String
    },
    '综合发展建议': {
      '整体学习规划': String,
      '家庭教育策略': String,
      '能力培养重点': String,
      '潜能开发方向': String,
      '协调发展指导': String,
      '阶段性目标设定': String,
      '家校协作建议': String,
      '持续监测评估': String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 添加静态方法来清理和验证建议数据
parentAdviceSchema.statics.cleanAdviceData = function(adviceData) {
  const cleanString = (str) => {
    if (typeof str !== 'string') return str;
    // 替换不规范的转义字符
    return str
      .replace(/\\'/g, "'")  // 替换转义的单引号
      .replace(/\\"/g, '"')  // 替换转义的双引号
      .replace(/\\n/g, '\n') // 替换转义的换行符
      .replace(/\\t/g, '\t') // 替换转义的制表符
      .replace(/\\\\/g, '\\'); // 替换双反斜杠
  };

  const cleanObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        cleaned[key] = cleanObject(value);
      } else {
        cleaned[key] = cleanString(value);
      }
    }
    return cleaned;
  };

  return cleanObject(adviceData);
};

// 添加中间件在保存前清理数据
parentAdviceSchema.pre('save', function(next) {
  if (this.advice) {
    this.advice = this.constructor.cleanAdviceData(this.advice);
  }
  next();
});

const ParentAdvice = mongoose.model('ParentAdvice', parentAdviceSchema);

module.exports = ParentAdvice; 