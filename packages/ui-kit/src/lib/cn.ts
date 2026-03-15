import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 class 字符串，Tailwind 类冲突时后者覆盖（shadcn/ui 风格）
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
