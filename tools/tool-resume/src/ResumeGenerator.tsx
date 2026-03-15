import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, Copy, Check, User, Briefcase, GraduationCap, Award, Book, Phone, Mail, Globe, MapPin, Link2, Plus, Trash2, Eye, FileText, Settings } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { PageHero } from '@toolbox/ui-kit'

interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
}

interface Education {
  id: string
  school: string
  degree: string
  major: string
  startDate: string
  endDate: string
  description: string
}

interface Skill {
  id: string
  name: string
  level: number // 1-5
}

interface Project {
  id: string
  name: string
  role: string
  startDate: string
  endDate: string
  description: string
  techStack: string
}

interface Contact {
  phone: string
  email: string
  location: string
  website: string
  github: string
  linkedin: string
}

interface ResumeData {
  basicInfo: {
    name: string
    position: string
    avatar: string
    summary: string
  }
  contact: Contact
  experiences: Experience[]
  educations: Education[]
  skills: Skill[]
  projects: Project[]
  certifications: string[]
}

const ResumeGenerator: React.FC = () => {
  const { t } = useTranslation('nav')
  const { t: tHome } = useTranslation('home')
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'simple' | 'creative'>('modern')
  const resumeRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)

  const [resumeData, setResumeData] = useState<ResumeData>({
    basicInfo: {
      name: '张三',
      position: '前端开发工程师',
      avatar: '',
      summary: '5年前端开发经验，精通React、Vue等前端框架，有丰富的项目实战经验，擅长性能优化和用户体验提升。'
    },
    contact: {
      phone: '138****1234',
      email: 'zhangsan@example.com',
      location: '北京市',
      website: 'https://zhangsan.dev',
      github: 'https://github.com/zhangsan',
      linkedin: 'https://linkedin.com/in/zhangsan'
    },
    experiences: [
      {
        id: '1',
        company: '字节跳动',
        position: '高级前端开发工程师',
        startDate: '2021-03',
        endDate: '至今',
        description: '负责公司核心产品的前端架构设计和开发，主导性能优化项目，首屏加载速度提升50%。参与团队技术栈升级，从Vue2迁移到React18，提升开发效率30%。'
      },
      {
        id: '2',
        company: '阿里巴巴',
        position: '前端开发工程师',
        startDate: '2019-07',
        endDate: '2021-02',
        description: '负责电商平台的前端开发工作，参与多个大型活动页面的开发，支撑双11等大促活动。开发通用组件库，提升团队开发效率。'
      }
    ],
    educations: [
      {
        id: '1',
        school: '清华大学',
        degree: '本科',
        major: '计算机科学与技术',
        startDate: '2015-09',
        endDate: '2019-06',
        description: 'GPA：3.8/4.0，获得国家奖学金，优秀毕业生。'
      }
    ],
    skills: [
      { id: '1', name: 'JavaScript', level: 5 },
      { id: '2', name: 'React', level: 5 },
      { id: '3', name: 'Vue', level: 4 },
      { id: '4', name: 'TypeScript', level: 4 },
      { id: '5', name: 'Node.js', level: 3 },
      { id: '6', name: 'Webpack', level: 4 }
    ],
    projects: [
      {
        id: '1',
        name: '在线协同办公系统',
        role: '前端负责人',
        startDate: '2022-01',
        endDate: '2022-12',
        description: '主导多人实时协同办公系统的前端开发，支持文档编辑、表格、会议等功能，服务10万+企业用户。',
        techStack: 'React + TypeScript + WebRTC + Socket.io'
      },
      {
        id: '2',
        name: '电商平台重构',
        role: '核心开发',
        startDate: '2020-03',
        endDate: '2020-09',
        description: '参与电商平台的前后端分离重构，页面加载速度提升40%，转化率提升15%。',
        techStack: 'Vue3 + Vite + Pinia'
      }
    ],
    certifications: ['CET-6', 'PMP证书', '阿里云ACP认证']
  })

  // 基本信息更新
  const updateBasicInfo = (field: keyof ResumeData['basicInfo'], value: string) => {
    setResumeData(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        [field]: value
      }
    }))
  }

  // 联系方式更新
  const updateContact = (field: keyof Contact, value: string) => {
    setResumeData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }))
  }

  // 工作经历操作
  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    }
    setResumeData(prev => ({
      ...prev,
      experiences: [...prev.experiences, newExp]
    }))
  }

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const deleteExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id)
    }))
  }

  // 教育经历操作
  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      major: '',
      startDate: '',
      endDate: '',
      description: ''
    }
    setResumeData(prev => ({
      ...prev,
      educations: [...prev.educations, newEdu]
    }))
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setResumeData(prev => ({
      ...prev,
      educations: prev.educations.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const deleteEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      educations: prev.educations.filter(edu => edu.id !== id)
    }))
  }

  // 技能操作
  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: '',
      level: 3
    }
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }))
  }

  const updateSkill = (id: string, field: keyof Skill, value: string | number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map(skill => 
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    }))
  }

  const deleteSkill = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }))
  }

  // 项目经历操作
  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
      techStack: ''
    }
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }))
  }

  const updateProject = (id: string, field: keyof Project, value: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(project => 
        project.id === id ? { ...project, [field]: value } : project
      )
    }))
  }

  const deleteProject = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== id)
    }))
  }

  // 导出PDF
  const exportToPDF = async () => {
    if (!resumeRef.current) return
    
    setExporting(true)
    try {
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`${resumeData.basicInfo.name}-简历.pdf`)
    } catch (error) {
      console.error('导出PDF失败:', error)
      alert('导出PDF失败，请重试')
    } finally {
      setExporting(false)
    }
  }

  // 复制为Markdown
  const copyAsMarkdown = async () => {
    const markdown = `# ${resumeData.basicInfo.name}
## ${resumeData.basicInfo.position}

### 联系方式
- 📱 电话：${resumeData.contact.phone}
- 📧 邮箱：${resumeData.contact.email}
- 📍 地点：${resumeData.contact.location}
- 🌐 个人网站：${resumeData.contact.website}
- 💻 GitHub：${resumeData.contact.github}
- 💼 LinkedIn：${resumeData.contact.linkedin}

### 个人简介
${resumeData.basicInfo.summary}

### 工作经历
${resumeData.experiences.map(exp => `
#### ${exp.position} @ ${exp.company}
*${exp.startDate} - ${exp.endDate}*
${exp.description}
`).join('\n')}

### 教育背景
${resumeData.educations.map(edu => `
#### ${edu.degree} - ${edu.major} @ ${edu.school}
*${edu.startDate} - ${edu.endDate}*
${edu.description}
`).join('\n')}

### 专业技能
${resumeData.skills.map(skill => `- ${skill.name} (${'★'.repeat(skill.level)}${'☆'.repeat(5 - skill.level)})`).join('\n')}

### 项目经历
${resumeData.projects.map(project => `
#### ${project.name} - ${project.role}
*${project.startDate} - ${project.endDate}*
**技术栈：** ${project.techStack}
${project.description}
`).join('\n')}

### 证书认证
${resumeData.certifications.map(cert => `- ${cert}`).join('\n')}
`

    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const SkillStars = ({ level }: { level: number }) => (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-lg ${i < level ? 'text-yellow-500' : 'text-gray-300'}`}>
          ★
        </span>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHero
        title={t('tools.resume')}
        description={tHome('toolDesc.resume')}
      />

      {/* 顶部操作栏 */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'edit'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              编辑内容
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              预览效果
            </button>
          </div>

          <div className="flex space-x-3">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="modern">现代模板</option>
              <option value="simple">简约模板</option>
              <option value="creative">创意模板</option>
            </select>

            <button
              onClick={copyAsMarkdown}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? '已复制' : '复制Markdown'}
            </button>

            <button
              onClick={exportToPDF}
              disabled={exporting}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  导出中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  导出PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'edit' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 基本信息 */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-indigo-600" />
              基本信息
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                  <input
                    type="text"
                    value={resumeData.basicInfo.name}
                    onChange={(e) => updateBasicInfo('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">求职意向</label>
                  <input
                    type="text"
                    value={resumeData.basicInfo.position}
                    onChange={(e) => updateBasicInfo('position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
                <textarea
                  value={resumeData.basicInfo.summary}
                  onChange={(e) => updateBasicInfo('summary', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  placeholder="简要介绍你的优势、经验和技能..."
                />
              </div>
            </div>
          </div>

          {/* 联系方式 */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-indigo-600" />
              联系方式
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">手机号码</label>
                  <input
                    type="tel"
                    value={resumeData.contact.phone}
                    onChange={(e) => updateContact('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                  <input
                    type="email"
                    value={resumeData.contact.email}
                    onChange={(e) => updateContact('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">所在城市</label>
                  <input
                    type="text"
                    value={resumeData.contact.location}
                    onChange={(e) => updateContact('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">个人网站</label>
                  <input
                    type="url"
                    value={resumeData.contact.website}
                    onChange={(e) => updateContact('website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                  <input
                    type="url"
                    value={resumeData.contact.github}
                    onChange={(e) => updateContact('github', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  <input
                    type="url"
                    value={resumeData.contact.linkedin}
                    onChange={(e) => updateContact('linkedin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 工作经历 */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                工作经历
              </h3>
              <button
                onClick={addExperience}
                className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                添加
              </button>
            </div>
            <div className="space-y-6">
              {resumeData.experiences.map((exp) => (
                <div key={exp.id} className="p-4 border border-gray-200 rounded-lg relative">
                  <button
                    onClick={() => deleteExperience(exp.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">公司名称</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">职位</label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                      <input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                      <input
                        type="month"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="至今"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">工作描述</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      placeholder="描述你的工作内容、取得的成绩和贡献..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 教育背景 */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" />
                教育背景
              </h3>
              <button
                onClick={addEducation}
                className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                添加
              </button>
            </div>
            <div className="space-y-6">
              {resumeData.educations.map((edu) => (
                <div key={edu.id} className="p-4 border border-gray-200 rounded-lg relative">
                  <button
                    onClick={() => deleteEducation(edu.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">学校名称</label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">学位</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="本科/硕士/博士"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">专业</label>
                      <input
                        type="text"
                        value={edu.major}
                        onChange={(e) => updateEducation(edu.id, 'major', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                        <input
                          type="month"
                          value={edu.startDate}
                          onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                        <input
                          type="month"
                          value={edu.endDate}
                          onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                    <textarea
                      value={edu.description}
                      onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      placeholder="GPA、获得的奖项、参加的活动等..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 专业技能 */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Award className="w-5 h-5 mr-2 text-indigo-600" />
                专业技能
              </h3>
              <button
                onClick={addSkill}
                className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                添加
              </button>
            </div>
            <div className="space-y-4">
              {resumeData.skills.map((skill) => (
                <div key={skill.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                    placeholder="技能名称"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <select
                    value={skill.level}
                    onChange={(e) => updateSkill(skill.id, 'level', parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={1}>了解</option>
                    <option value={2}>基础</option>
                    <option value={3}>熟练</option>
                    <option value={4}>精通</option>
                    <option value={5}>专家</option>
                  </select>
                  <button
                    onClick={() => deleteSkill(skill.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 项目经历 */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Book className="w-5 h-5 mr-2 text-indigo-600" />
                项目经历
              </h3>
              <button
                onClick={addProject}
                className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                添加
              </button>
            </div>
            <div className="space-y-6">
              {resumeData.projects.map((project) => (
                <div key={project.id} className="p-4 border border-gray-200 rounded-lg relative">
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">项目名称</label>
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">担任角色</label>
                      <input
                        type="text"
                        value={project.role}
                        onChange={(e) => updateProject(project.id, 'role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                      <input
                        type="month"
                        value={project.startDate}
                        onChange={(e) => updateProject(project.id, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                      <input
                        type="month"
                        value={project.endDate}
                        onChange={(e) => updateProject(project.id, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">技术栈</label>
                    <input
                      type="text"
                      value={project.techStack}
                      onChange={(e) => updateProject(project.id, 'techStack', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="React, TypeScript, Node.js..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">项目描述</label>
                    <textarea
                      value={project.description}
                      onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      placeholder="描述项目背景、你的职责、取得的成果..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 预览区域 */
        <div className="card p-0 overflow-hidden">
          <div 
            ref={resumeRef}
            className={`resume-preview min-h-[297mm] w-full bg-white p-8 shadow-lg ${
              selectedTemplate === 'modern' ? 'modern-template' : 
              selectedTemplate === 'creative' ? 'creative-template' : 'simple-template'
            }`}
          >
            {/* 现代模板 */}
            {selectedTemplate === 'modern' && (
              <div className="grid grid-cols-3 gap-8">
                {/* 侧边栏 */}
                <div className="col-span-1 bg-indigo-50 p-6 rounded-lg">
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{resumeData.basicInfo.name}</h1>
                    <p className="text-indigo-600 font-medium">{resumeData.basicInfo.position}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-indigo-200 pb-1">联系方式</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-indigo-600" />
                          {resumeData.contact.phone}
                        </li>
                        <li className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-indigo-600" />
                          {resumeData.contact.email}
                        </li>
                        <li className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-indigo-600" />
                          {resumeData.contact.location}
                        </li>
                        {resumeData.contact.website && (
                          <li className="flex items-center">
                            <Globe className="w-4 h-4 mr-2 text-indigo-600" />
                            <a href={resumeData.contact.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                              个人网站
                            </a>
                          </li>
                        )}
                        {resumeData.contact.github && (
                          <li className="flex items-center">
                            <Link2 className="w-4 h-4 mr-2 text-indigo-600" />
                            <a href={resumeData.contact.github} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                              GitHub
                            </a>
                          </li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-indigo-200 pb-1">专业技能</h3>
                      <ul className="space-y-2">
                        {resumeData.skills.map((skill) => (
                          <li key={skill.id} className="flex justify-between items-center">
                            <span className="text-sm">{skill.name}</span>
                            <SkillStars level={skill.level} />
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-indigo-200 pb-1">证书认证</h3>
                      <ul className="space-y-2 text-sm">
                        {resumeData.certifications.map((cert, index) => (
                          <li key={index} className="flex items-center">
                            <Award className="w-4 h-4 mr-2 text-indigo-600" />
                            {cert}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 主内容 */}
                <div className="col-span-2">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">个人简介</h2>
                    <p className="text-gray-700 leading-relaxed">{resumeData.basicInfo.summary}</p>
                  </div>

                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1 flex items-center">
                      <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                      工作经历
                    </h2>
                    <div className="space-y-4">
                      {resumeData.experiences.map((exp) => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                              <p className="text-indigo-600">{exp.company}</p>
                            </div>
                            <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</p>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1 flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" />
                      教育背景
                    </h2>
                    <div className="space-y-4">
                      {resumeData.educations.map((edu) => (
                        <div key={edu.id}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{edu.school}</h3>
                              <p className="text-indigo-600">{edu.degree} - {edu.major}</p>
                            </div>
                            <p className="text-sm text-gray-500">{edu.startDate} - {edu.endDate}</p>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{edu.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1 flex items-center">
                      <Book className="w-5 h-5 mr-2 text-indigo-600" />
                      项目经历
                    </h2>
                    <div className="space-y-4">
                      {resumeData.projects.map((project) => (
                        <div key={project.id}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{project.name}</h3>
                              <p className="text-indigo-600">{project.role} · {project.techStack}</p>
                            </div>
                            <p className="text-sm text-gray-500">{project.startDate} - {project.endDate}</p>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{project.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 简约模板 */}
            {selectedTemplate === 'simple' && (
              <div className="space-y-6">
                <div className="text-center pb-6 border-b border-gray-200">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{resumeData.basicInfo.name}</h1>
                  <p className="text-xl text-indigo-600 font-medium mb-3">{resumeData.basicInfo.position}</p>
                  <div className="flex justify-center flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center"><Phone className="w-4 h-4 mr-1" /> {resumeData.contact.phone}</span>
                    <span className="flex items-center"><Mail className="w-4 h-4 mr-1" /> {resumeData.contact.email}</span>
                    <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {resumeData.contact.location}</span>
                    {resumeData.contact.github && (
                      <span className="flex items-center"><Link2 className="w-4 h-4 mr-1" /> GitHub</span>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">个人简介</h2>
                  <p className="text-gray-700 leading-relaxed">{resumeData.basicInfo.summary}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">工作经历</h2>
                  <div className="space-y-4">
                    {resumeData.experiences.map((exp) => (
                      <div key={exp.id} className="border-l-2 border-indigo-500 pl-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{exp.position} @ {exp.company}</h3>
                          </div>
                          <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</p>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">教育背景</h2>
                  <div className="space-y-4">
                    {resumeData.educations.map((edu) => (
                      <div key={edu.id} className="border-l-2 border-indigo-500 pl-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{edu.school}</h3>
                            <p className="text-indigo-600">{edu.degree} - {edu.major}</p>
                          </div>
                          <p className="text-sm text-gray-500">{edu.startDate} - {edu.endDate}</p>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{edu.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">专业技能</h2>
                    <div className="grid grid-cols-2 gap-2">
                      {resumeData.skills.map((skill) => (
                        <div key={skill.id} className="flex items-center justify-between">
                          <span className="text-gray-700">{skill.name}</span>
                          <SkillStars level={skill.level} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">项目经历</h2>
                    <div className="space-y-3">
                      {resumeData.projects.map((project) => (
                        <div key={project.id}>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{project.name}</h3>
                            <p className="text-xs text-gray-500">{project.startDate} - {project.endDate}</p>
                          </div>
                          <p className="text-gray-600 text-xs">{project.techStack}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 创意模板 */}
            {selectedTemplate === 'creative' && (
              <div className="relative">
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                
                <div className="pt-8">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {resumeData.basicInfo.name}
                    </h1>
                    <p className="text-xl text-gray-700 font-medium mb-4">{resumeData.basicInfo.position}</p>
                    <div className="flex justify-center flex-wrap gap-4 text-sm text-gray-600">
                      <span className="bg-gray-100 px-3 py-1 rounded-full">{resumeData.contact.phone}</span>
                      <span className="bg-gray-100 px-3 py-1 rounded-full">{resumeData.contact.email}</span>
                      <span className="bg-gray-100 px-3 py-1 rounded-full">{resumeData.contact.location}</span>
                    </div>
                  </div>

                  <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">个人简介</h2>
                    <p className="text-gray-700 leading-relaxed">{resumeData.basicInfo.summary}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                        工作经历
                      </h2>
                      <div className="space-y-4">
                        {resumeData.experiences.map((exp) => (
                          <div key={exp.id} className="relative pl-6 border-l-2 border-indigo-300">
                            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-indigo-500" />
                            <div className="mb-2">
                              <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                              <p className="text-indigo-600 text-sm">{exp.company}</p>
                              <p className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</p>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" />
                        教育背景
                      </h2>
                      <div className="space-y-4">
                        {resumeData.educations.map((edu) => (
                          <div key={edu.id} className="relative pl-6 border-l-2 border-purple-300">
                            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-purple-500" />
                            <div className="mb-2">
                              <h3 className="font-semibold text-gray-900">{edu.school}</h3>
                              <p className="text-purple-600 text-sm">{edu.degree} - {edu.major}</p>
                              <p className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</p>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{edu.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Award className="w-5 h-5 mr-2 text-indigo-600" />
                        专业技能
                      </h2>
                      <div className="space-y-2">
                        {resumeData.skills.map((skill) => (
                          <div key={skill.id}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-700">{skill.name}</span>
                              <span className="text-xs text-gray-500">{skill.level}/5</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                style={{ width: `${(skill.level / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Book className="w-5 h-5 mr-2 text-indigo-600" />
                        项目经历
                      </h2>
                      <div className="space-y-3">
                        {resumeData.projects.map((project) => (
                          <div key={project.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-semibold text-gray-900 text-sm">{project.name}</h3>
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                                {project.role}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">{project.techStack}</p>
                            <p className="text-xs text-gray-500">{project.startDate} - {project.endDate}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 mb-3">使用说明</h3>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            所有数据保存在浏览器本地，不会上传到服务器，保护个人隐私
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            支持三种模板风格：现代、简约、创意，满足不同求职场景需求
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            可以导出为高清PDF格式，也可以复制为Markdown格式方便编辑
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            内置默认示例，可以直接修改使用，快速生成专业简历
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            支持添加多条工作经历、教育背景、技能和项目经历，灵活扩展
          </li>
        </ul>
      </div>
    </div>
  )
}

export default ResumeGenerator

