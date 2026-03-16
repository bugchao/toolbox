import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import DnsCnameChain from '../DnsCnameChain';

// Mock i18n
i18n.init({
  lng: 'zh',
  resources: {
    zh: {
      translation: {}
    }
  }
});

// Mock fetch
global.fetch = vi.fn();

describe('DnsCnameChain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DnsCnameChain />
      </I18nextProvider>
    );
    
    expect(screen.getByPlaceholderText(/输入域名/i)).toBeInTheDocument();
    expect(screen.getByText('查询')).toBeInTheDocument();
  });

  it('handles successful query with chain', async () => {
    const mockResponse = {
      domain: 'www.example.com',
      chain: [
        {
          domain: 'www.example.com',
          cname: 'cdn.example.com',
          ttl: 300,
          responseTime: 50
        },
        {
          domain: 'cdn.example.com',
          cname: 'cdn-provider.net',
          ttl: 600,
          responseTime: 45
        }
      ],
      finalTarget: 'cdn-provider.net',
      hasLoop: false,
      timestamp: new Date().toISOString()
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <I18nextProvider i18n={i18n}>
        <DnsCnameChain />
      </I18nextProvider>
    );

    const input = screen.getByPlaceholderText(/输入域名/i);
    const button = screen.getByText('查询');

    fireEvent.change(input, { target: { value: 'www.example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('www.example.com')).toBeInTheDocument();
      expect(screen.getByText('cdn.example.com')).toBeInTheDocument();
      expect(screen.getByText('cdn-provider.net')).toBeInTheDocument();
    });
  });

  it('detects circular reference', async () => {
    const mockResponse = {
      domain: 'loop.example.com',
      chain: [
        {
          domain: 'loop.example.com',
          cname: 'loop2.example.com',
          responseTime: 50
        }
      ],
      hasLoop: true,
      timestamp: new Date().toISOString()
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <I18nextProvider i18n={i18n}>
        <DnsCnameChain />
      </I18nextProvider>
    );

    const input = screen.getByPlaceholderText(/输入域名/i);
    const button = screen.getByText('查询');

    fireEvent.change(input, { target: { value: 'loop.example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/检测到循环引用/i)).toBeInTheDocument();
    });
  });

  it('handles no CNAME records', async () => {
    const mockResponse = {
      domain: 'example.com',
      chain: [],
      finalTarget: 'example.com',
      hasLoop: false,
      timestamp: new Date().toISOString()
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <I18nextProvider i18n={i18n}>
        <DnsCnameChain />
      </I18nextProvider>
    );

    const input = screen.getByPlaceholderText(/输入域名/i);
    const button = screen.getByText('查询');

    fireEvent.change(input, { target: { value: 'example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/该域名没有 CNAME 记录/i)).toBeInTheDocument();
    });
  });

  it('handles query error', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Domain not found' })
    });

    render(
      <I18nextProvider i18n={i18n}>
        <DnsCnameChain />
      </I18nextProvider>
    );

    const input = screen.getByPlaceholderText(/输入域名/i);
    const button = screen.getByText('查询');

    fireEvent.change(input, { target: { value: 'invalid.domain' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/查询失败/i)).toBeInTheDocument();
      expect(screen.getByText('Domain not found')).toBeInTheDocument();
    });
  });
});
