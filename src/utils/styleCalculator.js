/**
 * 学习风格计算工具
 * 基于用户问卷答案计算学习风格特征
 */

/**
 * 计算学习风格分数
 * @param {Array} answers - 用户问卷答案数组，长度为40
 * @returns {Object} 学习风格分析结果
 */
function calculateLearningStyle(answers) {
  // 初始化各维度得分
  const scores = {
    visual: 0,
    auditory: 0,
    kinesthetic: 0,
    systematic: 0,
    global: 0,
    structured: 0,
    flexible: 0,
    analytical: 0,
    creative: 0,
    planned: 0,
    adaptive: 0
  };

  // 处理感知偏好(问题1-8)
  for (let i = 0; i < 8; i++) {
    const answer = answers[i];
    if (answer === 'A') {
      scores.visual += 1;
    } else if (answer === 'B') {
      scores.auditory += 1;
    } else if (answer === 'C') {
      scores.kinesthetic += 1;
    } else if (answer === 'D') {
      scores.visual += 0.33;
      scores.auditory += 0.33;
      scores.kinesthetic += 0.33;
    }
  }

  // 处理信息处理方式(问题9-16)
  for (let i = 8; i < 16; i++) {
    const answer = answers[i];
    if (answer === 'A') {
      scores.systematic += 3;
    } else if (answer === 'B') {
      scores.systematic += 2;
      scores.global += 1;
    } else if (answer === 'C') {
      scores.systematic += 1;
      scores.global += 2;
    } else if (answer === 'D') {
      scores.systematic += 1.5;
      scores.global += 1.5;
    }
  }

  // 处理学习环境偏好(问题17-24)
  for (let i = 16; i < 24; i++) {
    const answer = answers[i];
    if (answer === 'A') {
      scores.structured += 3;
    } else if (answer === 'B') {
      scores.structured += 2;
      scores.flexible += 1;
    } else if (answer === 'C') {
      scores.structured += 1;
      scores.flexible += 2;
    } else if (answer === 'D') {
      scores.structured += 1.5;
      scores.flexible += 1.5;
    }
  }

  // 处理思维模式(问题25-32)
  for (let i = 24; i < 32; i++) {
    const answer = answers[i];
    if (answer === 'A') {
      scores.analytical += 3;
    } else if (answer === 'B') {
      scores.analytical += 1;
      scores.creative += 2;
    } else if (answer === 'C') {
      scores.analytical += 2;
      scores.creative += 1;
    } else if (answer === 'D') {
      scores.analytical += 1.5;
      scores.creative += 1.5;
    }
  }

  // 处理时间管理倾向(问题33-40)
  for (let i = 32; i < 40; i++) {
    const answer = answers[i];
    if (answer === 'A') {
      scores.planned += 3;
    } else if (answer === 'B') {
      scores.planned += 2;
      scores.adaptive += 1;
    } else if (answer === 'C') {
      scores.planned += 1;
      scores.adaptive += 2;
    } else if (answer === 'D') {
      scores.planned += 1.5;
      scores.adaptive += 1.5;
    }
  }

  // 计算各维度的百分比
  const perceptionTotal = scores.visual + scores.auditory + scores.kinesthetic;
  const processingTotal = scores.systematic + scores.global;
  const environmentTotal = scores.structured + scores.flexible;
  const thinkingTotal = scores.analytical + scores.creative;
  const timeManagementTotal = scores.planned + scores.adaptive;

  const percentages = {
    perception: {
      visual: Math.round((scores.visual / perceptionTotal) * 100),
      auditory: Math.round((scores.auditory / perceptionTotal) * 100),
      kinesthetic: Math.round((scores.kinesthetic / perceptionTotal) * 100)
    },
    processing: {
      systematic: Math.round((scores.systematic / processingTotal) * 100),
      global: Math.round((scores.global / processingTotal) * 100)
    },
    environment: {
      structured: Math.round((scores.structured / environmentTotal) * 100),
      flexible: Math.round((scores.flexible / environmentTotal) * 100)
    },
    thinking: {
      analytical: Math.round((scores.analytical / thinkingTotal) * 100),
      creative: Math.round((scores.creative / thinkingTotal) * 100)
    },
    timeManagement: {
      planned: Math.round((scores.planned / timeManagementTotal) * 100),
      adaptive: Math.round((scores.adaptive / timeManagementTotal) * 100)
    }
  };

  // 确定每个维度的主导类型
  const dominantType = {
    perceptionType: getDominantPerceptionType(percentages.perception),
    processingType: percentages.processing.systematic > percentages.processing.global ? '系统性' : '跳跃性',
    environmentType: percentages.environment.structured > percentages.environment.flexible ? '结构化' : '灵活型',
    thinkingType: percentages.thinking.analytical > percentages.thinking.creative ? '分析型' : '创造型',
    timeManagementType: percentages.timeManagement.planned > percentages.timeManagement.adaptive ? '计划型' : '适应型'
  };

  // 判断是否为混合类型
  const isMixedType = isLearningStyleMixed(percentages);

  // 生成类型代码
  const learningTypeCode = generateLearningTypeCode(dominantType);

  // 生成描述和策略
  const learningTypeDescription = generateTypeDescription(dominantType, isMixedType);
  const strengths = generateStrengths(dominantType);
  const challenges = generateChallenges(dominantType);
  const strategies = generateStrategies(dominantType);
  const subjectStrategies = generateSubjectStrategies(dominantType);

  return {
    perception: percentages.perception,
    processing: percentages.processing,
    environment: percentages.environment,
    thinking: percentages.thinking,
    timeManagement: percentages.timeManagement,
    dominantType,
    learningTypeCode,
    learningTypeDescription,
    isMixedType,
    strengths,
    challenges,
    strategies,
    subjectStrategies
  };
}

/**
 * 获取主导感知类型
 * @param {Object} perception 感知维度百分比
 * @returns {String} 主导感知类型
 */
function getDominantPerceptionType(perception) {
  const { visual, auditory, kinesthetic } = perception;
  
  if (visual > auditory && visual > kinesthetic) {
    return '视觉型';
  } else if (auditory > visual && auditory > kinesthetic) {
    return '听觉型';
  } else if (kinesthetic > visual && kinesthetic > auditory) {
    return '动觉型';
  } else {
    // 处理平局情况
    if (visual === auditory && auditory === kinesthetic) {
      return '多感官型';
    } else if (visual === auditory) {
      return '视听型';
    } else if (visual === kinesthetic) {
      return '视动型';
    } else if (auditory === kinesthetic) {
      return '听动型';
    }
  }
  
  return '视觉型'; // 默认返回
}

/**
 * 判断学习风格是否为混合型
 * @param {Object} percentages 各维度百分比
 * @returns {Boolean} 是否为混合型
 */
function isLearningStyleMixed(percentages) {
  const { perception, processing, environment, thinking, timeManagement } = percentages;
  
  // 检查感知维度中任意两类型差异是否小于15%
  const perceptionMixed = (
    Math.abs(perception.visual - perception.auditory) < 15 ||
    Math.abs(perception.visual - perception.kinesthetic) < 15 ||
    Math.abs(perception.auditory - perception.kinesthetic) < 15
  );
  
  // 检查其他四个维度的差异是否小于15%
  const processingMixed = Math.abs(processing.systematic - processing.global) < 15;
  const environmentMixed = Math.abs(environment.structured - environment.flexible) < 15;
  const thinkingMixed = Math.abs(thinking.analytical - thinking.creative) < 15;
  const timeManagementMixed = Math.abs(timeManagement.planned - timeManagement.adaptive) < 15;
  
  // 如果任一维度为混合型，则整体学习风格为混合型
  return perceptionMixed || processingMixed || environmentMixed || thinkingMixed || timeManagementMixed;
}

/**
 * 生成学习风格类型代码
 * @param {Object} dominantType 主导类型对象
 * @returns {String} 学习风格类型代码
 */
function generateLearningTypeCode(dominantType) {
  const { perceptionType, processingType, environmentType, thinkingType, timeManagementType } = dominantType;
  
  let code = '';
  
  // 添加感知偏好代码
  if (perceptionType === '视觉型' || perceptionType === '视听型' || perceptionType === '视动型') {
    code += 'V';
  } else if (perceptionType === '听觉型' || perceptionType === '听动型') {
    code += 'A';
  } else if (perceptionType === '动觉型') {
    code += 'K';
  } else {
    code += 'M'; // 多感官型
  }
  
  // 添加信息处理方式代码
  code += processingType === '系统性' ? 'S' : 'H';
  
  // 添加学习环境偏好代码
  code += environmentType === '结构化' ? 'S' : 'F';
  
  // 添加思维模式代码
  code += thinkingType === '分析型' ? 'A' : 'C';
  
  // 添加时间管理倾向代码
  code += timeManagementType === '计划型' ? 'P' : 'A';
  
  return code;
}

/**
 * 生成学习类型描述
 * @param {Object} dominantType 主导类型对象
 * @param {Boolean} isMixedType 是否为混合型
 * @returns {String} 类型描述
 */
function generateTypeDescription(dominantType, isMixedType) {
  const { perceptionType, processingType, environmentType, thinkingType, timeManagementType } = dominantType;
  
  if (isMixedType) {
    return `灵活学习者 - 您在多个学习维度上展现出平衡的特性，能够根据不同情境灵活调整学习方式。主要偏好为${perceptionType}感知、${processingType}信息处理、${environmentType}环境、${thinkingType}思维和${timeManagementType}时间管理。这种多样化的学习风格使您能够适应各种学习环境和任务。`;
  }
  
  // 视觉型+系统性+结构化+分析型+计划型
  if (perceptionType === '视觉型' && processingType === '系统性' && environmentType === '结构化' && 
      thinkingType === '分析型' && timeManagementType === '计划型') {
    return '系统视觉学习者 - 您通过视觉材料学习效果最佳，喜欢有序的信息和环境，擅长逻辑分析，并偏好按计划行事。这种组合使您在需要精确和系统化的学习任务中表现出色。';
  }
  
  // 听觉型+系统性+结构化+分析型+计划型
  if (perceptionType === '听觉型' && processingType === '系统性' && environmentType === '结构化' && 
      thinkingType === '分析型' && timeManagementType === '计划型') {
    return '听觉逻辑学习者 - 您通过听到的信息学习效果最佳，善于系统处理信息，喜欢有序环境，擅长分析思考，并按计划行事。您可能在需要口头讲解和讨论的结构化学习环境中表现最佳。';
  }
  
  // 动觉型+跳跃性+灵活型+创造型+适应型
  if (perceptionType === '动觉型' && processingType === '跳跃性' && environmentType === '灵活型' && 
      thinkingType === '创造型' && timeManagementType === '适应型') {
    return '创意实践学习者 - 您通过实践和体验学习效果最佳，思维灵活且创造性强，适应多变环境，能根据情况调整计划。这种组合使您在需要动手实践和创意解决方案的学习任务中表现出色。';
  }
  
  // 其他组合的通用描述
  return `${perceptionType}${processingType}${thinkingType}学习者 - 您主要通过${perceptionType === '视觉型' ? '视觉材料' : perceptionType === '听觉型' ? '听觉信息' : '动手实践'}学习效果最佳，采用${processingType}的方式处理信息，偏好${environmentType}的学习环境，思维方式偏向${thinkingType}，时间管理风格为${timeManagementType}。`;
}

/**
 * 生成学习优势
 * @param {Object} dominantType 主导类型对象
 * @returns {Array} 优势列表
 */
function generateStrengths(dominantType) {
  const strengths = [];
  const { perceptionType, processingType, environmentType, thinkingType, timeManagementType } = dominantType;
  
  // 感知偏好优势
  if (perceptionType === '视觉型') {
    strengths.push('善于从图表、图像和书面材料中学习');
    strengths.push('记忆视觉信息的能力强');
    strengths.push('擅长整理和组织笔记');
  } else if (perceptionType === '听觉型') {
    strengths.push('善于从讲解、讨论和口头指导中学习');
    strengths.push('语言学习和听力理解能力强');
    strengths.push('通过复述和讨论加深理解');
  } else if (perceptionType === '动觉型') {
    strengths.push('通过实践和亲身体验学习效果最佳');
    strengths.push('动手能力和实际操作技能出色');
    strengths.push('在实验和项目中表现活跃');
  }
  
  // 信息处理优势
  if (processingType === '系统性') {
    strengths.push('擅长按照逻辑顺序处理信息');
    strengths.push('注重细节和准确性');
    strengths.push('能够遵循明确的学习步骤');
  } else {
    strengths.push('善于把握整体概念和关联');
    strengths.push('思维灵活，能从多角度理解问题');
    strengths.push('在开放性问题中有创见');
  }
  
  // 环境偏好优势
  if (environmentType === '结构化') {
    strengths.push('在有序和安静的环境中专注力强');
    strengths.push('遵循规则和常规的能力好');
  } else {
    strengths.push('适应不同学习环境的能力强');
    strengths.push('在动态和互动环境中学习活跃');
  }
  
  // 思维模式优势
  if (thinkingType === '分析型') {
    strengths.push('逻辑推理和问题分析能力强');
    strengths.push('决策基于事实和证据');
  } else {
    strengths.push('创造性思维和想象力丰富');
    strengths.push('在需要创新的任务中表现出色');
  }
  
  // 时间管理优势
  if (timeManagementType === '计划型') {
    strengths.push('时间管理和任务组织能力强');
    strengths.push('按时完成任务的可靠性高');
  } else {
    strengths.push('灵活应对变化和压力的能力强');
    strengths.push('在紧急情况下能高效工作');
  }
  
  return strengths;
}

/**
 * 生成学习挑战
 * @param {Object} dominantType 主导类型对象
 * @returns {Array} 挑战列表
 */
function generateChallenges(dominantType) {
  const challenges = [];
  const { perceptionType, processingType, environmentType, thinkingType, timeManagementType } = dominantType;
  
  // 感知偏好挑战
  if (perceptionType === '视觉型') {
    challenges.push('纯讲解或口头指导的课堂可能感到困难');
    challenges.push('需要将听到的信息转化为视觉形式');
  } else if (perceptionType === '听觉型') {
    challenges.push('在嘈杂环境中可能难以集中注意力');
    challenges.push('长时间阅读可能感到疲劳');
  } else if (perceptionType === '动觉型') {
    challenges.push('传统讲授式课堂可能感到无聊');
    challenges.push('长时间静坐学习可能感到焦躁');
  }
  
  // 信息处理挑战
  if (processingType === '系统性') {
    challenges.push('可能在开放性任务中感到不适');
    challenges.push('对变化和调整可能适应较慢');
  } else {
    challenges.push('可能忽略重要细节');
    challenges.push('在需要精确步骤的任务中可能不够耐心');
  }
  
  // 环境偏好挑战
  if (environmentType === '结构化') {
    challenges.push('在混乱或嘈杂环境中难以集中注意力');
    challenges.push('对突发变化可能感到不适');
  } else {
    challenges.push('过度静默环境可能使其感到不适');
    challenges.push('可能在高度结构化的环境中感到受限');
  }
  
  // 思维模式挑战
  if (thinkingType === '分析型') {
    challenges.push('在需要创意和创新的任务中可能不够灵活');
    challenges.push('可能过度分析导致决策延迟');
  } else {
    challenges.push('在需要精确分析的任务中可能不够严谨');
    challenges.push('可能缺乏系统性和组织性');
  }
  
  // 时间管理挑战
  if (timeManagementType === '计划型') {
    challenges.push('计划变更可能导致挫折感');
    challenges.push('可能过度计划而缺乏灵活性');
  } else {
    challenges.push('可能拖延直到截止日期临近');
    challenges.push('时间估计可能不准确');
  }
  
  return challenges;
}

/**
 * 生成学习策略
 * @param {Object} dominantType 主导类型对象
 * @returns {Array} 策略列表
 */
function generateStrategies(dominantType) {
  const strategies = [];
  const { perceptionType, processingType, environmentType, thinkingType, timeManagementType } = dominantType;
  
  // 感知偏好策略
  if (perceptionType === '视觉型') {
    strategies.push('使用思维导图和图表整理学习内容');
    strategies.push('为重点内容创建视觉标记和颜色编码');
    strategies.push('将听到的信息转换为图像或图表');
    strategies.push('使用图像联想加强记忆');
  } else if (perceptionType === '听觉型') {
    strategies.push('大声朗读或录音学习材料');
    strategies.push('参与讨论组和口头解释');
    strategies.push('使用韵律和节奏辅助记忆');
    strategies.push('寻找安静的学习环境');
  } else if (perceptionType === '动觉型') {
    strategies.push('在学习时适当走动或活动');
    strategies.push('使用实物模型和操作工具');
    strategies.push('通过角色扮演和模拟活动学习');
    strategies.push('创建与概念相关的肢体动作');
  }
  
  // 信息处理策略
  if (processingType === '系统性') {
    strategies.push('创建详细的学习大纲和步骤');
    strategies.push('按顺序分解复杂任务');
    strategies.push('使用检查表跟踪进度');
  } else {
    strategies.push('先了解整体框架再填补细节');
    strategies.push('使用概念图连接不同知识点');
    strategies.push('寻找跨学科和跨领域关联');
  }
  
  // 环境偏好策略
  if (environmentType === '结构化') {
    strategies.push('创建专用、整洁的学习空间');
    strategies.push('制定固定的学习时间表');
    strategies.push('使用降噪工具减少干扰');
  } else {
    strategies.push('尝试不同的学习场所');
    strategies.push('在学习中加入适度的背景刺激');
    strategies.push('结合轻度活动和学习');
  }
  
  // 思维模式策略
  if (thinkingType === '分析型') {
    strategies.push('使用逻辑框架分析问题');
    strategies.push('应用批判性思维评估信息');
    strategies.push('创建对比表格分析不同概念');
  } else {
    strategies.push('练习头脑风暴和自由联想');
    strategies.push('通过艺术形式表达学习内容');
    strategies.push('在不相关领域间寻找联系');
  }
  
  // 时间管理策略
  if (timeManagementType === '计划型') {
    strategies.push('创建详细的学习计划表');
    strategies.push('使用时间块分配法安排任务');
    strategies.push('设定明确的学习目标和里程碑');
  } else {
    strategies.push('使用灵活优先级系统而非固定计划');
    strategies.push('应用时间盒技术保持专注');
    strategies.push('根据能量水平安排不同类型任务');
  }
  
  return strategies;
}

/**
 * 生成学科特定策略
 * @param {Object} dominantType 主导类型对象
 * @returns {Object} 学科策略对象
 */
function generateSubjectStrategies(dominantType) {
  const subjects = {
    math: [],
    language: [],
    english: [],
    science: []
  };
  
  const { perceptionType } = dominantType;
  
  // 数学学科策略
  if (perceptionType === '视觉型') {
    subjects.math.push('使用图表和图形理解数学概念');
    subjects.math.push('为公式和步骤创建视觉卡片');
    subjects.math.push('用颜色标记不同类型的问题和解题步骤');
  } else if (perceptionType === '听觉型') {
    subjects.math.push('大声读出数学问题和解题步骤');
    subjects.math.push('通过讨论加深对数学概念的理解');
    subjects.math.push('用口诀或节奏记忆公式');
  } else if (perceptionType === '动觉型') {
    subjects.math.push('使用实物模型和计数工具');
    subjects.math.push('通过实际测量和计算应用数学');
    subjects.math.push('创建数学概念的实物模型');
  }
  
  // 语文学科策略
  if (perceptionType === '视觉型') {
    subjects.language.push('绘制故事线图和角色关系图');
    subjects.language.push('用图表组织写作结构');
    subjects.language.push('为重要字词创建图像联想');
  } else if (perceptionType === '听觉型') {
    subjects.language.push('朗读文章和自己的写作');
    subjects.language.push('通过讨论深化对文学作品的理解');
    subjects.language.push('录音并听取自己的朗读');
  } else if (perceptionType === '动觉型') {
    subjects.language.push('表演文学作品中的场景');
    subjects.language.push('创作手工书或立体书');
    subjects.language.push('采用角色扮演理解文学人物');
  }
  
  // 英语学科策略
  if (perceptionType === '视觉型') {
    subjects.english.push('制作单词卡片搭配相关图片');
    subjects.english.push('用思维导图整理语法规则');
    subjects.english.push('标注文本中不同类型的语法结构');
  } else if (perceptionType === '听觉型') {
    subjects.english.push('听英语歌曲、广播和播客');
    subjects.english.push('参与英语角和口语小组');
    subjects.english.push('大声朗读英语文本');
  } else if (perceptionType === '动觉型') {
    subjects.english.push('配合手势和动作学习新单词');
    subjects.english.push('参与英语角色扮演和情景对话');
    subjects.english.push('通过写字和手工活动强化记忆');
  }
  
  // 科学学科策略
  if (perceptionType === '视觉型') {
    subjects.science.push('使用图表和模型理解科学概念');
    subjects.science.push('创建视觉笔记和流程图');
    subjects.science.push('观看科学实验和演示视频');
  } else if (perceptionType === '听觉型') {
    subjects.science.push('通过讨论小组深化科学理解');
    subjects.science.push('口头解释科学概念和过程');
    subjects.science.push('听科学讲座和播客');
  } else if (perceptionType === '动觉型') {
    subjects.science.push('进行实验和动手项目');
    subjects.science.push('创建模型和实物演示');
    subjects.science.push('参与实地考察和标本收集');
  }
  
  return subjects;
}

module.exports = {
  calculateLearningStyle
};