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
          route: "fallback",
          response_format: { type: 'json_object' }
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
   - 前5个维度必须包含：核心特征分析、学习方法指导、家长支持策略、环境创设建议、能力发展规划、沟通技巧指导、常见问题应对
   - 综合发展建议维度必须包含：整体学习规划、家庭教育策略、能力培养重点、潜能开发方向、协调发展指导、阶段性目标设定、家校协作建议、持续监测评估
5. 如果发现缺少任何维度或字段，请补充完整，内容可以基于已有内容生成
6. 修复引号嵌套和闭合问题
7. 移除任何可能导致JSON解析错误的特殊字符

请直接返回修复后的JSON内容，不要添加任何说明文字。`;
}

/**
 * 智能学习目标解析（目标可行性评估、分解、优先级排序）
 * @param {Object} param0 { goalType, goalContent, user }
 * @returns {Promise<Object>} 结构化AI解析结果
 */
async function analyzeGoal({ goalType, goalContent, user }) {
  if (!OPENAI_API_KEY) {
    return {
      feasibility: '（AI未配置，无法评估）',
      breakdown: ['（AI未配置，无法分解）'],
      priority: ['（AI未配置，无法排序）']
    };
  }
  const prompt = `你是一位专业的K12学习规划师。请针对如下学生学习目标，进行：1.可行性评估（简要说明）；2.将目标分解为3-5个阶段性小目标和具体行动项；3.根据课程要求、考试权重、兴趣和能力等，给出优先级排序建议。\n\n【目标类型】：${goalType}\n【目标内容】：${goalContent}\n【学生信息】：${user ? (user.grade + '，' + user.age + '岁') : '未知'}\n\n请用如下JSON格式输出：\n{\n  feasibility: "可行性评估",\n  breakdown: ["小目标1", "小目标2", ...],\n  priority: ["优先事项1", "优先事项2", ...]\n}`;

  const response = await axios.post(
    `${OPENAI_API_ENDPOINT}/chat/completions`,
    {
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: '你是一位专业的K12学习规划师，擅长目标分解与优先级排序。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1024
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    }
  );
  const content = response.data.choices[0].message.content;
  // 尝试解析JSON
  try {
    const result = JSON.parse(content.replace(/```json|```/g, ''));
    return result;
  } catch (e) {
    return { feasibility: 'AI返回格式异常', breakdown: [], priority: [], raw: content };
  }
}

/**
 * 个性化学习路径生成（AI）
 * @param {Object} param0 { styleType, levelMath, levelChinese, studyTime, studyPreference, user }
 * @returns {Promise<Object>} 结构化AI路径结果
 */
async function analyzePath({ styleType, levelMath, levelChinese, studyTime, studyPreference, user }) {
  if (!OPENAI_API_KEY) {
    return {
      options: ['（AI未配置，无法生成路径方案）'],
      schedule: ['（AI未配置，无法生成详细计划）']
    };
  }
  const prompt = `你是一位专业的K12学习规划师。请根据以下学生信息，生成3套不同思路的个性化学习路径方案，并给出详细的日/周/月学习计划建议。

【学习风格】：${styleType}
【数学能力】：${levelMath}
【语文能力】：${levelChinese}
【每周可用学习时间】：${studyTime}小时
【学习偏好】：${Array.isArray(studyPreference) ? studyPreference.join('、') : studyPreference}
【学生信息】：${user ? (user.grade + '，' + user.age + '岁') : '未知'}

【格式警告】
!!! 重要：schedule字段weekly必须是对象（用大括号包裹，key为"周一"~"周日"，value为字符串），monthly必须是字符串数组。绝对不能把时间和内容混在key里，不能用乱序的key-value，不能用如下错误格式：
"weekly": "周一", "7:00-8:00 数学视觉化练习": "周三", ...
!!! Important: The 'weekly' field in 'schedule' must be an object (use curly braces), with keys as '周一' to '周日' and values as strings. The 'monthly' field must be an array of strings. DO NOT mix time and content in keys, DO NOT use unordered key-value pairs, DO NOT use wrong formats like:
"weekly": "周一", "7:00-8:00 Math practice": "周三", ...
You MUST strictly follow the example format below, otherwise the result will be considered invalid and discarded.
错误格式如下，请不要返回这种格式。该格式的key和value反转了， "7:00-8:00 语文阅读理解视觉笔记": "周五"。并且没有将一周的计划放置在weekly对象中.
{
            "name": "详细计划1 - 均衡发展方案",
            "weekly": "周一",
            "7:00-8:00 数学概念图构建": "周三",
            "7:00-8:00 语文阅读理解视觉笔记": "周五",
            "7:00-8:00 数学逻辑推理训练": "周六",
            "9:00-11:00 自主选择项目（如科学实验、艺术创作）": "周日",
            "复习本周内容并准备下周计划": "monthly",
            "第1周：重点训练图形化表达数学公式": "第2周：探索古诗词背后的故事，并尝试绘制插画表达情感",
            "第3周：深入学习几何图形特性及实际应用案例分析": "第4周：撰写一篇关于最喜欢的书籍的读后感，并配以手绘插图"
        }
请严格按照如下JSON格式返回，不要省略任何字段，不要返回多余内容。每个字段类型必须严格一致：

{
  "options": [
    {
      "name": "string 路径方案名称",
      "description": "string 路径方案简介"
    }
  ],
  "schedule": [
    {
      "name": "string 详细计划名称",
      "weekly": {
        "周一": "string 当天学习安排",
        "周二": "string 当天学习安排"
        // ... 可选：周三、周四、周五、周六、周日
      },
      "monthly": [
        "string 月度学习重点1",
        "string 月度学习重点2"
      ]
    }
  ],
  "补充说明": [
    "string 补充说明1",
    "string 补充说明2"
  ]
}

【格式要求】
1. options 必须为对象数组，且每个对象含 name 和 description 字段，均为字符串。
2. schedule 必须为对象数组，且每个对象含 name（字符串）、weekly（对象，key为周一~周日，value为字符串）、monthly（字符串数组）。
3. weekly 字段必须为对象，key只能为"周一"~"周日"，value为当天学习内容（字符串），不能把时间和内容混在key里，不能用乱序的key-value，不能用错误格式。
4. monthly 字段必须为字符串数组，每个元素为"第X周：内容"格式。
5. 补充说明为字符串数组。
6. 不允许 weekly 或 monthly 为数字或其他类型。
7. 不允许有重复字段。
8. 不允许有多余字段、说明、markdown标记或注释。
9. 若无内容请返回空字符串或空数组，不要省略字段。
10. 只返回 JSON，不要有多余的解释或 markdown 标记。

【示例】
"schedule": [
  {
    "name": "详细计划1 - ...",
    "weekly": {
      "周一": "7:00-8:00 数学视觉化练习",
      "周三": "7:00-8:00 语文思维导图阅读",
      "周五": "7:00-8:00 数学应用题视觉化解题训练",
      "周六": "9:00-11:00 自由学习时间"
    },
    "monthly": [
      "第1周：重点训练分数可视化理解",
      "第2周：通过图形化方式学习记叙文六要素",
      "第3周：几何图形与面积计算专题",
      "第4周：制作阅读书籍的视觉化报告"
    ]
  }
]

**注意：必须严格按照上述格式和字段类型输出，不能有任何多余内容或格式错误，否则会导致解析失败。**
`;

  const response = await axios.post(
    `${OPENAI_API_ENDPOINT}/chat/completions`,
    {
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: '你是一位专业的K12学习规划师，擅长个性化学习路径设计。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 2048,
      response_format: { type: 'json_object' }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    }
  );
  const content = response.data.choices[0].message.content;
  // 尝试解析JSON
  try {
    const result = JSON.parse(content.replace(/```json|```/g, ''));
    return result;
  } catch (e) {
    return { options: [], schedule: [], raw: content };
  }
}

/**
 * 智能作业题目分析与分学科辅导
 * @param {Object} param0 { questionText, subject, user }
 * @returns {Promise<Object>} 结构化AI分析与辅导结果
 */
async function analyzeHomework({ questionText, subject, user }) {
  if (!OPENAI_API_KEY) {
    return {
      subject: subject || '未知',
      type: '',
      difficulty: '',
      keyInfo: [],
      guidance: {}
    };
  }

  // 定义学科模板
  const subjectTemplates = {
    '数学': `json{
  "subject": "数学",
  "type": "题目类型",
  "difficulty": "难度等级",
  "keyInfo": ["关键信息1", "关键信息2"],
  "guidance": {
    "概念回顾": "相关数学概念和公式说明",
    "解题思路引导": "分步骤引导学生思考解题方法",
    "计算验证": "帮助验证计算结果的正确性",
    "错误诊断": "常见错误类型分析及纠正建议",
    "类题练习": ["类题1", "类题2"]
  }
}`,
    '语文': `json{
  "subject": "语文",
  "type": "题目类型",
  "difficulty": "难度等级",
  "keyInfo": ["关键信息1", "关键信息2"],
  "guidance": {
    "阅读理解指导": "文本分析方法和答题技巧",
    "写作思路启发": "作文框架和内容要点",
    "文言文解析": "字词解释和句式分析",
    "诗词鉴赏": "诗词意境和表达技巧",
    "语法纠错": "语法错误识别与纠正"
  }
}`,
    '英语': `json{
  "subject": "英语",
  "type": "题目类型",
  "difficulty": "难度等级",
  "keyInfo": ["关键信息1", "关键信息2"],
  "guidance": {
    "词汇释义": "单词含义和用法解释",
    "语法分析": "句子结构和语法要点分析",
    "翻译指导": "翻译思路和表达建议",
    "写作辅助": "作文构思和表达建议",
    "发音指导": "单词和句子的发音指导"
  }
}`,
    '理科': `json{
  "subject": "理科",
  "type": "题目类型",
  "difficulty": "难度等级",
  "keyInfo": ["关键信息1", "关键信息2"],
  "guidance": {
    "概念理解": "物理/化学/生物等概念说明",
    "实验分析": "实验题分析和解答指导",
    "公式应用": "相关公式选择与应用",
    "图表解读": "科学图表理解与分析",
    "计算指导": "理科计算题的解题步骤"
  }
}`
  };

  // 示例JSON
  const exampleJson = `{
  "subject": "数学",
  "type": "应用题",
  "difficulty": "中等",
  "keyInfo": ["已知条件1", "已知条件2"],
  "guidance": {
    "概念回顾": "相关数学概念和公式说明",
    "解题思路引导": "分步骤引导学生思考解题方法",
    "计算验证": "帮助验证计算结果的正确性",
    "错误诊断": "常见错误类型分析及纠正建议",
    "类题练习": ["类题1", "类题2"]
  }
}`;

  // 构造参数
  const question_type = '应用题'; // 可以根据实际逻辑判断
  const difficulty = '中等';      // 可以根据实际逻辑判断
  const student_question = questionText;
  const subject_template = subjectTemplates[subject] || subjectTemplates['数学'];

  // 直接使用prompt.txt的内容，替换模板变量
  const promptTemplate = `你是一个专业的学科辅导助手。请严格按照以下要求输出JSON格式的学习指导内容。

**重要提醒：**
1. 必须严格按照JSON格式输出，不要添加任何解释文字
2. 确保JSON语法正确，所有字符串用双引号包围
3. 数组元素用方括号，对象用花括号
4. 不要在JSON前后添加markdown代码块标记
5. 输出内容必须是完整有效的JSON
6. 如果包含数学公式，请用以$包围的LaTeX格式输出，例如：$f(x) = \frac{a}{b}$、$\lambda$

**输入信息：**
- 学科：${subject || '数学'}
- 题目类型：${question_type} 
- 难度：${difficulty}
- 学生问题：${student_question}

**输出要求：**
根据学科类型，严格按照对应的JSON结构输出：

${subject_template}

**输出格式示例：**
${exampleJson}

现在请根据以上要求，为学生的问题生成JSON格式的学习指导：`;

  const response = await axios.post(
    `${OPENAI_API_ENDPOINT}/chat/completions`,
    {
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: '你是一位专业的K12作业辅导AI，擅长分学科结构化辅导。' },
        { role: 'user', content: promptTemplate }
      ],
      temperature: 0.5,
      max_tokens: 2048,
      response_format: { type: 'json_object' }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    }
  );
  const content = response.data.choices[0].message.content;
  try {
    const parsed = JSON.parse(content.replace(/```json|```/g, ''));
    console.log('analyzeHomework AI返回JSON:', parsed);
    
    // 修复LaTeX格式的函数
    const fixLatexFormat = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      
      const processed = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          // 先将所有多余的斜杠归一为单斜杠（如 \\\\frac -> \\frac -> \frac）
          let fixed = value.replace(/\\+/g, '\\');
          // 将\(...\)格式转换为$...$格式
          fixed = fixed.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
          // 检查是否包含LaTeX公式但没有数学符号包围
          if (fixed.match(/\\frac|\\sqrt|\\sum|\\int|\\lim|\\sin|\\cos|\\tan|\\log/)) {
            // 如果包含LaTeX公式但没有$包围，则添加$
            if (!fixed.includes('$')) {
              fixed = `$${fixed}$`;
            }
          }
          const original = value;
          processed[key] = fixed;
          if (original !== processed[key]) {
            console.log(`LaTeX修复 - ${key}: "${original}" -> "${processed[key]}"`);
          }
        } else if (Array.isArray(value)) {
          processed[key] = value.map(item => {
            if (typeof item === 'string') {
              const original = item;
              let fixed = item.replace(/\\+/g, '\\');
              // 将\(...\)格式转换为$...$格式
              fixed = fixed.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
              if (fixed.match(/\\frac|\\sqrt|\\sum|\\int|\\lim|\\sin|\\cos|\\tan|\\log/)) {
                if (!fixed.includes('$')) {
                  fixed = `$${fixed}$`;
                }
              }
              if (original !== fixed) {
                console.log(`LaTeX修复 - 数组项: "${original}" -> "${fixed}"`);
              }
              return fixed;
            }
            return item;
          });
        } else if (typeof value === 'object' && value !== null) {
          processed[key] = fixLatexFormat(value);
        } else {
          processed[key] = value;
        }
      }
      return processed;
    };
    
    // 修复LaTeX格式
    const fixedParsed = fixLatexFormat(parsed);
    console.log('LaTeX修复后的数据:', JSON.stringify(fixedParsed, null, 2));
    
    // 保证返回结构完整，使用前端期望的中文字段名
    const result = {
      学科: fixedParsed.subject || fixedParsed.学科 || subject || '',
      题型: fixedParsed.type || fixedParsed.题型 || '',
      难度: fixedParsed.difficulty || fixedParsed.难度 || '',
      关键信息: fixedParsed.keyInfo || fixedParsed.关键信息 || [],
      '分学科guidance': fixedParsed.guidance || fixedParsed['分学科guidance'] || {}
    };
    
    console.log('最终返回给前端的数据:', JSON.stringify(result, null, 2));
    return result;
  } catch (e) {
    return { 
      学科: subject || '', 
      题型: '', 
      难度: '', 
      关键信息: [], 
      '分学科guidance': {}, 
      raw: content 
    };
  }
}

/**
 * 渐进式思维引导
 * @param {Object} param0 { imageBase64, questionText, currentStep, user }
 * @returns {Promise<Object>} 分层次引导内容
 */
async function progressiveGuidance({ imageBase64, questionText, currentStep, user }) {
  if (!OPENAI_API_KEY) {
    return { step: currentStep || '题目理解', content: '（AI未配置，无法引导）', nextStep: '' };
  }

  const OCR_API_KEY = process.env.OCR_API_KEY || process.env.OPENAI_API_KEY;
  const OCR_API_ENDPOINT = process.env.OCR_API_ENDPOINT || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
  const OCR_MODEL = process.env.OCR_MODEL || 'qwen-vl-max';

  // 新增日志，检查参数
  console.log('[progressiveGuidance] imageBase64 是否存在:', !!imageBase64);
  if (imageBase64 && imageBase64.startsWith('data:image/')) {
    console.log('[progressiveGuidance] 使用多模态模型:', OCR_MODEL);
    console.log('[progressiveGuidance] imageBase64前10字符:', imageBase64.substring(0, 10));
  }

  try {
    let prompt;
    let body;

    if (imageBase64 && imageBase64.startsWith('data:image/')) {
      // 使用多模态API处理图片
      prompt = `你是一位专业的K12作业辅导AI。请针对以下图片题目，按照分层次引导（题目理解→思路启发→方法指导→验证检查），输出当前层级内容。当前层级：${currentStep || '题目理解'}。请返回如下JSON格式：{step: "当前层级", content: "本层引导内容", nextStep: "下一层级"}。学生信息：${user ? (user.grade + '，' + user.age + '岁') : '未知'}`;
      
      body = {
        model: OCR_MODEL,
        input: {
          messages: [
            {
              role: 'user',
              content: [
                { image: imageBase64 },
                { text: prompt }
              ]
            }
          ]
        },
        response_format: { type: 'json_object' }
      };

      const response = await axios.post(
        OCR_API_ENDPOINT,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OCR_API_KEY}`
          }
        }
      );

      console.log('\n3. 多模态AI原始返回:');
      console.log('- 完整响应:', JSON.stringify(response.data, null, 2));

      const content = response.data.output?.choices?.[0]?.message?.content?.[0]?.text || '';
      console.log('\n4. 提取的content:');
      console.log('- 类型:', typeof content);
      console.log('- 内容:', content);

      if (typeof content === 'string') {
        // 移除可能的markdown代码块标记
        let cleanContent = content.replace(/```json|```/g, '').trim();
        console.log('\n5. 清理后的内容:', cleanContent);

        // 新增：更健壮的JSON解析
        try {
          // 尝试直接解析
          return JSON.parse(cleanContent);
        } catch (e1) {
          // 尝试用正则提取第一个大括号包裹的内容
          const match = cleanContent.match(/\{[\s\S]*\}/);
          if (match) {
            try {
              return JSON.parse(match[0]);
            } catch (e2) {
              // 还可以继续尝试修复，比如去掉多余转义符等
            }
          }
          // 最后兜底，返回原始内容和错误信息
          return { error: 'AI返回内容无法解析为JSON', raw: content, cleanContent };
        }
      }
    } else {
      // 使用文本API处理纯文本
      prompt = `你是一位专业的K12作业辅导AI。请针对以下题目，按照分层次引导（题目理解→思路启发→方法指导→验证检查），每次只输出当前层级内容，返回如下JSON：{step: "当前层级", content: "本层引导内容", nextStep: "下一层级"}。\n题目：${questionText}\n当前层级：${currentStep || '题目理解'}\n学生信息：${user ? (user.grade + '，' + user.age + '岁') : '未知'}`;
      
      body = {
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: '你是一位专业的K12作业辅导AI，擅长渐进式思维引导。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 512,
        response_format: { type: 'json_object' }
      };


      const response = await axios.post(
        `${OPENAI_API_ENDPOINT}/chat/completions`,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        }
      );


      const content = response.data.choices?.[0]?.message?.content || '';

      if (typeof content === 'string') {
        // 移除可能的markdown代码块标记
        const cleanContent = content.replace(/```json|```/g, '').trim();
        try {
          // 修复LaTeX公式中的特殊字符
          const fixedContent = cleanContent
            // 修复反斜杠
            .replace(/\\([^\\])/g, '\\\\$1')
            // 修复换行符
            .replace(/\n/g, '\\n')
            // 修复引号
            .replace(/"/g, '\\"')
            // 修复其他特殊字符
            .replace(/\t/g, '\\t')
            .replace(/\r/g, '\\r')
            .replace(/\f/g, '\\f')
            .replace(/\v/g, '\\v')
            // 移除多余的空格和换行
            .replace(/\s+/g, ' ')
            .trim();

          // 尝试直接解析原始内容
          try {
            const parsed = JSON.parse(cleanContent);

            // 确保返回的数据结构一致
            const result = {
              step: parsed.step || currentStep || '',
              content: parsed.content || '',
              nextStep: parsed.nextStep || ''
            };
            return result;
          } catch (e1) {
            // 如果原始内容解析失败，尝试使用修复后的内容
            try {
              // 确保JSON格式正确
              const jsonStr = `{${fixedContent.split('{')[1].split('}')[0]}}`;
              const parsed = JSON.parse(jsonStr);

              // 确保返回的数据结构一致
              const result = {
                step: parsed.step || currentStep || '',
                content: parsed.content || '',
                nextStep: parsed.nextStep || ''
              };

              return result;
            } catch (e2) {
              console.error('\n6.3 修复后内容解析也失败:');
              console.error('- 错误信息:', e2.message);
              console.error('- 错误堆栈:', e2.stack);
              return { 
                step: currentStep || '', 
                content: '', 
                nextStep: '',
                raw: content 
              };
            }
          }
        } catch (e) {
          console.error('\n6. JSON解析失败:');
          console.error('- 错误信息:', e.message);
          console.error('- 错误堆栈:', e.stack);
          return { 
            step: currentStep || '', 
            content: '', 
            nextStep: '',
            raw: content 
          };
        }
      }
    }

    return { 
      step: currentStep || '', 
      content: '', 
      nextStep: '',
      raw: '未知的content类型' 
    };
  } catch (err) {
    console.error('\n=== 错误处理 ===');
    console.error('1. 错误类型:', err.name);
    console.error('2. 错误信息:', err.message);
    console.error('3. 错误堆栈:', err.stack);
    
    if (err.response) {
      console.error('4. API错误响应:');
      console.error('- 状态码:', err.response.status);
      console.error('- 错误数据:', JSON.stringify(err.response.data, null, 2));
    }
    
    throw err;
  } finally {
  }
}

/**
 * 家长辅导支持
 * @param {Object} param0 { questionText, subject }
 * @returns {Promise<Object>} 家长版解析与话术
 */
async function parentSupport({ questionText, subject }) {
  if (!OPENAI_API_KEY) {
    console.log('家长辅导支持 - API密钥未配置，返回默认值');
    return {
      knowledge: '（AI未配置，无法解析）',
      solution: '',
      errorCommon: '',
      extension: '',
      talk: [],
      encourage: [],
      correct: [],
      interact: [],
      training: [],
      trainingConcept: '',
      subjectFeature: '',
      psychology: '',
      problemSolve: ''
    };
  }
  
  console.log('\n=== 家长辅导支持 - 开始处理 ===');
  console.log('1. 输入参数:');
  console.log('- 题目内容:', questionText);
  console.log('- 学科:', subject || '自动识别');
  
  const prompt = `你是一位专业的K12家庭作业辅导专家。请针对以下题目，为家长输出如下结构化JSON：
{
  "knowledge": "知识点说明",
  "solution": "标准解题过程",
  "errorCommon": "常见错误提醒",
  "extension": "拓展知识",
  "talk": ["提问技巧1", "提问技巧2"],
  "encourage": ["鼓励用语1", "鼓励用语2"],
  "correct": ["纠错方法1", "纠错方法2"],
  "interact": ["互动建议1", "互动建议2"],
  "training": ["培训建议1", "培训建议2"],
  "trainingConcept": "辅导理念（传授科学的家庭辅导理念和方法）",
  "subjectFeature": "学科特点（介绍不同学科的学习特点和辅导要点）",
  "psychology": "心理引导（教授如何处理孩子的学习情绪和压力）",
  "problemSolve": "问题应对（提供常见辅导问题的解决方案）"
}
题目：${questionText}
学科：${subject || '自动识别'}
请严格输出JSON，不要有多余说明。`;
  
  console.log('2. 发送API请求...');
  console.log('- API端点:', OPENAI_API_ENDPOINT);
  console.log('- 使用模型:', OPENAI_MODEL);
  
  try {
    const response = await axios.post(
      `${OPENAI_API_ENDPOINT}/chat/completions`,
      {
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: '你是一位专业的K12家庭作业辅导专家，擅长家长赋能。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 2048,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    
    console.log('3. API请求成功');
    console.log('- 响应状态:', response.status);
    
    const content = response.data.choices[0].message.content;
    console.log('4. AI返回的原始内容:');
    console.log('- 内容类型:', typeof content);
    console.log('- 内容长度:', content.length);
    console.log('- 原始内容:', content);
    
    console.log('5. 开始解析JSON...');
    const parsedResult = JSON.parse(content.replace(/```json|```/g, ''));
    console.log('6. JSON解析成功:');
    console.log('- 解析后的object:', JSON.stringify(parsedResult, null, 2));
    console.log('- object类型:', typeof parsedResult);
    console.log('- object键数量:', Object.keys(parsedResult).length);
    console.log('- 主要字段:', Object.keys(parsedResult));
    
    // 检查关键字段是否存在
    const requiredFields = ['knowledge', 'solution', 'errorCommon', 'extension', 'talk', 'encourage', 'correct', 'interact', 'training', 'trainingConcept', 'subjectFeature', 'psychology', 'problemSolve'];
    console.log('7. 字段完整性检查:');
    requiredFields.forEach(field => {
      const exists = field in parsedResult;
      const value = parsedResult[field];
      const type = typeof value;
      const valueStr = JSON.stringify(value);
      const displayValue = valueStr.length > 100 ? valueStr.substring(0, 100) + '...' : valueStr;
      console.log(`- ${field}: ${exists ? '存在' : '缺失'} (类型: ${type}, 值: ${displayValue})`);
    });
    
    console.log('8. 最终返回结果:');
    console.log('- 返回的完整object:', JSON.stringify(parsedResult, null, 2));
    console.log('=== 家长辅导支持 - 处理完成 ===\n');
    
    return parsedResult;
  } catch (error) {
    console.error('处理过程中发生错误:');
    console.error('- 错误类型:', error.name);
    console.error('- 错误信息:', error.message);
    console.error('- 错误堆栈:', error.stack);
    
    if (error.response) {
      console.error('- API错误响应:');
      console.error('  - 状态码:', error.response.status);
      console.error('  - 错误数据:', JSON.stringify(error.response.data, null, 2));
    }
    
    const fallbackResult = { 
      knowledge: '', 
      solution: '', 
      errorCommon: '', 
      extension: '', 
      talk: [], 
      encourage: [], 
      correct: [], 
      interact: [], 
      training: [], 
      trainingConcept: '', 
      subjectFeature: '', 
      psychology: '', 
      problemSolve: '', 
      raw: error.message 
    };
    
    console.log('返回fallback结果:', JSON.stringify(fallbackResult, null, 2));
    console.log('=== 家长辅导支持 - 处理完成（失败） ===\n');
    
    return fallbackResult;
  }
}

function printImageBase64Short(imageBase64) {
  if (!imageBase64) return '';
  return imageBase64.slice(0, 50) + '...' + imageBase64.slice(-50) + ` (length: ${imageBase64.length})`;
}

async function ocrImage({ imageBase64 }) {
  const OCR_API_KEY = process.env.OCR_API_KEY || process.env.OPENAI_API_KEY;
  const OCR_API_ENDPOINT = process.env.OCR_API_ENDPOINT || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
  const OCR_MODEL = process.env.OCR_MODEL || 'qwen-vl-max';

  if (!OCR_API_KEY) {
    return { text: '（OCR AI未配置，无法识别）' };
  }
  if (!imageBase64 || !imageBase64.startsWith('data:image/')) {
    throw new Error('图片base64格式不正确');
  }
  // 日志优化：只打印前后50字符和长度
  console.log('收到图片base64:', printImageBase64Short(imageBase64));
  const prompt = '请识别这张图片中的作业题目内容，返回纯文本，不要有多余说明。';
  try {
    const body = {
      model: OCR_MODEL,
      input: {
        messages: [
          {
            role: 'user',
            content: [
              { image: imageBase64 },
              { text: prompt }
            ]
          }
        ]
      }
    };
    const response = await axios.post(
      OCR_API_ENDPOINT,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OCR_API_KEY}`
        }
      }
    );
    let content = response.data.choices?.[0]?.message?.content || response.data.output || '';
    console.log('[OCR调试] AI原始返回content:', content);
    if (typeof content !== 'string') {
      if (content && typeof content.text === 'string') {
        console.log('[OCR调试] content为对象，存在text字段，取其值');
        content = content.text;
      } else {
        console.log('[OCR调试] content为对象，无text字段，转为JSON字符串');
        content = JSON.stringify(content);
      }
    } else {
      console.log('[OCR调试] content为字符串，直接使用');
    }
    console.log('[OCR调试] 最终返回text内容:', content);
    return { text: content };
  } catch (err) {
    console.error('OCR AI接口调用失败:', err);
    if (err.response) {
      // 只打印关键信息，避免日志污染
      const { code, message, request_id } = err.response.data || {};
      console.error('OCR AI接口返回:', { code, message, request_id });
    }
    throw err;
  }
}

/**
 * 多模态图片+文本作业题目分析
 * @param {Object} param0 { imageBase64, questionText, subject, user }
 * @returns {Promise<Object>} 结构化AI分析与辅导结果
 */
async function analyzeHomeworkWithImage({ imageBase64, questionText, subject, user }) {
  const OCR_API_KEY = process.env.OCR_API_KEY || process.env.OPENAI_API_KEY;
  const OCR_API_ENDPOINT = process.env.OCR_API_ENDPOINT || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
  const OCR_MODEL = process.env.OCR_MODEL || 'qwen-vl-max';
  
  console.log('\n=== 开始多模态分析 ===');
  console.log('1. 配置信息:');
  console.log('- API端点:', OCR_API_ENDPOINT);
  console.log('- 使用模型:', OCR_MODEL);
  console.log('- API密钥状态:', OCR_API_KEY ? '已配置' : '未配置');
  
  if (!OCR_API_KEY) {
    console.log('错误: OCR AI未配置，无法识别');
    return { subject: subject || '未知', type: '', difficulty: '', keyInfo: [], guidance: {}, error: '（OCR AI未配置，无法识别）' };
  }
  
  if (!imageBase64 || !imageBase64.startsWith('data:image/')) {
    console.log('错误: 图片base64格式不正确');
    throw new Error('图片base64格式不正确');
  }
  
  console.log('\n2. 输入信息:');
  console.log('- 图片base64长度:', imageBase64.length);
  console.log('- 图片base64前缀:', imageBase64.substring(0, 50) + '...');
  console.log('- 文本提示:', questionText || '默认提示');
  console.log('- 指定学科:', subject || '自动识别');
  
  const prompt = questionText && questionText.trim() ? questionText.trim() : '请分析这道图片题目，输出结构化JSON（含学科、题型、难度、关键信息、分学科guidance等），不要有多余说明。';
  
  try {
    const body = {
      model: OCR_MODEL,
      input: {
        messages: [
          {
            role: 'user',
            content: [
              { image: imageBase64 },
              { text: prompt }
            ]
          }
        ]
      }
    };
    
    const response = await axios.post(
      OCR_API_ENDPOINT,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OCR_API_KEY}`
        }
      }
    );
    
    console.log('\n4. AI原始返回:');
    console.log('- 完整响应:', JSON.stringify(response.data, null, 2));
    
    let content = '';
    if (response.data.output?.choices?.[0]?.message?.content) {
      const contentArray = response.data.output.choices[0].message.content;
      if (Array.isArray(contentArray)) {
        const textObj = contentArray.find(item => item.text);
        if (textObj) {
          content = textObj.text;
        }
      }
    }
    
    console.log('\n5. 提取的content:');
    console.log('- 类型:', typeof content);
    console.log('- 内容:', content);
    
    if (typeof content === 'string') {
      console.log('\n6. 处理字符串content:');
      // 移除可能的markdown代码块标记
      const cleanContent = content.replace(/```json|```/g, '').trim();
      console.log('- 清理后的内容:', cleanContent);
      
      try {
        const parsed = JSON.parse(cleanContent);
        console.log('\n7. JSON解析结果:');
        console.log('- 解析成功，内容:', JSON.stringify(parsed, null, 2));
        
        // 修正LaTeX格式
        const fixLatexFormat = (obj) => {
          if (!obj || typeof obj !== 'object') return obj;
          
          const processed = {};
          for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
              // 先将所有多余的斜杠归一为单斜杠（如 \\\\frac -> \\frac -> \frac）
              let fixed = value.replace(/\\+/g, '\\');
              // 将\(...\)格式转换为$...$格式
              fixed = fixed.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
              // 检查是否包含LaTeX公式但没有数学符号包围
              if (fixed.match(/\\frac|\\sqrt|\\sum|\\int|\\lim|\\sin|\\cos|\\tan|\\log/)) {
                // 如果包含LaTeX公式但没有$包围，则添加$
                if (!fixed.includes('$')) {
                  fixed = `$${fixed}$`;
                }
              }
              processed[key] = fixed;
            } else if (Array.isArray(value)) {
              processed[key] = value.map(item => {
                if (typeof item === 'string') {
                  let fixed = item.replace(/\\+/g, '\\');
                  // 将\(...\)格式转换为$...$格式
                  fixed = fixed.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
                  if (fixed.match(/\\frac|\\sqrt|\\sum|\\int|\\lim|\\sin|\\cos|\\tan|\\log/)) {
                    if (!fixed.includes('$')) {
                      fixed = `$${fixed}$`;
                    }
                  }
                  return fixed;
                }
                return item;
              });
            } else if (typeof value === 'object' && value !== null) {
              processed[key] = fixLatexFormat(value);
            } else {
              processed[key] = value;
            }
          }
          return processed;
        };
        
        // 修正LaTeX格式
        const fixedParsed = fixLatexFormat(parsed);
        
        // 确保返回的数据结构与前端期望的一致
        const result = {
          学科: fixedParsed.学科 || '',
          题型: fixedParsed.题型 || '',
          难度: fixedParsed.难度 || '',
          关键信息: fixedParsed.关键信息 || [],
          '分学科guidance': fixedParsed['分学科guidance'] || {}
        };
        
        console.log('\n8. 最终返回结果:');
        console.log('- 处理后的数据:', JSON.stringify(result, null, 2));
        return result;
        
      } catch (e) {
        console.error('\n7. JSON解析失败:');
        console.error('- 错误信息:', e.message);
        console.error('- 错误堆栈:', e.stack);
        return { 
          学科: subject || '', 
          题型: '', 
          难度: '', 
          关键信息: [], 
          '分学科guidance': {}, 
          raw: content 
        };
      }
    } else {
      console.log('\n6. 未知content类型:');
      console.log('- 类型:', typeof content);
      console.log('- 内容:', content);
      return { 
        学科: subject || '', 
        题型: '', 
        难度: '', 
        关键信息: [], 
        '分学科guidance': {}, 
        raw: content 
      };
    }
  } catch (err) {
    console.error('\n=== 错误处理 ===');
    console.error('1. 错误类型:', err.name);
    console.error('2. 错误信息:', err.message);
    console.error('3. 错误堆栈:', err.stack);
    
    if (err.response) {
      console.error('4. API错误响应:');
      console.error('- 状态码:', err.response.status);
      console.error('- 错误数据:', JSON.stringify(err.response.data, null, 2));
    }
    
    throw err;
  } finally {
    console.log('\n=== 多模态分析结束 ===\n');
  }
}

module.exports = {
  generateParentAdvice,
  analyzeGoal,
  analyzePath,
  analyzeHomework,
  progressiveGuidance,
  parentSupport,
  ocrImage,
  analyzeHomeworkWithImage,
}; 