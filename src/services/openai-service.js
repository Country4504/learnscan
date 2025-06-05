/**
 * OpenAI/ChatGPT集成服务
 * 用于根据学习测评结果生成家长建议
 */
const axios = require('axios');

// 环境配置
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_ENDPOINT = process.env.OPENAI_API_ENDPOINT || 'https://api.openai.com/v1';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free';

// 调试输出
console.log('OpenAI配置信息:');
console.log('API密钥设置状态:', OPENAI_API_KEY ? '已设置' : '未设置');
console.log('API端点:', OPENAI_API_ENDPOINT);
console.log('使用模型:', OPENAI_MODEL);
console.log('测试axios是否加载成功:', axios ? '成功' : '失败');

// 检查API密钥是否配置
if (!OPENAI_API_KEY) {
  console.warn('警告: OpenAI API密钥未配置，AI建议功能将不可用');
}

/**
 * 生成家长建议
 * @param {Object} report - 学习报告对象
 * @returns {Promise<Object>} - 包含各维度建议的对象
 */
async function generateParentAdvice(report) {
  if (!OPENAI_API_KEY) {
    console.warn('API密钥未配置，返回默认建议');
    return getDefaultAdvice(report);
  }

  const maxRetries = 3;
  let retryCount = 0;
  let lastError = null;
  let lastContent = null;

  while (retryCount < maxRetries) {
    try {
      // 构建提示词
      const prompt = retryCount === 0 ? 
        generatePrompt(report) : 
        generateFixPrompt(lastContent, lastError);

      console.log('正在发送API请求到:', OPENAI_API_ENDPOINT);
      console.log('使用模型:', OPENAI_MODEL);
      console.log('重试次数:', retryCount);
      
      // 调用API
      const response = await axios.post(
        `${OPENAI_API_ENDPOINT}/chat/completions`,
        {
          model: OPENAI_MODEL,
          messages: [
            { 
              role: "system", 
              content: "你是一位专业的教育心理学家和学习指导专家，专注于青少年学习风格分析和指导。请基于学习测评结果提供针对家长的专业建议，帮助家长更好地支持孩子的学习。请严格按照指定的JSON格式返回建议。" 
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
          http_referer: "https://learning-scan.example.com",
          route: "fallback"
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'HTTP-Referer': 'https://learning-scan.example.com',
            'X-Title': 'Learning Scan AI'
          }
        }
      );

      // 检查响应
      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        throw new Error('API返回无效响应');
      }
      
      const content = response.data.choices[0].message.content;
      console.log('AI回复原始内容:', content);
      lastContent = content;

      // 解析建议
      try {
        const advice = parseAdvice(content);
        console.log('成功生成AI建议');
        return advice;
      } catch (parseError) {
        console.error('解析建议失败:', parseError);
        lastError = parseError;
        
        if (retryCount === maxRetries - 1) {
          throw parseError;
        }
        
        // 如果不是最后一次重试，继续下一次尝试
        retryCount++;
        continue;
      }

    } catch (error) {
      console.error('生成AI建议时出错:', error.message);
      if (error.response) {
        console.error('错误详情:', error.response.data);
        console.error('状态码:', error.response.status);
      }
      
      lastError = error;
      
      // 如果是最后一次重试，返回默认建议
      if (retryCount === maxRetries - 1) {
        console.warn(`已达到最大重试次数(${maxRetries})，返回默认建议`);
        return getDefaultAdvice(report);
      }
      
      // 计算退避时间
      const backoffDelay = Math.pow(2, retryCount) * 1000; // 指数退避
      console.log(`等待 ${backoffDelay}ms 后重试...`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
      
      retryCount++;
    }
  }

  // 如果所有重试都失败，返回默认建议
  console.error('所有重试都失败，最后一个错误:', lastError);
  return getDefaultAdvice(report);
}

/**
 * 生成提示词
 * @param {Object} report - 学习报告对象
 * @returns {String} - 完整提示词
 */
function generatePrompt(report) {
  // 计算主导特征和次要特征
  const perceptionScores = report.scores.perception;
  const processingScores = report.scores.processing;
  const environmentScores = report.scores.environment;
  const thinkingScores = report.scores.thinking;
  const timeManagementScores = report.scores.timeManagement;

  return `你是一位有20年经验的教育心理学专家和青少年发展顾问，专注于学习风格分析和家庭教育指导。请基于以下详细的学习风格测评结果，为家长提供系统性、个性化、实用性的专业指导建议。

## 输出示例
{
  "感知偏好": {
    "核心特征分析": "示例内容",
    "学习方法指导": "示例内容",
    "家长支持策略": "示例内容",
    "环境创设建议": "示例内容",
    "能力发展规划": "示例内容",
    "沟通技巧指导": "示例内容",
    "常见问题应对": "示例内容",
    "长期发展建议": "示例内容"
  },
  "信息处理方式": {
    "核心特征分析": "示例内容",
    "学习方法指导": "示例内容",
    "家长支持策略": "示例内容",
    "环境创设建议": "示例内容",
    "能力发展规划": "示例内容",
    "沟通技巧指导": "示例内容",
    "常见问题应对": "示例内容",
    "长期发展建议": "示例内容"
  },
  "学习环境偏好": {
    "核心特征分析": "示例内容",
    "学习方法指导": "示例内容",
    "家长支持策略": "示例内容",
    "环境创设建议": "示例内容",
    "能力发展规划": "示例内容",
    "沟通技巧指导": "示例内容",
    "常见问题应对": "示例内容",
    "长期发展建议": "示例内容"
  },
  "思维模式": {
    "核心特征分析": "示例内容",
    "学习方法指导": "示例内容",
    "家长支持策略": "示例内容",
    "环境创设建议": "示例内容",
    "能力发展规划": "示例内容",
    "沟通技巧指导": "示例内容",
    "常见问题应对": "示例内容",
    "长期发展建议": "示例内容"
  },
  "时间管理倾向": {
    "核心特征分析": "示例内容",
    "学习方法指导": "示例内容",
    "家长支持策略": "示例内容",
    "环境创设建议": "示例内容",
    "能力发展规划": "示例内容",
    "沟通技巧指导": "示例内容",
    "常见问题应对": "示例内容",
    "长期发展建议": "示例内容"
  },
  "综合发展建议": {
    "整体学习规划": "示例内容",
    "家庭教育策略": "示例内容",
    "能力培养重点": "示例内容",
    "潜能开发方向": "示例内容",
    "协调发展指导": "示例内容",
    "阶段性目标设定": "示例内容",
    "家校协作建议": "示例内容",
    "持续监测评估": "示例内容"
  }
}

## 输出格式要求
1. 必须严格按照标准JSON格式输出，不要添加任何额外的说明文字
2. 必须包含以下6个维度，缺一不可：
   - 感知偏好
   - 信息处理方式
   - 学习环境偏好
   - 思维模式
   - 时间管理倾向
   - 综合发展建议
3. 每个维度的所有字段都必须完整输出，若某字段内容无法生成，请填写"暂无建议"

## 学生基本信息
- 主导学习类型: ${report.learningTypeCode} (${report.isMixedType ? '混合型学习者' : '主导型学习者'})
- 学习类型描述: ${report.learningTypeDescription}
- 年龄阶段: ${report.user?.age || '青少年'}岁
- 年级: ${report.user?.grade || '中学'}

## 详细测评结果分析

### 1. 感知偏好维度 (主导类型: ${report.dominantType.perceptionType})
- 视觉型学习倾向: ${perceptionScores.visual}% ${perceptionScores.visual >= 60 ? '(强烈偏好)' : perceptionScores.visual >= 40 ? '(中等倾向)' : '(较弱倾向)'}
- 听觉型学习倾向: ${perceptionScores.auditory}% ${perceptionScores.auditory >= 60 ? '(强烈偏好)' : perceptionScores.auditory >= 40 ? '(中等倾向)' : '(较弱倾向)'}
- 动觉型学习倾向: ${perceptionScores.kinesthetic}% ${perceptionScores.kinesthetic >= 60 ? '(强烈偏好)' : perceptionScores.kinesthetic >= 40 ? '(中等倾向)' : '(较弱倾向)'}

### 2. 信息处理方式 (主导类型: ${report.dominantType.processingType})
- 系统性处理倾向: ${processingScores.systematic}% ${processingScores.systematic >= 60 ? '(强烈偏好)' : processingScores.systematic >= 40 ? '(中等倾向)' : '(较弱倾向)'}
- 跳跃性处理倾向: ${processingScores.global}% ${processingScores.global >= 60 ? '(强烈偏好)' : processingScores.global >= 40 ? '(中等倾向)' : '(较弱倾向)'}

### 3. 学习环境偏好 (主导类型: ${report.dominantType.environmentType})
- 结构化环境倾向: ${environmentScores.structured}% ${environmentScores.structured >= 60 ? '(强烈偏好)' : environmentScores.structured >= 40 ? '(中等倾向)' : '(较弱倾向)'}
- 灵活环境倾向: ${environmentScores.flexible}% ${environmentScores.flexible >= 60 ? '(强烈偏好)' : environmentScores.flexible >= 40 ? '(中等倾向)' : '(较弱倾向)'}

### 4. 思维模式 (主导类型: ${report.dominantType.thinkingType})
- 分析型思维倾向: ${thinkingScores.analytical}% ${thinkingScores.analytical >= 60 ? '(强烈偏好)' : thinkingScores.analytical >= 40 ? '(中等倾向)' : '(较弱倾向)'}
- 创造型思维倾向: ${thinkingScores.creative}% ${thinkingScores.creative >= 60 ? '(强烈偏好)' : thinkingScores.creative >= 40 ? '(中等倾向)' : '(较弱倾向)'}

### 5. 时间管理倾向 (主导类型: ${report.dominantType.timeManagementType})
- 计划型管理倾向: ${timeManagementScores.planned}% ${timeManagementScores.planned >= 60 ? '(强烈偏好)' : timeManagementScores.planned >= 40 ? '(中等倾向)' : '(较弱倾向)'}
- 适应型管理倾向: ${timeManagementScores.adaptive}% ${timeManagementScores.adaptive >= 60 ? '(强烈偏好)' : timeManagementScores.adaptive >= 40 ? '(中等倾向)' : '(较弱倾向)'}

## 专业指导要求
1. 每个建议必须包含：
   - 理论依据：基于教育心理学理论简要说明
   - 具体策略：提供2-3个可操作的具体方法
   - 实际案例：举例说明如何在实际生活中应用
   - 注意事项：提醒家长可能遇到的问题和应对方法
   - 效果评估：建议如何观察和评估效果

2. 建议内容要求：
   - 每个建议控制在200-300字
   - 内容详实、专业、易懂
   - 基于具体的测评数据进行个性化定制
   - 提供具体可操作的方法，避免空泛理论
   - 包含实际案例和场景应用
   - 考虑青少年的身心发展特点
   - 语言温和专业，易于家长理解和执行

请严格按照上述格式和要求输出JSON格式的建议内容。`;
}

/**
 * 解析API返回的建议文本
 * @param {String} content - API返回的文本内容
 * @returns {Object} - 解析后的建议对象
 */
function parseAdvice(content) {
  try {
    console.log('开始解析AI回复内容...');
    
    // 预处理内容
    let cleanContent = content.trim();
    
    // 移除可能的markdown代码块标记
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.substring(7);
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.substring(0, cleanContent.length - 3);
    }
    
    // 清理内容
    cleanContent = cleanContent
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 移除控制字符
      .replace(/\n\s*\/\/.*$/gm, '') // 移除注释
      .replace(/\n/g, ' ') // 移除换行符
      .replace(/\s+/g, ' ') // 规范化空白字符
      .trim();
    
    // 尝试解析JSON
    let parsedJson;
    try {
      parsedJson = JSON.parse(cleanContent);
    } catch (jsonError) {
      console.error('JSON解析失败:', jsonError);
      console.log('清理后的内容:', cleanContent);
      throw new Error('AI回复格式错误，无法解析为JSON');
    }

    // 转换数组为字符串的函数
    const convertArrayToString = (arr) => {
      if (!Array.isArray(arr)) return arr;
      return arr.map((item, index) => `${index + 1}. ${item}`).join('\n');
    };

    // 递归处理对象中的所有字段
    const processObject = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      
      const processed = {};
      for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
          processed[key] = convertArrayToString(value);
        } else if (typeof value === 'object' && value !== null) {
          processed[key] = processObject(value);
        } else {
          processed[key] = value;
        }
      }
      return processed;
    };

    // 处理整个JSON对象
    parsedJson = processObject(parsedJson);
    
    // 验证JSON结构
    const requiredDimensions = ['感知偏好', '信息处理方式', '学习环境偏好', '思维模式', '时间管理倾向', '综合发展建议'];
    const requiredFields = ['核心特征分析', '学习方法指导', '家长支持策略', '环境创设建议', '能力发展规划', '沟通技巧指导', '常见问题应对', '长期发展建议'];
    const comprehensiveFields = ['整体学习规划', '家庭教育策略', '能力培养重点', '潜能开发方向', '协调发展指导', '阶段性目标设定', '家校协作建议', '持续监测评估'];
    
    // 检查所有必需的维度
    for (const dimension of requiredDimensions) {
      if (!parsedJson[dimension]) {
        console.error(`缺少维度: ${dimension}`);
        throw new Error(`AI回复缺少必需的维度: ${dimension}`);
      }
      
      // 对于综合发展建议，使用不同的字段验证
      const fieldsToCheck = dimension === '综合发展建议' ? comprehensiveFields : requiredFields;
      
      // 检查每个维度的必需字段
      for (const field of fieldsToCheck) {
        if (!parsedJson[dimension][field]) {
          console.error(`维度 ${dimension} 缺少字段: ${field}`);
          throw new Error(`维度 ${dimension} 缺少必需的字段: ${field}`);
        }
        
        // 验证字段内容
        const content = parsedJson[dimension][field];
        if (typeof content !== 'string' || content.trim() === '' || content === '...') {
          console.error(`维度 ${dimension} 的 ${field} 内容无效`);
          throw new Error(`维度 ${dimension} 的 ${field} 内容无效`);
        }
      }
    }
    
    console.log('AI建议解析成功');
    return parsedJson;
    
  } catch (error) {
    console.error('解析AI建议时出错:', error);
    console.error('错误详情:', error.stack);
    throw error;
  }
}

/**
 * 获取默认建议(当API不可用时)
 * @param {Object} report - 学习报告对象
 * @returns {Object} - 默认建议
 */
function getDefaultAdvice(report) {
  // 获取各维度的得分
  const perceptionScores = report.scores.perception;
  const processingScores = report.scores.processing;
  const environmentScores = report.scores.environment;
  const thinkingScores = report.scores.thinking;
  const timeManagementScores = report.scores.timeManagement;

  // 获取主导类型
  const dominantTypes = report.dominantType;

  // 根据得分生成特征描述
  const getFeatureDescription = (score, type) => {
    if (score >= 60) return `表现出强烈的${type}倾向`;
    if (score >= 40) return `表现出中等程度的${type}倾向`;
    return `表现出较弱的${type}倾向`;
  };

  return {
    "感知偏好": {
      "核心特征分析": `您的孩子${getFeatureDescription(perceptionScores.visual, '视觉型学习')}，${getFeatureDescription(perceptionScores.auditory, '听觉型学习')}，${getFeatureDescription(perceptionScores.kinesthetic, '动觉型学习')}。主导感知类型为${dominantTypes.perceptionType}，这反映了孩子获取信息的主要方式。`,
      "学习方法指导": `建议根据${dominantTypes.perceptionType}的特点，重点采用相应的学习方法。同时，适当结合其他感知方式，促进多元感知能力的发展。`,
      "家长支持策略": `观察并记录孩子在${dominantTypes.perceptionType}学习方式下的表现，提供相应的学习材料和环境支持。`,
      "环境创设建议": `根据${dominantTypes.perceptionType}的特点，创造适合的学习环境，准备相应的学习工具和材料。`,
      "能力发展规划": `在发挥${dominantTypes.perceptionType}优势的同时，逐步培养其他感知能力，实现感知能力的均衡发展。`,
      "沟通技巧指导": `采用适合${dominantTypes.perceptionType}特点的沟通方式，提高沟通效果。`,
      "常见问题应对": `当孩子在${dominantTypes.perceptionType}学习方式下遇到困难时，灵活调整学习策略，寻找最适合的解决方案。`,
      "长期发展建议": `定期评估孩子的感知偏好变化，适时调整学习策略，培养综合感知能力。`
    },
    "信息处理方式": {
      "核心特征分析": `您的孩子${getFeatureDescription(processingScores.systematic, '系统性处理')}，${getFeatureDescription(processingScores.global, '跳跃性处理')}。主导处理方式为${dominantTypes.processingType}，这反映了孩子处理信息的主要特点。`,
      "学习方法指导": `根据${dominantTypes.processingType}的特点，提供相应的学习方法指导，培养灵活的信息处理能力。`,
      "家长支持策略": `理解并尊重孩子的${dominantTypes.processingType}特点，在辅导学习时采用相应的指导方式。`,
      "环境创设建议": `根据${dominantTypes.processingType}的特点，创造适合的学习环境，提供相应的学习工具和组织方式。`,
      "能力发展规划": `在强化${dominantTypes.processingType}能力的基础上，逐步培养另一种处理方式，提高信息处理的灵活性。`,
      "沟通技巧指导": `根据${dominantTypes.processingType}特点调整沟通方式，提高沟通效果。`,
      "常见问题应对": `当孩子的处理方式与任务要求不匹配时，帮助其学会灵活切换处理策略。`,
      "长期发展建议": `培养孩子在不同情境下灵活选择信息处理方式的能力，提高学习效率和适应性。`
    },
    "学习环境偏好": {
      "核心特征分析": `您的孩子${getFeatureDescription(environmentScores.structured, '结构化环境')}，${getFeatureDescription(environmentScores.flexible, '灵活环境')}。主导环境偏好为${dominantTypes.environmentType}，这反映了孩子对学习环境的偏好。`,
      "学习方法指导": `根据${dominantTypes.environmentType}的特点，提供相应的学习方法指导，创造最佳学习效果。`,
      "家长支持策略": `尊重孩子的${dominantTypes.environmentType}偏好，在可能的范围内调整家庭学习环境。`,
      "环境创设建议": `根据${dominantTypes.environmentType}的特点，合理安排学习空间的布局、光线、声音等要素。`,
      "能力发展规划": `在满足${dominantTypes.environmentType}偏好的同时，逐步培养在其他环境下的学习能力。`,
      "沟通技巧指导": `选择适合${dominantTypes.environmentType}特点的环境进行重要沟通。`,
      "常见问题应对": `当无法完全满足孩子的理想学习环境时，帮助其学会在现有条件下创造最佳学习状态。`,
      "长期发展建议": `逐步培养孩子在各种环境下都能有效学习的能力，增强环境适应性。`
    },
    "思维模式": {
      "核心特征分析": `您的孩子${getFeatureDescription(thinkingScores.analytical, '分析型思维')}，${getFeatureDescription(thinkingScores.creative, '创造型思维')}。主导思维模式为${dominantTypes.thinkingType}，这反映了孩子的思维特点。`,
      "学习方法指导": `根据${dominantTypes.thinkingType}的特点，提供相应的学习方法指导，促进思维能力的发展。`,
      "家长支持策略": `理解并尊重孩子的${dominantTypes.thinkingType}特点，在日常交流中注意培养思维能力。`,
      "环境创设建议": `创造既能支持${dominantTypes.thinkingType}又能激发另一种思维能力的家庭环境。`,
      "能力发展规划": `在发展${dominantTypes.thinkingType}优势的同时，注意培养另一种思维能力。`,
      "沟通技巧指导": `根据${dominantTypes.thinkingType}特点调整沟通方式，提高沟通效果。`,
      "常见问题应对": `当思维方式与任务要求不匹配时，帮助孩子学会灵活切换思维模式。`,
      "长期发展建议": `培养孩子的元认知能力，让其了解自己的思维特点，学会选择合适的思维策略。`
    },
    "时间管理倾向": {
      "核心特征分析": `您的孩子${getFeatureDescription(timeManagementScores.planned, '计划型管理')}，${getFeatureDescription(timeManagementScores.adaptive, '适应型管理')}。主导时间管理倾向为${dominantTypes.timeManagementType}，这反映了孩子的时间管理特点。`,
      "学习方法指导": `根据${dominantTypes.timeManagementType}的特点，帮助孩子建立适合的学习计划。`,
      "家长支持策略": `理解并尊重孩子的${dominantTypes.timeManagementType}特点，提供适当的指导和支持。`,
      "环境创设建议": `根据${dominantTypes.timeManagementType}的特点，创造有利于时间管理的环境。`,
      "能力发展规划": `在尊重${dominantTypes.timeManagementType}倾向的基础上，逐步培养更全面的时间管理能力。`,
      "沟通技巧指导": `根据${dominantTypes.timeManagementType}特点，在时间管理方面进行有效沟通。`,
      "常见问题应对": `当在时间管理上遇到困难时，提供耐心指导，帮助找到适合的时间管理策略。`,
      "长期发展建议": `培养孩子的时间意识和自我管理能力，为其未来的学习和生活打下基础。`
    },
    "综合发展建议": {
      "整体学习规划": `基于孩子的学习风格特点（${report.learningTypeCode}），建议制定个性化的学习规划，充分发挥${dominantTypes.perceptionType}、${dominantTypes.processingType}、${dominantTypes.environmentType}、${dominantTypes.thinkingType}和${dominantTypes.timeManagementType}的优势。`,
      "家庭教育策略": `根据孩子的学习风格特点，采用多元化的家庭教育方法，营造支持性的家庭学习环境。`,
      "能力培养重点": `重点关注孩子的核心学习能力培养，包括自主学习能力、批判性思维、创造力和沟通合作能力。`,
      "潜能开发方向": `基于孩子的学习风格特点，发掘和培养其潜在优势，提供相应的发展机会。`,
      "协调发展指导": `注意平衡发展孩子的各项能力，避免偏科或能力发展不均衡。`,
      "阶段性目标设定": `根据孩子的年龄特点和发展水平，设定合理的短期和长期目标。`,
      "家校协作建议": `与学校老师保持良好沟通，共享孩子的学习特点信息，协调一致地支持孩子的学习发展。`,
      "持续监测评估": `定期观察和评估孩子的学习进展，及时调整教育策略和方法。`
    }
  };
}

/**
 * 生成修复JSON的提示词
 * @param {String} content - 原始内容
 * @param {Error} error - 解析错误
 * @returns {String} - 修复提示词
 */
function generateFixPrompt(content, error) {
  return `请修复以下JSON格式错误。原始内容存在格式问题，导致无法解析为有效的JSON。

## 错误信息
${error.message}

## 原始内容
${content}

## 修复要求
1. 保持原有内容不变，只修复格式问题
2. 确保使用标准JSON格式：
   - 使用双引号作为键和字符串值的引号
   - 使用逗号分隔数组和对象元素
   - 使用冒号分隔键值对
   - 使用花括号表示对象
   - 使用方括号表示数组
3. 必须包含以下6个维度，缺一不可：
   - 感知偏好
   - 信息处理方式
   - 学习环境偏好
   - 思维模式
   - 时间管理倾向
   - 综合发展建议
4. 每个维度必须包含所有必需字段：
   - 前5个维度必须包含：核心特征分析、学习方法指导、家长支持策略、环境创设建议、能力发展规划、沟通技巧指导、常见问题应对、长期发展建议
   - 综合发展建议维度必须包含：整体学习规划、家庭教育策略、能力培养重点、潜能开发方向、协调发展指导、阶段性目标设定、家校协作建议、持续监测评估
5. 如果发现缺少任何维度或字段，请补充完整，内容可以基于已有内容生成
6. 修复引号嵌套和闭合问题
7. 移除任何可能导致JSON解析错误的特殊字符

请直接返回修复后的JSON内容，不要添加任何说明文字。`;
}

module.exports = {
  generateParentAdvice
}; 