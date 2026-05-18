#!/bin/bash

# 获取脚本所在目录的绝对路径（双击打开时必备）
SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$SCRIPT_DIR"

echo "===================================="
echo "  金融报告 HTML 生成工具"
echo "  启动目录: $SCRIPT_DIR"
echo "===================================="
echo ""

# 检查 python3 是否存在
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到 python3，请确认 macOS 已安装 Xcode Command Line Tools"
    read -p "按回车键退出..."
    exit 1
fi

echo "🚀 正在启动服务..."
python3 server.py

# 如果 server 意外退出
echo ""
echo "⚠️  服务已停止。按回车键关闭窗口。"
read
