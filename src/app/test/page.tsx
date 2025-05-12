'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Question {
  id: number;
  text: string;
  options: string[];
  dimension?: string; // 添加维度标记，方便后续分析
}

const questions: Question[] = [
  // 感知偏好维度
  {
    id: 1,
    text: "当你学习新知识时，你更容易通过哪种方式理解？",
    options: [
      "看到图表、图片或文字",
      "听老师讲解或与他人讨论",
      "亲自动手操作或实践",
      "以上方式都差不多"
    ],
    dimension: "感知偏好"
  },
  {
    id: 2,
    text: "你最喜欢的课堂活动是：",
    options: [
      "阅读材料或观看教学视频",
      "听讲座或小组讨论",
      "实验、角色扮演或实地考察",
      "各种活动都喜欢"
    ],
    dimension: "感知偏好"
  },
  {
    id: 3,
    text: "当你需要记住一个电话号码时，你通常会：",
    options: [
      "把数字写下来或在脑中想象数字外观",
      "反复念出来或用节奏记忆",
      "在键盘或空中敲打这些数字",
      "结合以上方法"
    ],
    dimension: "感知偏好"
  },
  // 信息处理方式维度
  {
    id: 4,
    text: "解决问题时，你通常会：",
    options: [
      "按照逻辑步骤一步步分析",
      "跳过细节直接寻找整体解决方案",
      "尝试多种可能的方法",
      "视问题性质采用不同方法"
    ],
    dimension: "信息处理"
  },
  {
    id: 5,
    text: "学习新主题时，你更喜欢：",
    options: [
      "从基础知识开始，逐步构建完整理解",
      "先了解整体框架，再填补细节",
      "跟随自己的兴趣点探索不同方面",
      "根据主题难度选择不同方法"
    ],
    dimension: "信息处理"
  },
  // 学习环境偏好维度
  {
    id: 6,
    text: "学习时你偏好的环境是：",
    options: [
      "安静无干扰的地方",
      "有轻柔背景音乐或环境音",
      "有一定活动或讨论的环境",
      "可以根据任务变换环境"
    ],
    dimension: "学习环境"
  },
  {
    id: 7,
    text: "学习效率最高时，你通常：",
    options: [
      "独自一人专注学习",
      "在他人在场但不交流的环境中",
      "与同学或朋友一起学习讨论",
      "在不同场景下都能有效学习"
    ],
    dimension: "学习环境"
  },
  // 思维模式维度
  {
    id: 8,
    text: "面对问题时，你通常：",
    options: [
      "分析各种可能性，寻找最合理解决方案",
      "寻找创新独特的解决思路",
      "参考以往经验和成功案例",
      "结合分析和创意思考"
    ],
    dimension: "思维模式"
  },
  {
    id: 9,
    text: "你更喜欢的学习任务是：",
    options: [
      "有明确答案和解决方法的问题",
      "开放性问题，可以有多种解决方案",
      "结合理论和实践的综合任务",
      "根据学科不同有不同偏好"
    ],
    dimension: "思维模式"
  },
  // 时间管理倾向维度
  {
    id: 10,
    text: "管理学习任务时，你通常：",
    options: [
      "制定详细计划并严格执行",
      "有大致计划但保持灵活",
      "根据心情和优先级临时决定",
      "根据任务难度和重要性调整方法"
    ],
    dimension: "时间管理"
  },
  {
    id: 11,
    text: "面对大型作业或项目，你会：",
    options: [
      "提前开始，分解成小任务逐步完成",
      "在截止日期前集中时间完成",
      "等有灵感或动力时再开始",
      "根据项目类型采用不同策略"
    ],
    dimension: "时间管理"
  },
  {
    id: 12,
    text: "完成作业的方式，你更倾向于：",
    options: [
      "一次只专注一项任务直到完成",
      "在不同任务间切换以保持兴趣",
      "先完成简单或有趣的部分",
      "根据截止日期和难度安排"
    ],
    dimension: "时间管理"
  }
];

export default function Test() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleAnswer = (questionId: number, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // 提交答案并跳转到结果页面
      console.log('提交答案:', answers);
      
      // 将答案存储在localStorage中，以便结果页面可以使用
      localStorage.setItem('testAnswers', JSON.stringify({
        ...answers,
        [questionId]: optionIndex
      }));
      
      // 跳转到结果页面
      router.push('/result');
    }
  };

  // 计算当前进度
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                问题 {currentQuestion + 1} / {questions.length}
              </h2>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {questions[currentQuestion].dimension && (
                <p className="text-sm text-gray-500 mt-2">
                  维度: {questions[currentQuestion].dimension}
                </p>
              )}
            </div>

            <h3 className="text-xl font-semibold text-gray-700 mb-6">
              {questions[currentQuestion].text}
            </h3>

            <div className="space-y-4">
              {questions[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(questions[currentQuestion].id, index)}
                  className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200"
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 