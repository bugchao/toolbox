import React from 'react'
import Editor, { loader, type OnMount } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'

// Bypass Monaco's AMD `loader.js`: it hijacks the global `define`, which collides
// with UMD modules pulled in by jsoncrack-react (e.g. human-format) and throws
// "Can only have one anonymous define call per script file".
//
// Setting `MonacoEnvironment` and feeding `loader.config({ monaco })` makes
// @monaco-editor/react use the locally bundled ESM monaco, never touching
// the global AMD loader.
type MonacoWorkerSelf = typeof self & {
  MonacoEnvironment?: { getWorker: (workerId: string, label: string) => Worker }
}
const _self = self as MonacoWorkerSelf
if (!_self.MonacoEnvironment) {
  _self.MonacoEnvironment = {
    getWorker(_workerId, label) {
      if (label === 'json') return new jsonWorker()
      return new editorWorker()
    },
  }
}
loader.config({ monaco })

interface Props {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  height?: number | string
  tabSize?: number
  ariaLabel?: string
}

const JsonEditor: React.FC<Props> = ({
  value,
  onChange,
  readOnly = false,
  height = 600,
  tabSize = 2,
  ariaLabel,
}) => {
  const handleMount: OnMount = (editor, monacoInst) => {
    monacoInst.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemaValidation: 'error',
      enableSchemaRequest: false,
    })
    if (ariaLabel) editor.updateOptions({ ariaLabel })
  }

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <Editor
        height={height}
        defaultLanguage="json"
        language="json"
        value={value}
        onChange={(v) => onChange?.(v ?? '')}
        onMount={handleMount}
        theme="vs"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          tabSize,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: false,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          renderLineHighlight: readOnly ? 'none' : 'line',
          fixedOverflowWidgets: true,
          lineNumbersMinChars: 3,
        }}
      />
    </div>
  )
}

export default JsonEditor
