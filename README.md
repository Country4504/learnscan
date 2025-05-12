# LearnScan - 青少年学习风格诊断系统

LearnScan 是一个面向10-16岁青少年的科学化学习风格诊断与学习方法提升系统。通过科学的测评，帮助学生发现个人独特的学习风格和优势，提供有科学依据的个性化学习策略。

## 功能特点

- 科学的测评问卷（40个核心问题）
- 五大维度分析（感知偏好、信息处理方式、学习环境偏好、思维模式、时间管理倾向）
- 个性化的学习策略推荐
- 直观的数据可视化展示
- 响应式设计，支持PC和移动设备

## 技术栈

- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- Chart.js

## 本地开发

1. 克隆项目
```bash
git clone [项目地址]
cd learnscan
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 打开浏览器访问 http://localhost:3000

## 部署

本项目可以轻松部署到 Vercel 平台：

1. 将代码推送到 GitHub 仓库
2. 在 Vercel 中导入项目
3. 配置环境变量（如果需要）
4. 点击部署

## 项目结构

```
learnscan/
├── app/                # Next.js 应用目录
│   ├── page.tsx       # 首页
│   ├── test/          # 测试页面
│   ├── result/        # 结果页面
│   └── layout.tsx     # 布局组件
├── public/            # 静态资源
├── styles/           # 样式文件
└── components/       # 可复用组件
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

如有任何问题或建议，请通过以下方式联系我们：

- 项目 Issues
- 电子邮件：[联系邮箱]

## 致谢

感谢所有为本项目做出贡献的开发者。 