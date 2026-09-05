import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

export interface TerminalHandle {
  write(text: string): void;
  focus(): void;
  size(): { cols: number; rows: number };
  /** 从 display:none 切回可见时必须重测：隐藏期间 xterm 量到的尺寸是 0 */
  fit(): void;
}

interface TerminalViewProps {
  onData(data: string): void;
  onResize(cols: number, rows: number): void;
  className?: string;
}

// ponytail: 终端固定深色，不跟随站点主题。终端配色是有语义的（ANSI 16 色），
// 跟着浅色主题翻转会让 ls / vim / 日志高亮全部错位，得不偿失。
const THEME = {
  background: '#0b1020',
  foreground: '#d6deeb',
  cursor: '#7fdbca',
  selectionBackground: '#1d3b53',
};

const TerminalView = forwardRef<TerminalHandle, TerminalViewProps>(
  ({ onData, onResize, className }, ref) => {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const termRef = useRef<Terminal | null>(null);
    const fitRef = useRef<FitAddon | null>(null);

    // 回调放进 ref：终端只初始化一次，不能因为父组件重渲染就重建
    const onDataRef = useRef(onData);
    const onResizeRef = useRef(onResize);
    onDataRef.current = onData;
    onResizeRef.current = onResize;

    useEffect(() => {
      if (!hostRef.current) return undefined;

      const term = new Terminal({
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: 13,
        cursorBlink: true,
        scrollback: 5000,
        theme: THEME,
      });
      const fit = new FitAddon();
      term.loadAddon(fit);
      term.open(hostRef.current);
      fit.fit();

      term.onData((data) => onDataRef.current(data));
      term.onResize(({ cols, rows }) => onResizeRef.current(cols, rows));

      termRef.current = term;
      fitRef.current = fit;

      const observer = new ResizeObserver(() => {
        try {
          fit.fit();
        } catch {
          /* 容器还没布局好时 fit 会抛，下一次 resize 会再来 */
        }
      });
      observer.observe(hostRef.current);

      return () => {
        observer.disconnect();
        term.dispose();
        termRef.current = null;
        fitRef.current = null;
      };
    }, []);

    useImperativeHandle(ref, () => ({
      write: (text) => termRef.current?.write(text),
      focus: () => termRef.current?.focus(),
      size: () => ({
        cols: termRef.current?.cols ?? 80,
        rows: termRef.current?.rows ?? 24,
      }),
      fit: () => {
        try {
          fitRef.current?.fit();
        } catch {
          /* 容器尺寸还没稳定，下一次 resize 会补上 */
        }
      },
    }));

    return <div ref={hostRef} className={className} style={{ background: THEME.background }} />;
  },
);

TerminalView.displayName = 'TerminalView';

export default TerminalView;
