import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import DomainMx from '../DomainMx';

i18n.init({
  lng: 'zh',
  resources: {
    zh: {
      translation: {}
    }
  }
});

global.fetch = vi.fn();

describe('DomainMx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DomainMx />
      </I18nextProvider>
    );
    
    expect(screen.getByPlaceholderText(/输入域名/i)).toBeInTheDocument();
    expect(screen.getByText('查询')).toBeInTheDocument();
  });

  it('handles successful MX query', async () => {
    const mockResponse = {
      domain: 'example.com',
      mxRecords: [
        {
          exchange: 'mail1.example.com',
          priority: 10,
          ips: ['192.0.2.1'],
          responseTime: 50,
          reachable: true
        },
        {
          exchange: 'mail2.example.com',
          priority: 20,
          ips: ['192.0.2.2'],
          responseTime: 45,
          reachable: true
        }
      ],
      hasMx: true,
      timestamp: new Date().toISOString()
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <I18nextProvider i18n={i18n}>
        <DomainMx />
      </I18nextProvider>
    );

    const input = screen.getByPlaceholderText(/输入域名/i);
    const button = screen.getByText('查询');

    fireEvent.change(input, { target: { value: 'example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/找到 2 条 MX 记录/i)).toBeInTheDocument();
      expect(screen.getByText('mail1.example.com')).toBeInTheDocument();
      expect(screen.getByText('mail2.example.com')).toBeInTheDocument();
      expect(screen.getByText('优先级 10')).toBeInTheDocument();
      expect(screen.getByText('优先级 20')).toBeInTheDocument();
    });
  });

  it('handles no MX records', async () => {
    const mockResponse = {
      domain: 'example.com',
      mxRecords: [],
      hasMx: false,
      timestamp: new Date().toISOString(),
      suggestions: ['该域名未配置 MX 记录']
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <I18nextProvider i18n={i18n}>
        <DomainMx />
      </I18nextProvider>
    );

    const input = screen.getByPlaceholderText(/输入域名/i);
    const button = screen.getByText('查询');

    fireEvent.change(input, { target: { value: 'example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/未找到 MX 记录/i)).toBeInTheDocument();
    });
  });

  it('shows configuration suggestions', async () => {
    const mockResponse = {
      domain: 'example.com',
      mxRecords: [
        {
          exchange: 'mail.example.com',
          priority: 10,
          ips: ['192.0.2.1'],
          responseTime: 50
        }
      ],
      hasMx: true,
      timestamp: new Date().toISOString(),
      suggestions: ['建议配置至少 2 个 MX 记录以提高可用性']
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <I18nextProvider i18n={i18n}>
        <DomainMx />
      </I18nextProvider>
    );

    const input = screen.getByPlaceholderText(/输入域名/i);
    const button = screen.getByText('查询');

    fireEvent.change(input, { target: { value: 'example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/配置建议/i)).toBeInTheDocument();
      expect(screen.getByText(/建议配置至少 2 个 MX 记录/i)).toBeInTheDocument();
    });
  });
});
