import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LearnScan - 青少年学习风格诊断系统',
  description: '发现你的学习超能力，找到最适合你的学习方法',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <a href="/" className="text-2xl font-bold text-blue-600">
                LearnScan
              </a>
              <div className="space-x-6">
                <a href="/" className="text-gray-600 hover:text-blue-600">
                  首页
                </a>
                <a href="/test" className="text-gray-600 hover:text-blue-600">
                  开始测试
                </a>
              </div>
            </div>
          </div>
        </nav>

        {children}

        <footer className="bg-gray-50 border-t">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-gray-600">
              <p>© 2024 LearnScan. 保留所有权利。</p>
              <p className="mt-2">专为10-16岁青少年设计的学习风格诊断系统</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
} 