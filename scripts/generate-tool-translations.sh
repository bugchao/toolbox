#!/bin/bash
# 生成工具翻译配置

cd "$(dirname "$0")/../apps/web/src"

# 提取所有工具的 nameKey
grep -h "nameKey: 'tools\." config/*.ts | \
  sed "s/.*nameKey: '\(tools\.[^']*\)'.*/\1/" | \
  sort -u > /tmp/tool_keys.txt

echo "找到 $(wc -l < /tmp/tool_keys.txt) 个工具需要翻译"

# 生成中文翻译 JSON
echo '  "tools": {' > /tmp/tools_zh.json
while IFS= read -r key; do
  tool_name=$(echo "$key" | sed 's/tools\.//')
  # 将下划线转换为空格，首字母大写
  display_name=$(echo "$tool_name" | sed 's/_/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2));}1')
  echo "    \"$tool_name\": \"$display_name\"," >> /tmp/tools_zh.json
done < /tmp/tool_keys.txt
# 移除最后一个逗号
sed -i '' '$ s/,$//' /tmp/tools_zh.json
echo '  }' >> /tmp/tools_zh.json

echo "生成的翻译配置："
head -20 /tmp/tools_zh.json
echo "..."
echo "完整配置已保存到 /tmp/tools_zh.json"
