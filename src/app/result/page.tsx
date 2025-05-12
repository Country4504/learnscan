'use client';

import React from 'react';
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
}

const mockResult: ResultData = {
  dimensions: [
    { name: '视觉型', score: 75 },
    { name: '听觉型', score: 60 },
    { name: '动觉型', score: 85 },
    { name: '系统性', score: 70 },
    { name: '跳跃性', score: 65 },
  ],
  learningStyle: '动觉-系统型学习者',
  description: '你是一个善于通过实践和动手操作来学习的学习者。你倾向于系统性地处理信息，喜欢有结构的学习环境。',
  recommendations: [
    '多参与实验和实践活动',
    '使用思维导图整理知识',
    '尝试将抽象概念转化为具体操作',
    '建立清晰的学习计划和时间表',
  ],
};

export default function Result() {
  const chartData = {
    labels: mockResult.dimensions.map(d => d.name),
    datasets: [
      {
        label: '学习风格维度得分',
        data: mockResult.dimensions.map(d => d.score),
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

  const chartOptions = {
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
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
                {mockResult.learningStyle}
              </p>
              <p className="text-gray-600">
                {mockResult.description}
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                学习风格维度分析
              </h2>
              <div className="w-full max-w-md mx-auto">
                <Radar data={chartData} options={chartOptions} />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                个性化学习建议
              </h2>
              <ul className="space-y-4">
                {mockResult.recommendations.map((recommendation, index) => (
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
          </div>
        </motion.div>
      </div>
    </main>
  );
} 