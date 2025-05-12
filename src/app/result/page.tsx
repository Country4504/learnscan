'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import Link from 'next/link';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface ResultData {
  dimensions: {
    name: string;
    score: number;
  }[];
  learningStyle: string;
  description: string;
  recommendations: string[];
  strengths: string[];
  challenges: string[];
}

interface Answer {
  [key: number]: number;
}

const calculateResult = (answers: Answer): ResultData => {
  // 初始化各维度的分数
  // 感知偏好
  let visualScore = 0;
  let auditoryScore = 0;
  let kinestheticScore = 0;
  
  // 信息处理方式
  let systematicScore = 0;
  let holisticScore = 0;
  
  // 学习环境偏好
  let structuredEnvScore = 0;
  let flexibleEnvScore = 0;
  
  // 思维模式
  let analyticalScore = 0;
  let creativeScore = 0;
  
  // 时间管理
  let plannedScore = 0;
  let adaptiveScore = 0;
  
  // 处理感知偏好题目 (Q1-3)
  for (let i = 1; i <= 3; i++) {
    if (answers[i] === 0) visualScore += 100;
    else if (answers[i] === 1) auditoryScore += 100;
    else if (answers[i] === 2) kinestheticScore += 100;
    else if (answers[i] === 3) {
      visualScore += 33;
      auditoryScore += 33;
      kinestheticScore += 33;
    }
  }
  
  // 处理信息处理方式题目 (Q4-5)
  for (let i = 4; i <= 5; i++) {
    if (answers[i] === 0) systematicScore += 100;
    else if (answers[i] === 1) holisticScore += 100;
    else if (answers[i] === 2) holisticScore += 70;
    else if (answers[i] === 3) {
      systematicScore += 50;
      holisticScore += 50;
    }
  }
  
  // 处理学习环境偏好题目 (Q6-7)
  for (let i = 6; i <= 7; i++) {
    if (answers[i] === 0) structuredEnvScore += 100;
    else if (answers[i] === 1) structuredEnvScore += 70;
    else if (answers[i] === 2) flexibleEnvScore += 100;
    else if (answers[i] === 3) {
      structuredEnvScore += 50;
      flexibleEnvScore += 50;
    }
  }
  
  // 处理思维模式题目 (Q8-9)
  for (let i = 8; i <= 9; i++) {
    if (answers[i] === 0) analyticalScore += 100;
    else if (answers[i] === 1) creativeScore += 100;
    else if (answers[i] === 2) {
      analyticalScore += 30;
      creativeScore += 70;
    }
    else if (answers[i] === 3) {
      analyticalScore += 50;
      creativeScore += 50;
    }
  }
  
  // 处理时间管理题目 (Q10-12)
  for (let i = 10; i <= 12; i++) {
    if (answers[i] === 0) plannedScore += 100;
    else if (answers[i] === 1) {
      plannedScore += 70;
      adaptiveScore += 30;
    }
    else if (answers[i] === 2) adaptiveScore += 100;
    else if (answers[i] === 3) {
      plannedScore += 40;
      adaptiveScore += 60;
    }
  }
  
  // 计算平均值
  visualScore = Math.round(visualScore / 3);
  auditoryScore = Math.round(auditoryScore / 3);
  kinestheticScore = Math.round(kinestheticScore / 3);
  systematicScore = Math.round(systematicScore / 2);
  holisticScore = Math.round(holisticScore / 2);
  structuredEnvScore = Math.round(structuredEnvScore / 2);
  flexibleEnvScore = Math.round(flexibleEnvScore / 2);
  analyticalScore = Math.round(analyticalScore / 2);
  creativeScore = Math.round(creativeScore / 2);
  plannedScore = Math.round(plannedScore / 3);
  adaptiveScore = Math.round(adaptiveScore / 3);
  
  // 确定主导学习风格类型
  const perceptionMax = Math.max(visualScore, auditoryScore, kinestheticScore);
  let dominantPerception = '';
  if (perceptionMax === visualScore) dominantPerception = '视觉型';
  else if (perceptionMax === auditoryScore) dominantPerception = '听觉型';
  else dominantPerception = '动觉型';
  
  const processingStyle = systematicScore > holisticScore ? '系统性' : '跳跃性';
  const environmentStyle = structuredEnvScore > flexibleEnvScore ? '结构化' : '灵活型';
  const thinkingStyle = analyticalScore > creativeScore ? '分析型' : '创造型';
  const timeStyle = plannedScore > adaptiveScore ? '计划型' : '适应型';
  
  // 结合所有类型生成学习风格描述
  const learningStyle = `${dominantPerception}-${processingStyle}-${thinkingStyle}学习者`;
  
  let description = `你主要是一个${dominantPerception}学习者，倾向于${processingStyle}地处理信息。`;
  description += `你在${environmentStyle}的环境中学习效果更好，思维模式倾向于${thinkingStyle}，`;
  description += `在时间管理方面，你更偏向于${timeStyle}的方式。这种组合使你在学习时有独特的优势和特点。`;
  
  // 生成学习优势列表
  const strengths = [];
  
  if (dominantPerception === '视觉型') {
    strengths.push('擅长从图表、图像和文字材料中学习');
    strengths.push('有较强的空间想象能力');
  } else if (dominantPerception === '听觉型') {
    strengths.push('擅长通过听讲和讨论来学习');
    strengths.push('善于记忆口头信息和指示');
  } else {
    strengths.push('通过实践和动手操作学习效果最佳');
    strengths.push('对实际体验有很强的记忆力');
  }
  
  if (processingStyle === '系统性') {
    strengths.push('善于按照逻辑顺序学习复杂内容');
    strengths.push('擅长组织和分析信息');
  } else {
    strengths.push('能快速把握整体概念');
    strengths.push('善于在不同概念间建立联系');
  }
  
  if (thinkingStyle === '分析型') {
    strengths.push('擅长逻辑分析和解决问题');
    strengths.push('注重效率和精确性');
  } else {
    strengths.push('富有创造力和想象力');
    strengths.push('能提出创新的解决方案');
  }
  
  // 生成挑战列表
  const challenges = [];
  
  if (dominantPerception === '视觉型') {
    challenges.push('可能在纯听觉环境中学习效率降低');
    challenges.push('需要将听到的信息转化为视觉形式');
  } else if (dominantPerception === '听觉型') {
    challenges.push('在嘈杂环境中可能难以集中注意力');
    challenges.push('可能需要将视觉信息转化为听觉形式');
  } else {
    challenges.push('在传统静态学习环境中可能感到不耐烦');
    challenges.push('长时间静坐学习可能感到不适');
  }
  
  if (environmentStyle === '结构化') {
    challenges.push('在混乱或频繁变化的环境中可能感到不适');
    challenges.push('可能对意外的变动感到困扰');
  } else {
    challenges.push('可能需要更多的外部激励来保持专注');
    challenges.push('在高度结构化的环境中可能感到受限');
  }
  
  if (timeStyle === '计划型') {
    challenges.push('计划变更可能导致挫折感');
    challenges.push('可能过度计划而缺乏灵活性');
  } else {
    challenges.push('可能倾向于拖延任务');
    challenges.push('在需要长期持续努力的项目中可能遇到困难');
  }
  
  // 生成学习建议
  const recommendations = [];
  
  if (dominantPerception === '视觉型') {
    recommendations.push('使用思维导图和图表整理学习内容');
    recommendations.push('观看教学视频或制作可视化笔记');
    recommendations.push('使用颜色编码系统标记不同类型的信息');
  } else if (dominantPerception === '听觉型') {
    recommendations.push('录音并回听重要内容');
    recommendations.push('与他人讨论或大声朗读学习材料');
    recommendations.push('使用韵律和节奏辅助记忆');
  } else {
    recommendations.push('通过实验和动手操作加深理解');
    recommendations.push('在学习时适当走动或使用实物模型');
    recommendations.push('尝试角色扮演或模拟活动');
  }
  
  if (processingStyle === '系统性') {
    recommendations.push('创建详细的学习计划和步骤');
    recommendations.push('按顺序逐步学习复杂内容');
  } else {
    recommendations.push('先了解整体概念再填充细节');
    recommendations.push('寻找不同概念之间的联系');
  }
  
  if (thinkingStyle === '分析型') {
    recommendations.push('使用逻辑分析和比较对照的方法');
    recommendations.push('创建结构化的笔记和图表');
  } else {
    recommendations.push('尝试创意思考和跨学科联系');
    recommendations.push('使用类比和视觉化方法理解概念');
  }
  
  if (timeStyle === '计划型') {
    recommendations.push('使用日程表和任务清单管理学习');
    recommendations.push('将大任务分解为小步骤');
  } else {
    recommendations.push('利用高能量时段进行重要学习任务');
    recommendations.push('设置短期目标保持动力');
  }
  
  return {
    dimensions: [
      { name: '视觉型', score: visualScore },
      { name: '听觉型', score: auditoryScore },
      { name: '动觉型', score: kinestheticScore },
      { name: '系统性', score: systematicScore },
      { name: '跳跃性', score: holisticScore },
      { name: '结构化', score: structuredEnvScore },
      { name: '灵活型', score: flexibleEnvScore },
      { name: '分析型', score: analyticalScore },
      { name: '创造型', score: creativeScore },
      { name: '计划型', score: plannedScore },
      { name: '适应型', score: adaptiveScore },
    ],
    learningStyle,
    description,
    recommendations,
    strengths,
    challenges,
  };
};

export default function Result() {
  const [result, setResult] = useState<ResultData | null>(null);
  
  useEffect(() => {
    // 从localStorage获取测试答案
    const savedAnswers = localStorage.getItem('testAnswers');
    
    if (savedAnswers) {
      const answers = JSON.parse(savedAnswers);
      const calculatedResult = calculateResult(answers);
      setResult(calculatedResult);
    }
  }, []);
  
  if (!result) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-6">加载中...</p>
          <Link href="/test" className="text-blue-600 hover:underline">
            没有测试数据？返回测试页面
          </Link>
        </div>
      </main>
    );
  }

  // 以主要维度为主的雷达图数据
  const mainChartData = {
    labels: ['视觉型', '听觉型', '动觉型', '系统性', '跳跃性'],
    datasets: [
      {
        label: '学习风格主要维度',
        data: [
          result.dimensions.find(d => d.name === '视觉型')?.score || 0,
          result.dimensions.find(d => d.name === '听觉型')?.score || 0,
          result.dimensions.find(d => d.name === '动觉型')?.score || 0,
          result.dimensions.find(d => d.name === '系统性')?.score || 0,
          result.dimensions.find(d => d.name === '跳跃性')?.score || 0,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
      },
    ],
  };

  // 其他维度的雷达图数据
  const secondaryChartData = {
    labels: ['结构化', '灵活型', '分析型', '创造型', '计划型', '适应型'],
    datasets: [
      {
        label: '学习风格次要维度',
        data: [
          result.dimensions.find(d => d.name === '结构化')?.score || 0,
          result.dimensions.find(d => d.name === '灵活型')?.score || 0,
          result.dimensions.find(d => d.name === '分析型')?.score || 0,
          result.dimensions.find(d => d.name === '创造型')?.score || 0,
          result.dimensions.find(d => d.name === '计划型')?.score || 0,
          result.dimensions.find(d => d.name === '适应型')?.score || 0,
        ],
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(16, 185, 129, 1)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          backdropColor: 'transparent'
        }
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 11
          }
        }
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              你的学习风格分析报告
            </h1>

            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                学习风格类型
              </h2>
              <p className="text-xl text-blue-600 font-medium mb-4">
                {result.learningStyle}
              </p>
              <p className="text-gray-600">
                {result.description}
              </p>
            </div>

            <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 self-start">
                  感知与处理维度
                </h2>
                <div className="w-full max-w-[300px] h-[300px] flex items-center justify-center">
                  <Radar data={mainChartData} options={chartOptions} />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 self-start">
                  环境、思维与时间维度
                </h2>
                <div className="w-full max-w-[300px] h-[300px] flex items-center justify-center">
                  <Radar data={secondaryChartData} options={chartOptions} />
                </div>
              </div>
            </div>
            
            <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  学习优势
                </h2>
                <ul className="space-y-3">
                  {result.strengths.map((strength, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-gray-600">{strength}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  学习挑战
                </h2>
                <ul className="space-y-3">
                  {result.challenges.map((challenge, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </span>
                      <span className="text-gray-600">{challenge}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                个性化学习建议
              </h2>
              <ul className="space-y-4">
                {result.recommendations.map((recommendation, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start"
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <span className="text-gray-600">{recommendation}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div className="text-center mt-8">
              <Link
                href="/test"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
              >
                再次测试
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 