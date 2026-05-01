import { ApiData } from './types'

export function parseOpenApi(jsonInput: string): ApiData | null {
  try {
    const json = JSON.parse(jsonInput)
    const paths = json.paths || {}
    const firstPath = Object.keys(paths)[0]
    if (!firstPath) return null
    
    const firstMethod = Object.keys(paths[firstPath])[0]
    const endpoint = paths[firstPath][firstMethod]
    
    const parameters = (endpoint.parameters || []).map((p: any) => ({
      name: p.name,
      type: p.schema?.type || 'string',
      required: p.required || false,
      description: p.description || '',
      in: p.in
    }))

    const responses = Object.entries(endpoint.responses || {}).map(([code, resp]: [string, any]) => ({
      statusCode: code,
      description: resp.description || '',
      example: JSON.stringify(resp.content?.['application/json']?.example || {}, null, 2)
    }))

    return {
      name: endpoint.summary || endpoint.operationId || firstPath,
      method: firstMethod.toUpperCase(),
      url: firstPath,
      description: endpoint.description || '',
      parameters,
      responses
    }
  } catch {
    return null
  }
}

export function generateMarkdown(apiData: ApiData, t: any): string {
  if (!apiData.name) return ''
  
  let md = `# ${apiData.name}\n\n`
  md += `## Description\n\n${apiData.description || '-'}\n\n`
  md += `## API Information\n\n`
  md += `- **Method**: \`${apiData.method}\`\n`
  md += `- **URL**: \`${apiData.url}\`\n\n`
  
  if (apiData.parameters.length > 0) {
    md += `## Parameters\n\n`
    md += `| Name | Type | Required | Description |\n`
    md += `|------|------|----------|-------------|\n`
    apiData.parameters.forEach(p => {
      md += `| ${p.name} | ${p.type} | ${p.required ? '✓' : '-'} | ${p.description} |\n`
    })
    md += '\n'
  }
  
  if (apiData.responses.length > 0) {
    md += `## Responses\n\n`
    apiData.responses.forEach(r => {
      md += `### ${r.statusCode}\n\n`
      md += `${r.description}\n\n`
      if (r.example) {
        md += '```json\n' + r.example + '\n```\n\n'
      }
    })
  }
  
  return md
}

export function generateHtml(markdown: string): string {
  // 简单的 Markdown 转 HTML
  let html = markdown
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/```json\n([\s\S]+?)\n```/g, '<pre><code>$1</code></pre>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim())
      return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>'
    })
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; }
    h1 { color: #1a202c; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
    h2 { color: #2d3748; margin-top: 30px; }
    h3 { color: #4a5568; }
    code { background: #f7fafc; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
    pre { background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 5px; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    td { padding: 8px; border: 1px solid #e2e8f0; }
    tr:first-child td { background: #f7fafc; font-weight: 600; }
  </style>
</head>
<body>${html}</body>
</html>`
}
