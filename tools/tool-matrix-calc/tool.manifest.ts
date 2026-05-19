import { defineToolManifest } from '@toolbox/tool-registry'
import { Sigma } from 'lucide-react'

const toolMatrixCalcManifest = defineToolManifest({
  id: 'tool-matrix-calc',
  path: '/matrix-calc',
  namespace: 'toolMatrixCalc',
  mode: 'client',
  categoryKey: 'learn',
  icon: Sigma,
  keywords: [
    '矩阵',
    '线性代数',
    '矩阵运算',
    'matrix',
    'linear algebra',
    '行列式',
    '转置',
    '逆矩阵',
  ],
  meta: {
    zh: {
      title: '矩阵计算器',
      description:
        '常用矩阵运算：加减、乘法、转置、行列式、逆矩阵、秩、迹；支持 2x2 ~ 10x10',
    },
    en: {
      title: 'Matrix Calculator',
      description:
        'Linear-algebra essentials: add/sub/mul, transpose, determinant, inverse, rank, trace; 2x2 to 10x10',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolMatrixCalcManifest
