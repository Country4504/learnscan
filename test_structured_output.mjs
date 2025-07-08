import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import fetch from 'node-fetch';

// 1. 定义数据结构
const PersonSchema = z.object({
  name: z.string().describe('名称'),
  age: z.number().describe('年龄'),
  description: z.string().describe('描述'),
  hobbies: z.array(z.string()).describe('爱好')
});

// 2. 生成JSON Schema并构造prompt
const jsonSchema = zodToJsonSchema(PersonSchema);
const prompt = `请生成一个虚拟人物信息，输出应格式化为符合以下 JSON Schema 的 JSON 实例。\n\n\`\`\`json\n${JSON.stringify(jsonSchema, null, 2)}\n\`\`\`\n请只输出标准JSON，不要加任何说明或markdown代码块。`;
console.log('Prompt示例：');
console.log(prompt);

// 3. 调用API获取AI输出
async function main() {
  // 读取API配置
  const API_KEY = 'sk-734acb0969e047aba339b99fdae74a6d';
  const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
  const MODEL = 'qwen-max';

  if (!API_KEY) {
    console.error('请设置OPENAI_API_KEY环境变量');
    return;
  }

  // 构造请求体
  const body = {
    model: MODEL,
    messages: [
      { role: 'system', content: '你是一位专业的结构化数据生成AI。' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2,
    max_tokens: 512
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(body)
    });
    console.log('HTTP状态码:', response.status);
    const rawText = await response.text();
    console.log('\nAPI原始返回内容：', rawText);
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.error('返回内容不是有效JSON，无法解析。');
      return;
    }
    // 兼容不同API返回格式
    let ai_output = '';
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      ai_output = data.choices[0].message.content;
    } else if (data.output && data.output.choices && data.output.choices[0] && data.output.choices[0].message && data.output.choices[0].message.content) {
      ai_output = data.output.choices[0].message.content;
    } else {
      console.error('API返回格式无法识别:', data);
      return;
    }
    console.log('\nAI返回内容：');
    console.log(ai_output);

    // 只提取JSON部分
    let jsonStr = ai_output;
    if (jsonStr.includes('```')) {
      jsonStr = jsonStr.split('```')[1];
      if (jsonStr.startsWith('json')) jsonStr = jsonStr.slice(4);
    }
    jsonStr = jsonStr.trim();

    // 4. 用zod解析和校验
    try {
      const person = PersonSchema.parse(JSON.parse(jsonStr));
      console.log('\n解析和校验成功，结构化数据如下：');
      console.log(person);
    } catch (e) {
      console.log('\n数据校验失败：');
      console.log(e.errors || e);
    }
  } catch (err) {
    console.error('API请求失败:', err);
  }
}

main(); 