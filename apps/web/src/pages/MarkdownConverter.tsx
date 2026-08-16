import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Download, Eye, Edit, Code, Check, Palette, Clipboard } from 'lucide-react';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeHighlight from 'rehype-highlight';
// highlight.js 和 katex CSS 不全局引入，改为在 iframe 内隔离加载

interface Template {
  name: string;
  css: string;
  description: string;
}

const templateLabelKeys: Record<string, string> = {
  '默认样式': 'templateDefault',
  '微信公众号': 'templateWechat',
  '掘金风格': 'templateJuejin',
  '简约深色': 'templateDark',
};

const templateDescKeys: Record<string, string> = {
  '默认样式': 'templateDefaultDesc',
  '微信公众号': 'templateWechatDesc',
  '掘金风格': 'templateJuejinDesc',
  '简约深色': 'templateDarkDesc',
};

const templates: Template[] = [
  {
    name: '默认样式',
    description: '简洁通用的Markdown样式',
    css: `
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
      h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; }
      h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
      h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
      h3 { font-size: 1.25em; }
      h4 { font-size: 1em; }
      p { margin-top: 0; margin-bottom: 16px; }
      blockquote { padding: 0 1em; color: #6a737d; border-left: 0.25em solid #dfe2e5; margin: 0; }
      code { padding: 0.2em 0.4em; margin: 0; font-size: 85%; background-color: rgba(27,31,35,0.05); border-radius: 3px; font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace; }
      pre { padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background-color: #f6f8fa; border-radius: 3px; margin-bottom: 16px; }
      pre code { background: transparent; padding: 0; }
      ul, ol { margin-top: 0; margin-bottom: 16px; padding-left: 2em; }
      li { margin-bottom: 0.25em; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
      th, td { padding: 6px 13px; border: 1px solid #dfe2e5; }
      th { font-weight: 600; background-color: #f6f8fa; }
      tr { background-color: #fff; border-top: 1px solid #c6cbd1; }
      tr:nth-child(2n) { background-color: #f6f8fa; }
      img { max-width: 100%; box-sizing: content-box; background-color: #fff; }
      hr { height: 0.25em; padding: 0; margin: 24px 0; background-color: #e1e4e8; border: 0; }
      a { color: #0366d6; text-decoration: none; }
      a:hover { text-decoration: underline; }
    `
  },
  {
    name: '微信公众号',
    description: '适配微信公众号排版',
    css: `
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; line-height: 1.8; color: #333; max-width: 677px; margin: 0 auto; padding: 20px; font-size: 16px; }
      h1, h2, h3, h4, h5, h6 { margin-top: 32px; margin-bottom: 16px; font-weight: 600; line-height: 1.5; color: #1a1a1a; }
      h1 { font-size: 24px; text-align: center; border-bottom: 2px solid #52c41a; padding-bottom: 8px; }
      h2 { font-size: 20px; border-left: 4px solid #52c41a; padding-left: 12px; }
      h3 { font-size: 18px; color: #52c41a; }
      p { margin-top: 0; margin-bottom: 16px; text-align: justify; }
      blockquote { padding: 12px 16px; color: #666; background-color: #f6ffed; border-left: 4px solid #b7eb8f; margin: 16px 0; border-radius: 4px; }
      code { padding: 2px 6px; margin: 0; font-size: 14px; background-color: #f6f8fa; border-radius: 3px; font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace; color: #d32f2f; }
      pre { padding: 16px; overflow: auto; font-size: 14px; line-height: 1.6; background-color: #f6f8fa; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e8e8e8; }
      pre code { background: transparent; padding: 0; color: #333; }
      ul, ol { margin-top: 0; margin-bottom: 16px; padding-left: 2em; }
      li { margin-bottom: 0.5em; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 16px; background-color: #fff; }
      th, td { padding: 8px 12px; border: 1px solid #d9d9d9; }
      th { font-weight: 600; background-color: #fafafa; }
      img { max-width: 100%; display: block; margin: 16px auto; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      hr { height: 1px; padding: 0; margin: 32px 0; background-color: #e8e8e8; border: 0; }
      a { color: #1890ff; text-decoration: none; }
      strong { color: #1a1a1a; font-weight: 600; }
      .highlight { background: linear-gradient(transparent 60%, #ffd591 40%); padding: 0 2px; }
    `
  },
  {
    name: '掘金风格',
    description: '适配掘金社区排版',
    css: `
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.7; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; font-size: 16px; }
      h1, h2, h3, h4, h5, h6 { margin-top: 28px; margin-bottom: 16px; font-weight: 600; line-height: 1.4; }
      h1 { font-size: 28px; color: #1a1a1a; }
      h2 { font-size: 24px; color: #1a1a1a; border-bottom: 1px solid #eee; padding-bottom: 8px; }
      h3 { font-size: 20px; color: #1a1a1a; }
      h4 { font-size: 18px; color: #1a1a1a; }
      p { margin-top: 0; margin-bottom: 16px; }
      blockquote { padding: 12px 16px; color: #666; background: #f7f8fa; border-left: 4px solid #007fff; margin: 16px 0; border-radius: 0 4px 4px 0; }
      code { padding: 2px 4px; margin: 0 2px; font-size: 14px; background: #f7f8fa; border-radius: 3px; font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace; color: #c7254e; }
      pre { padding: 16px; overflow: auto; font-size: 14px; line-height: 1.6; background: #f7f8fa; border-radius: 4px; margin-bottom: 16px; }
      pre code { background: transparent; padding: 0; color: #333; }
      ul, ol { margin-top: 0; margin-bottom: 16px; padding-left: 2em; }
      li { margin-bottom: 8px; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
      th, td { padding: 8px 16px; border: 1px solid #eaecef; }
      th { font-weight: 600; background-color: #f7f8fa; }
      img { max-width: 100%; display: block; margin: 16px auto; border-radius: 4px; }
      hr { height: 1px; margin: 32px 0; background-color: #eaecef; border: 0; }
      a { color: #007fff; text-decoration: none; }
      a:hover { text-decoration: underline; }
    `
  },
  {
    name: '简约深色',
    description: '深色模式简约风格',
    css: `
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #e0e0e0; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #121212; }
      h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; color: #ffffff; }
      h1 { font-size: 2em; border-bottom: 1px solid #333; padding-bottom: 0.3em; }
      h2 { font-size: 1.5em; border-bottom: 1px solid #333; padding-bottom: 0.3em; }
      h3 { font-size: 1.25em; }
      p { margin-top: 0; margin-bottom: 16px; }
      blockquote { padding: 0 1em; color: #90caf9; border-left: 0.25em solid #1976d2; margin: 0; background-color: #1e1e1e; border-radius: 0 4px 4px 0; }
      code { padding: 0.2em 0.4em; margin: 0; font-size: 85%; background-color: #2d2d2d; border-radius: 3px; font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace; color: #ffcc80; }
      pre { padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background-color: #1e1e1e; border-radius: 3px; margin-bottom: 16px; border: 1px solid #333; }
      pre code { background: transparent; padding: 0; color: #e0e0e0; }
      ul, ol { margin-top: 0; margin-bottom: 16px; padding-left: 2em; }
      li { margin-bottom: 0.25em; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
      th, td { padding: 6px 13px; border: 1px solid #333; }
      th { font-weight: 600; background-color: #1e1e1e; color: #ffffff; }
      tr { background-color: #121212; border-top: 1px solid #333; }
      tr:nth-child(2n) { background-color: #1e1e1e; }
      img { max-width: 100%; box-sizing: content-box; background-color: #1e1e1e; border-radius: 4px; }
      hr { height: 0.25em; padding: 0; margin: 24px 0; background-color: #333; border: 0; }
      a { color: #90caf9; text-decoration: none; }
      a:hover { text-decoration: underline; }
    `
  }
];

/** 将模板中的 body 选择器限定到预览容器，避免影响整页布局 */
function scopeTemplateCssForPreview(css: string): string {
  return css.replace(/\bbody\s*\{/g, '.markdown-preview-root {');
}

const MarkdownConverter: React.FC = () => {
  const { t } = useTranslation('markdownConverter');
  const [markdown, setMarkdown] = useState(() => t('defaultMarkdownContent'));
  const [htmlOutput, setHtmlOutput] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('微信公众号');
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [copied, setCopied] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const convertMarkdown = async (md: string, templateName: string) => {
    setIsConverting(true);
    try {
      const template = templates.find(tpl => tpl.name === templateName) || templates[0];
      
      const file = await remark()
        .use(gfm)
        .use(remarkMath)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeKatex)
        .use(rehypeHighlight)
        .use(rehypeStringify, { allowDangerousHtml: true })
        .process(md);

      const contentHtml = String(file);
      
      // 完整HTML文件（用于下载）
      const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${t('exportedDocTitle')}</title>
<style>${template.css}</style>
</head>
<body>
${contentHtml}
</body>
</html>`;

      // 预览用：用完整 HTML 文档 + iframe srcdoc 隔离，避免 CSS 污染主应用
      const contentOnlyHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">
<style>
* { box-sizing: border-box; }
${template.css}
pre { overflow-x: auto; } code { word-break: break-word; }
img { max-width: 100%; }
table { max-width: 100%; overflow-x: auto; display: block; }
</style>
</head>
<body>
${contentHtml}
</body>
</html>`;
      
      setHtmlOutput(fullHtml);
      setContentHtml(contentHtml);
      setPreviewHtml(contentOnlyHtml);
    } catch (error) {
      console.error('转换失败:', error);
    } finally {
      setIsConverting(false);
    }
  };

  useEffect(() => {
    convertMarkdown(markdown, selectedTemplate);
  }, [markdown, selectedTemplate]);

  const handleCopyHtml = async () => {
    try {
      // 只复制 body 内容和样式，适合公众号粘贴（使用原始 template.css，含 body）
      const template = templates.find(tpl => tpl.name === selectedTemplate) || templates[0];
      const copyContent = `
        <style>${template.css}</style>
        <div class="markdown-body">
          ${contentHtml}
        </div>
      `;
      
      await navigator.clipboard.writeText(copyContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([htmlOutput], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setMarkdown(text);
    } catch (error) {
      console.error('粘贴失败:', error);
    }
  };

  const handleClear = () => {
    setMarkdown('');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl min-w-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">{t('pageTitle')}</h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t('pageDescription')}
        </p>
      </div>

      {/* 工具栏 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 min-w-0">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">{t('outputStyleLabel')}</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-w-0"
            >
              {templates.map(template => (
                <option key={template.name} value={template.name}>
                  {t(templateLabelKeys[template.name] ?? template.name)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 min-w-0 shrink-0">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">{t('viewModeLabel')}</label>
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1.5 text-sm ${viewMode === 'edit' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
              >
                <Edit className="h-4 w-4 inline mr-1" />
                {t('editTab')}
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 text-sm ${viewMode === 'split' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
              >
                <Code className="h-4 w-4 inline mr-1" />
                {t('splitTab')}
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 text-sm ${viewMode === 'preview' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
              >
                <Eye className="h-4 w-4 inline mr-1" />
                {t('previewTab')}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <button
              onClick={handlePaste}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md flex items-center gap-1 text-sm"
            >
              <Clipboard className="h-4 w-4" />
              {t('pasteButton')}
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md flex items-center gap-1 text-sm"
            >
              {t('clearButton')}
            </button>
            <button
              onClick={handleCopyHtml}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center gap-1 text-sm"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? t('copiedLabel') : t('copyHtmlLabel')}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center gap-1 text-sm"
            >
              <Download className="h-4 w-4" />
              {t('exportHtmlLabel')}
            </button>
          </div>
        </div>

        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {t(templateDescKeys[selectedTemplate] ?? '')}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        {/* 编辑器 */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`min-w-0 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700 ${viewMode === 'edit' ? 'lg:col-span-2' : ''}`}>
            <div className="border-b border-gray-200 dark:border-gray-600 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{t('editorLabel')}</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                {t('charCount', { count: markdown.length })}
              </span>
            </div>
            <textarea
              ref={editorRef}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full min-h-[400px] h-[50vh] lg:h-[600px] p-4 font-mono text-sm resize-none focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder={t('editorPlaceholder')}
              spellCheck="false"
            />
          </div>
        )}

        {/* 预览区 */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`min-w-0 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700 ${viewMode === 'preview' ? 'lg:col-span-2' : ''}`}>
            <div className="border-b border-gray-200 dark:border-gray-600 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 flex items-center gap-2 shrink-0">
              <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('previewLabel')}</span>
            </div>
            <iframe
              srcDoc={previewHtml}
              className="w-full min-h-[400px] h-[50vh] lg:h-[600px] border-0 bg-white"
              sandbox="allow-same-origin"
              title={t('previewTitle')}
            />
          </div>
        )}
      </div>

      {/* 语法提示 */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <Palette className="h-4 w-4" />
          {t('syntaxSupportTitle')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div>{t('syntaxHeading')}</div>
          <div>{t('syntaxBoldItalic')}</div>
          <div>{t('syntaxList')}</div>
          <div>{t('syntaxLinkImage')}</div>
          <div>{t('syntaxQuote')}</div>
          <div>{t('syntaxCode')}</div>
          <div>{t('syntaxTable')}</div>
          <div>{t('syntaxDivider')}</div>
          <div>{t('syntaxTaskList')}</div>
          <div>{t('syntaxStrikethrough')}</div>
          <div>{t('syntaxMath')}</div>
          <div>{t('syntaxHighlight')}</div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownConverter;
