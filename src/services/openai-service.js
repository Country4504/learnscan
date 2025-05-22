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
    return getDefaultAdvice();
  }

  const maxRetries = 3;
  let retryCount = 0;
  let lastError = null;

  while (retryCount < maxRetries) {
    try {
      // 构建提示词
      const prompt = generatePrompt(report);
      
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
          max_tokens: 2000,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
          // OpenRouter特定参数
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

      // 解析建议
      try {
        const advice = parseAdvice(content);
        console.log('成功生成AI建议');
        return advice;
      } catch (parseError) {
        console.error('解析建议失败:', parseError);
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
        return getDefaultAdvice();
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
  return getDefaultAdvice();
}

/**
 * 生成提示词
 * @param {Object} report - 学习报告对象
 * @returns {String} - 完整提示词
 */
function generatePrompt(report) {
  return `你是一位专业的教育心理学家，需要基于以下学习风格测评结果为家长提供专业指导建议。请严格按照指定的JSON格式返回建议内容。

学生信息:
主导学习类型: ${report.learningTypeCode} (${report.isMixedType ? '混合型' : '主导型'})
学习类型描述: ${report.learningTypeDescription}

测评维度得分:
1. 感知偏好 (${report.dominantType.perceptionType})
   - 视觉型: ${report.scores.perception.visual}%
   - 听觉型: ${report.scores.perception.auditory}%
   - 动觉型: ${report.scores.perception.kinesthetic}%

2. 信息处理 (${report.dominantType.processingType})
   - 系统性: ${report.scores.processing.systematic}%
   - 跳跃性: ${report.scores.processing.global}%

3. 学习环境 (${report.dominantType.environmentType})
   - 结构化: ${report.scores.environment.structured}%
   - 灵活型: ${report.scores.environment.flexible}%

4. 思维模式 (${report.dominantType.thinkingType})
   - 分析型: ${report.scores.thinking.analytical}%
   - 创造型: ${report.scores.thinking.creative}%

5. 时间管理 (${report.dominantType.timeManagementType})
   - 计划型: ${report.scores.timeManagement.planned}%
   - 适应型: ${report.scores.timeManagement.adaptive}%

请根据以上测评结果，为每个维度提供专业的家长指导建议。建议内容必须：
1. 针对性强，直接基于测评数据
2. 具体可操作，避免笼统表述
3. 每条建议控制在100字以内
4. 使用温和专业的语气
5. 严格按照以下JSON格式返回：

{
  "感知偏好": {
    "培养建议": "...",
    "学习建议": "...",
    "家庭活动建议": "...",
    "家庭关系建议": "...",
    "沟通建议": "..."
  },
  "信息处理方式": {
    "培养建议": "...",
    "学习建议": "...",
    "家庭活动建议": "...",
    "家庭关系建议": "...",
    "沟通建议": "..."
  },
  "学习环境偏好": {
    "培养建议": "...",
    "学习建议": "...",
    "家庭活动建议": "...",
    "家庭关系建议": "...",
    "沟通建议": "..."
  },
  "思维模式": {
    "培养建议": "...",
    "学习建议": "...",
    "家庭活动建议": "...",
    "家庭关系建议": "...",
    "沟通建议": "..."
  },
  "时间管理倾向": {
    "培养建议": "...",
    "学习建议": "...",
    "家庭活动建议": "...",
    "家庭关系建议": "...",
    "沟通建议": "..."
  }
}

注意：
1. 必须严格按照上述JSON格式返回
2. 不要添加任何额外的说明文字
3. 确保JSON格式正确，可以被正常解析
4. 所有建议必须基于测评数据，具有针对性
5. 使用中文回复`;
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
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.substring(7);
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.substring(0, cleanContent.length - 3);
    }
    
    // 尝试解析JSON
    let parsedJson;
    try {
      parsedJson = JSON.parse(cleanContent);
    } catch (jsonError) {
      console.error('JSON解析失败:', jsonError);
      console.log('原始内容:', cleanContent);
      throw new Error('AI回复格式错误，无法解析为JSON');
    }
    
    // 验证JSON结构
    const requiredDimensions = ['感知偏好', '信息处理方式', '学习环境偏好', '思维模式', '时间管理倾向'];
    const requiredFields = ['培养建议', '学习建议', '家庭活动建议', '家庭关系建议', '沟通建议'];
    
    // 检查所有必需的维度
    for (const dimension of requiredDimensions) {
      if (!parsedJson[dimension]) {
        console.error(`缺少维度: ${dimension}`);
        throw new Error(`AI回复缺少必需的维度: ${dimension}`);
      }
      
      // 检查每个维度的必需字段
      for (const field of requiredFields) {
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
    throw error; // 向上传递错误，由调用者处理
  }
}

/**
 * 获取默认建议(当API不可用时)
 * @param {Object} report - 学习报告对象
 * @returns {Object} - 默认建议
 */
function getDefaultAdvice(report) {
  // 基本建议模板
  return {
    perception: {
      title: "感知偏好建议",
      summary: "这是一个默认的感知偏好总体建议，建议您尽快联系技术支持获取个性化建议。",
      suggestions: {
        cultivation: "鼓励孩子尝试多种感官学习方式，培养全面的感知能力。",
        learning: "结合视觉、听觉和动觉等多种学习方法。",
        activities: "参与丰富多样的家庭活动，锻炼不同的感知能力。",
        relationship: "理解并尊重孩子的感知偏好特点。",
        communication: "采用多样化的沟通方式。"
      }
    },
    processing: {
      title: "信息处理建议",
      summary: "这是一个默认的信息处理总体建议，建议您尽快联系技术支持获取个性化建议。",
      suggestions: {
        cultivation: "培养多角度思考问题的能力。",
        learning: "采用适合的学习策略和方法。",
        activities: "参与促进思维发展的家庭活动。",
        relationship: "尊重孩子的思维方式。",
        communication: "保持开放和耐心的沟通态度。"
      }
    },
    environment: {
      title: "学习环境建议",
      summary: "这是一个默认的学习环境总体建议，建议您尽快联系技术支持获取个性化建议。",
      suggestions: {
        cultivation: "培养适应不同学习环境的能力。",
        learning: "创造适合的学习环境。",
        activities: "在不同环境中开展家庭活动。",
        relationship: "共同营造良好的学习氛围。",
        communication: "选择合适的环境进行沟通。"
      }
    },
    thinking: {
      title: "思维模式建议",
      summary: "这是一个默认的思维模式总体建议，建议您尽快联系技术支持获取个性化建议。",
      suggestions: {
        cultivation: "培养多元化的思维方式。",
        learning: "采用适合的思维工具和方法。",
        activities: "参与促进思维发展的活动。",
        relationship: "欣赏不同的思维方式。",
        communication: "采用适合的沟通策略。"
      }
    },
    timeManagement: {
      title: "时间管理建议",
      summary: "这是一个默认的时间管理总体建议，建议您尽快联系技术支持获取个性化建议。",
      suggestions: {
        cultivation: "培养时间管理意识和能力。",
        learning: "建立合理的学习计划。",
        activities: "安排平衡的家庭活动时间。",
        relationship: "理解并尊重时间管理特点。",
        communication: "就时间管理进行有效沟通。"
      }
    }
  };
}

module.exports = {
  generateParentAdvice
}; 