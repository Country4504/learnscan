# LearnScan - 青少年学习风格诊断系统

LearnScan是一个面向10-16岁青少年的科学化学习风格诊断与学习方法提升系统。通过科学的测评问卷，帮助学生发现个人独特的学习风格和优势，提供有科学依据的个性化学习策略，提升学习效率和学习体验，培养终身学习能力和自我认知。

## 主要功能

- **学习风格测评**：全面评估感知偏好、信息处理方式、学习环境偏好、思维模式和时间管理倾向五大维度
- **个性化诊断报告**：自动生成详细的分析报告，包含学习风格类型、优势和挑战
- **学习策略推荐**：提供匹配学习风格的具体学习方法建议，包括通用策略和学科特定策略
- **历史记录追踪**：保存历次测评结果，观察学习风格的变化和发展
- **AI 智能建议**：基于先进的语言模型，提供个性化的学习建议和指导

## 技术架构

- **前端**：HTML5, CSS3, JavaScript, Bootstrap 5, Chart.js
- **后端**：Node.js, Express.js
- **数据库**：MongoDB
- **模板引擎**：EJS
- **认证**：Express-session, Bcrypt
- **AI 集成**：OpenAI API
- **部署**：Docker, Nginx

## 项目结构

```
LearnScan/
│
├── public/             # 静态资源
│   ├── css/            # 样式文件
│   ├── js/             # JavaScript文件
│   └── images/         # 图片资源
│
├── src/                # 源代码
│   ├── controllers/    # 控制器
│   ├── models/         # 数据模型
│   ├── views/          # 视图模板
│   ├── utils/          # 工具函数
│   ├── middleware/     # 中间件
│   └── config/         # 配置文件
│
├── tests/              # 测试文件
├── docker/             # Docker 配置
├── server.js           # 服务器入口文件
├── package.json        # 项目依赖
└── README.md           # 项目说明
```

## 安装和运行


1. 安装依赖

```bash
npm install
```

2. 配置环境变量

创建 `.env` 文件并设置以下变量：

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/learnscan
SESSION_SECRET=yoursecretkey
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key
```

3. 启动服务器

```bash
npm run dev  # 开发模式
npm start    # 生产模式
```

4. 使用 Docker 运行（可选）

```bash
docker-compose up -d
```

5. 访问应用

打开浏览器访问 `http://localhost:3000`

## 学习风格诊断原理

系统基于教育心理学和认知科学研究，通过40个核心问题，评估五个主要维度：

1. **感知偏好**：视觉型、听觉型、动觉型
2. **信息处理方式**：系统性、跳跃性
3. **学习环境偏好**：结构化、灵活型
4. **思维模式**：分析型、创造型
5. **时间管理倾向**：计划型、适应型

## 使用场景

- 学生自主了解学习风格，改进学习方法
- 家长了解孩子学习特点，提供针对性指导
- 教师根据学生学习风格调整教学方法
- 教育机构提供个性化学习咨询服务
- 心理咨询师进行学习能力评估