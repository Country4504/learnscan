'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6">
            LearnScan
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            发现你的学习超能力
          </p>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            通过科学的测评，了解你的学习风格，找到最适合你的学习方法。
            专为10-16岁青少年设计，帮助你提升学习效率，培养终身学习能力。
          </p>
          <Link
            href="/test"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
          >
            开始测试
          </Link>
        </motion.div>
      </div>
    </main>
  );
} 