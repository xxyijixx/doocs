#!/bin/bash

# Widget构建脚本

echo "开始构建Chat Widget..."

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
fi

# 构建widget
echo "构建widget..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Widget构建成功！"
    echo "输出文件: dist/bundle.js"
    
    # 显示文件大小
    if [ -f "dist/bundle.js" ]; then
        size=$(du -h dist/bundle.js | cut -f1)
        echo "文件大小: $size"
    fi
    
    echo ""
    echo "使用方法:"
    echo "1. 引入脚本: <script src='./bundle.js'></script>"
    echo "2. 通过全局配置: 在引入脚本前设置 window.WIDGET_CONFIG"
    echo "3. 手动初始化: 调用 ChatWidget.init(options)"
    echo ""
    echo "详细使用方法请查看 example.html 文件"
else
    echo "❌ 构建失败！"
    exit 1
fi