FROM node

# 安装Puppeteer所需的系统依赖
RUN apt-get update && apt-get install -y \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libxtst6 \
    libnss3 \
    libcups2 \
    libxss1 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgbm1 \
    && rm -rf /var/lib/apt/lists/*

# 创建应用目录
WORKDIR /usr/src/app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖，包括开发依赖
RUN npm install

# 设置开发环境
ENV NODE_ENV=development
ENV PORT=80

# 全局安装nodemon
RUN npm install -g nodemon

# 如果是生产环境，可以使用以下命令
# RUN npm ci --only=production

# 复制应用程序代码
COPY . .

# 暴露端口
EXPOSE 80

# 使用nodemon启动应用
CMD ["npm", "run", "dev"] 