// 实用工具配置 - Utility Tools
// 包含：图片/文档/二维码/PDF/简历等工具

import type { ToolEntry } from './tools'
import {
  Image, Eraser, PenTool, Crop, RotateCw, Sparkles, Grid3x3,
  FileCode, Heart, Palette, Laugh, Waves, File, FileSpreadsheet,
  Scissors, FileBadge, Pipette, NotebookPen, QrCode, ScanLine, Wand2,
  Contact, Tags, FileCheck2, FolderArchive, Copy, SplitSquareHorizontal,
} from 'lucide-react'

export const UTILITY_TOOLS: ToolEntry[] = [
  // 图片工具（9 个）
  { path: '/image-compressor', nameKey: 'tools.image_compressor', icon: Image, categoryKey: 'utils', keywords: ['图片压缩'] },
  { path: '/image-background-remover', nameKey: 'tools.image_bg_remover', icon: Eraser, categoryKey: 'utils', keywords: ['去背景'] },
  { path: '/image-watermark', nameKey: 'tools.image_watermark', icon: PenTool, categoryKey: 'utils', keywords: ['图片水印', 'watermark'] },
  { path: '/image-cropper', nameKey: 'tools.image_cropper', icon: Crop, categoryKey: 'utils', keywords: ['图片裁剪', 'crop'] },
  { path: '/image-rotator', nameKey: 'tools.image_rotator', icon: RotateCw, categoryKey: 'utils', keywords: ['图片旋转', 'rotate', '翻转'] },
  { path: '/image-filter', nameKey: 'tools.image_filter', icon: Sparkles, categoryKey: 'utils', keywords: ['图片滤镜', 'filter', '特效'] },
  { path: '/image-stitcher', nameKey: 'tools.image_stitcher', icon: Grid3x3, categoryKey: 'utils', keywords: ['图片拼接', 'stitch', '拼图'] },
  { path: '/image-watermark-remover', nameKey: 'tools.image_watermark_remover', icon: Eraser, categoryKey: 'utils', keywords: ['图片去水印', 'remove watermark'] },

  // 文档工具（3 个）
  { path: '/markdown', nameKey: 'tools.markdown', icon: FileCode, categoryKey: 'utils', keywords: ['markdown'] },
  { path: '/pdf-tools', nameKey: 'tools.pdf_tools', icon: File, categoryKey: 'utils', keywords: ['pdf'] },
  { path: '/sheet-editor', nameKey: 'tools.sheet_editor', icon: FileSpreadsheet, categoryKey: 'utils', keywords: ['csv', 'excel', '表格'] },
  { path: '/id-card-parser', nameKey: 'tools.id_card_parser', icon: FileBadge, categoryKey: 'utils', keywords: ['身份证', 'OCR', '识别', '证件'] },
  { path: '/text-to-speech', nameKey: 'tools.text_to_speech', icon: Waves, categoryKey: 'utils', keywords: ['语音', '朗读', 'tts', '文本'] },

  // 创意工具（5 个）
  { path: '/color-picker', nameKey: 'tools.color_picker', icon: Palette, categoryKey: 'utils', keywords: ['颜色'] },
  { path: '/color-blind-sim', nameKey: 'tools.color_blind_sim', icon: Heart, categoryKey: 'utils', keywords: ['色盲', '无障碍', '模拟', '视觉'] },
  { path: '/color-system', nameKey: 'tools.color_system', icon: Palette, categoryKey: 'utils', keywords: ['配色', '色板', '设计系统', '颜色'] },
  { path: '/unit-converter', nameKey: 'tools.unit_converter', icon: Waves, categoryKey: 'utils', keywords: ['单位换算'] },
  { path: '/short-link', nameKey: 'tools.short_link', icon: Scissors, categoryKey: 'utils', keywords: ['短链接'] },
  { path: '/resume-generator', nameKey: 'tools.resume', icon: FileBadge, categoryKey: 'utils', keywords: ['简历'] },
  { path: '/business-card', nameKey: 'tools.business_card', icon: Contact, categoryKey: 'utils', keywords: ['名片', '名片设计', 'business card', 'vcard', '二维码', '设计'] },
  { path: '/meta-tag-gen', nameKey: 'tools.meta_tag_gen', icon: Tags, categoryKey: 'utils', keywords: ['seo', 'meta', 'og', 'open graph', 'twitter card', '社交卡片', '搜索优化'] },
  { path: '/file-hash-check', nameKey: 'tools.file_hash_check', icon: FileCheck2, categoryKey: 'utils', keywords: ['hash', '哈希', '校验', 'md5', 'sha-256', 'checksum', '完整性'] },
  { path: '/zip-extractor', nameKey: 'tools.zip_extractor', icon: FolderArchive, categoryKey: 'utils', keywords: ['zip', '解压', '压缩包', '文件树', 'extract', 'archive'] },
  { path: '/duplicate-finder', nameKey: 'tools.duplicate_finder', icon: Copy, categoryKey: 'utils', keywords: ['重复', '查重', '去重', 'duplicate', 'dedup', 'hash'] },
  { path: '/file-splitter', nameKey: 'tools.file_splitter', icon: SplitSquareHorizontal, categoryKey: 'utils', keywords: ['文件', '分割', '合并', '切片', 'split', 'merge', 'chunk'] },
  { path: '/color-generator', nameKey: 'tools.color_generator', icon: Pipette, categoryKey: 'utils', keywords: ['配色'] },
  { path: '/meme-generator', nameKey: 'tools.meme_generator', icon: Laugh, categoryKey: 'utils', keywords: ['表情包'] },
  { path: '/copywriting-generator', nameKey: 'tools.copywriting_generator', icon: NotebookPen, categoryKey: 'utils', keywords: ['文案'] },

  // 二维码工具（3 个）
  { path: '/qrcode/generate', nameKey: 'tools.qrcode_generate', icon: QrCode, categoryKey: 'qrcode', keywords: ['qr', '二维码'] },
  { path: '/qrcode/read', nameKey: 'tools.qrcode_read', icon: ScanLine, categoryKey: 'qrcode', keywords: ['qr', '解析'] },
  { path: '/qrcode/beautifier', nameKey: 'tools.qrcode_beautifier', icon: Wand2, categoryKey: 'qrcode', keywords: ['qr', '美化'] },
]
