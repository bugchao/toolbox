#!/bin/bash
# 批量为 P2 工具包添加 useTranslation hook

TOOLS=(
  "tool-expense-tracker"
  "tool-habit-tracker"
  "tool-pomodoro"
  "tool-split-bill"
  "tool-study-timer"
  "tool-time-logger"
  "tool-water-reminder"
  "tool-distance-calc"
  "tool-installment-calc"
  "tool-flight-search"
  "tool-hotel-trend"
  "tool-restaurant-finder"
  "tool-trending-spots"
  "tool-trip-planner"
)

cd "$(dirname "$0")/tools"

for tool in "${TOOLS[@]}"; do
  if [ ! -d "$tool" ]; then
    echo "⚠️  $tool not found, skipping..."
    continue
  fi
  
  # 查找主组件文件
  main_file=$(find "$tool/src" -name "*.tsx" -type f ! -name "index.tsx" | head -1)
  
  if [ -z "$main_file" ]; then
    echo "⚠️  No main component found in $tool"
    continue
  fi
  
  # 检查是否已有 useTranslation
  if grep -q "useTranslation" "$main_file"; then
    echo "✅ $tool already has useTranslation"
    continue
  fi
  
  echo "🔧 Processing $tool..."
  
  # 添加 import（如果没有）
  if ! grep -q "from 'react-i18next'" "$main_file"; then
    # 在 React import 后添加
    sed -i "" "/import.*from 'react'/a\\
import { useTranslation } from 'react-i18next'
" "$main_file"
  fi
  
  echo "✅ Added i18n import to $tool"
done

echo ""
echo "Done! Please manually add 'const { t } = useTranslation();' to component bodies."
