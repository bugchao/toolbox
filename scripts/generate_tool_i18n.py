#!/usr/bin/env python3
# 生成工具翻译配置

import sys

# 常用工具的中英文翻译
tool_names = {
    'zh': {
        'dns_query': 'DNS 查询',
        'base64': 'Base64 编码/解码',
        'qrcode': '二维码生成器',
        'color_picker': '颜色选择器',
        'timestamp': '时间戳转换',
        'json_formatter': 'JSON 格式化',
        'uuid_generator': 'UUID 生成器',
        'password_generator': '密码生成器',
        'hash_generator': 'Hash 生成器',
        'url_encoder': 'URL 编码/解码',
        'regex_tester': '正则表达式测试',
        'code': '代码格式化',
        'cron': 'Cron 表达式生成器',
        'ai_token_cost': 'AI Token 费用计算',
        'analog_clock': '模拟时钟',
        'proxy_speed_test': '代理速度测试',
        'ip_query': 'IP 地址查询',
        'weather': '天气查询',
        'zip_code': '邮编查询',
    },
    'en': {
        'dns_query': 'DNS Query',
        'base64': 'Base64 Encoder/Decoder',
        'qrcode': 'QR Code Generator',
        'color_picker': 'Color Picker',
        'timestamp': 'Timestamp Converter',
        'json_formatter': 'JSON Formatter',
        'uuid_generator': 'UUID Generator',
        'password_generator': 'Password Generator',
        'hash_generator': 'Hash Generator',
        'url_encoder': 'URL Encoder/Decoder',
        'regex_tester': 'Regex Tester',
        'code': 'Code Formatter',
        'cron': 'Cron Expression Generator',
        'ai_token_cost': 'AI Token Cost Calculator',
        'analog_clock': 'Analog Clock',
        'proxy_speed_test': 'Proxy Speed Test',
        'ip_query': 'IP Address Query',
        'weather': 'Weather Query',
        'zip_code': 'Zip Code Query',
    }
}

# 读取工具列表
try:
    with open('/tmp/tool_keys.txt', 'r') as f:
        keys = [line.strip().replace('tools.', '') for line in f if line.strip()]
except:
    keys = list(tool_names['zh'].keys())

print('    "tools": {')
print('      "home": "首页",')
print('      "favorites": "收藏夹",')

for key in sorted(keys):
    name_zh = tool_names['zh'].get(key, key.replace('_', ' ').title())
    print(f'      "{key}": "{name_zh}",')

print('    }')
