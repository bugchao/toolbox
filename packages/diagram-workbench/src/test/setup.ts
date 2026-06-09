import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'

// antd 用 window.matchMedia 做断点；jsdom 不内置
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined, // 老 API
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  })
}

// antd 的 Select / Tooltip 可能用 ResizeObserver
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  class ResizeObserverShim {
    observe() { /* noop */ }
    unobserve() { /* noop */ }
    disconnect() { /* noop */ }
  }
  ;(window as unknown as { ResizeObserver: typeof ResizeObserverShim }).ResizeObserver = ResizeObserverShim
}
