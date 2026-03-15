import React, { useState, useEffect } from 'react'
import { Copy, Check, RefreshCw, Eye, EyeOff } from 'lucide-react'

const PasswordGenerator: React.FC = () => {
  const [password, setPassword] = useState('')
  const [length, setLength] = useState(16)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [excludeSimilar, setExcludeSimilar] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [strength, setStrength] = useState(0)

  // 字符集
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
  const numberChars = '0123456789'
  const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  const similarChars = '0O1lI'

  // 生成密码
  const generatePassword = () => {
    let chars = ''
    let password = ''

    if (includeUppercase) chars += uppercaseChars
    if (includeLowercase) chars += lowercaseChars
    if (includeNumbers) chars += numberChars
    if (includeSymbols) chars += symbolChars

    if (excludeSimilar) {
      chars = chars.split('').filter(c => !similarChars.includes(c)).join('')
    }

    if (chars === '') {
      setPassword('')
      return
    }

    // 确保至少包含每种选中的字符类型
    const requiredChars = []
    if (includeUppercase) requiredChars.push(uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)])
    if (includeLowercase) requiredChars.push(lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)])
    if (includeNumbers) requiredChars.push(numberChars[Math.floor(Math.random() * numberChars.length)])
    if (includeSymbols) requiredChars.push(symbolChars[Math.floor(Math.random() * symbolChars.length)])

    // 生成剩余字符
    for (let i = requiredChars.length; i < length; i++) {
      password += chars[Math.floor(Math.random() * chars.length)]
    }

    // 添加必填字符并打乱顺序
    password += requiredChars.join('')
    password = password.split('').sort(() => 0.5 - Math.random()).join('')

    setPassword(password)
  }

  // 计算密码强度
  const calculateStrength = () => {
    if (!password) {
      setStrength(0)
      return
    }

    let score = 0
    
    // 长度
    if (password.length >= 12) score += 2
    else if (password.length >= 8) score += 1
    
    // 包含大写字母
    if (/[A-Z]/.test(password)) score += 1
    
    // 包含小写字母
    if (/[a-z]/.test(password)) score += 1
    
    // 包含数字
    if (/[0-9]/.test(password)) score += 1
    
    // 包含特殊字符
    if (/[^A-Za-z0-9]/.test(password)) score += 2

    setStrength(Math.min(score, 5))
  }

  // 复制到剪贴板
  const copyToClipboard = async () => {
    if (!password) return
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 获取强度文本和颜色
  const getStrengthInfo = () => {
    switch (strength) {
      case 0: return { text: '未设置', color: 'bg-gray-200' }
      case 1: return { text: '极弱', color: 'bg-red-500' }
      case 2: return { text: '弱', color: 'bg-orange-500' }
      case 3: return { text: '中等', color: 'bg-yellow-500' }
      case 4: return { text: '强', color: 'bg-green-500' }
      case 5: return { text: '非常强', color: 'bg-green-600' }
      default: return { text: '未设置', color: 'bg-gray-200' }
    }
  }

  useEffect(() => {
    generatePassword()
  }, [])

  useEffect(() => {
    calculateStrength()
  }, [password])

  const strengthInfo = getStrengthInfo()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">密码生成器</h2>
        <p className="text-gray-600">生成高强度随机密码，支持自定义长度和字符类型</p>
      </div>

      <div className="space-y-6">
        {/* 密码展示 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-md font-mono text-lg pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button
              onClick={copyToClipboard}
              disabled={!password}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? '已复制' : '复制'}
            </button>
          </div>

          {/* 强度显示 */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">密码强度</span>
              <span className="text-sm font-medium text-gray-900">{strengthInfo.text}</span>
            </div>
            <div className="flex gap-1 h-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`flex-1 rounded-full transition-colors ${
                    level <= strength ? strengthInfo.color : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 配置项 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">密码配置</h3>
          
          <div className="space-y-4">
            {/* 长度选择 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">密码长度: {length}</label>
              </div>
              <input
                type="range"
                min="4"
                max="32"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>4</span>
                <span>16</span>
                <span>32</span>
              </div>
            </div>

            {/* 字符选项 */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">包含大写字母 (A-Z)</span>
              </label>

              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={(e) => setIncludeLowercase(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">包含小写字母 (a-z)</span>
              </label>

              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">包含数字 (0-9)</span>
              </label>

              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">包含特殊字符 (!@#$...)</span>
              </label>

              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={excludeSimilar}
                  onChange={(e) => setExcludeSimilar(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">排除相似字符 (0,O,1,l,I)</span>
              </label>
            </div>
          </div>

          <button
            onClick={generatePassword}
            className="mt-6 w-full px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            重新生成
          </button>
        </div>

        {/* 安全提示 */}
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">安全建议</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 建议密码长度至少12位以上</li>
            <li>• 不同网站使用不同的密码，避免撞库风险</li>
            <li>• 定期更换重要账号的密码</li>
            <li>• 不要在公共场所或不信任的设备上输入密码</li>
            <li>• 推荐使用密码管理器来保存密码</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default PasswordGenerator
