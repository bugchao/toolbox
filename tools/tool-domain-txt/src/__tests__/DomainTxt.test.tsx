import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import DomainTxt from '../DomainTxt';

i18n.init({
  lng: 'zh',
  resources: {
    zh: {
      translation: {}
    }
  }
});

global.fetch = vi.fn();

describe('DomainTxt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DomainTxt />
      </I18nextProvider>
    );
    
    expect(screen.getByPlaceholderText(/输入域名/i)).toBeInTheDocument();
    expect(screen.getByText('查询')).toBeInTheDocument();
  });

  it('handles successful TXT query with multiple types', async () => {
    const mockResponse = {
      domain: 'example.com',
      txtRecords: [
        {
          value: 'v=spf1 include:_spf.example.com ~all',
          type: 'SPF',
          valid: true
        },
        {
          value: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com',
          type: 'DMARC',
          valid: true
        },
        {
          value: 'google-site-verification=abc123',
          type: 'VERIFICATION'
        }
      ],
      hasTxt: true,
      timestamp: new Date().toISOString(),
      summary: {
        total: 3,
        spf: 1,
        dkim: 0,
        dmarc: 1,
        verification: 1,
        other: 0
      }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <I18nextProvider i18n={i18n}>
        <DomainTxt />
      </I18nextProvider>
    );

    const input = screen.getByPlaceholderText(/输入域名/i);
    const button = screen.getByText('查询');

    fireEvent.change(input, { target: { value: 'example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // 总记录数
      expect(screen.getByText('SPF')).toBeInTheDocument();
      expect(screen.getByText('DMARC')).toBeInTheDocument();
      expect(screen.getByText('VERIFICATION')).toBeInTheDocument();
    });
  });

  it('handles invalid SPF record', async () => {
    const mockResponse = {
      domain: 'example.com',
      txtRecords: [
        {
          value: 'spf1 include:_spf.example.com',
          type: 'SPF',
          valid: false,
          issues: ['SPF 记录必须以 "v=spf1" 开头']
        }
      ],
      hasTxt: true,
      timestamp: new Date().toISOString(),
      summary: {
        total: 1,
        spf: 1,
        dkim: 0,
        dmarc: 0,
        verification: 0,
        other: 0
      }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <I18nextProvider i18n={i18n}>
        <DomainTxt />
      </I18nextProvider>
    );

    const input = screen.getByPlaceholderText(/输入域名/i);
    const button = screen.getByText('查询');

    fireEvent.change(input, { target: { value: 'example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/✗ 无效/i)).toBeInTheDocument();
      expect(screen.getByText(/问题/i)).toBeInTheDocument();
    });
  });

  it('handles no TXT records', async () => {
    const mockResponse = {
      domain: 'example.com',
      txtRecords: [],
      hasTxt: false,
      timestamp: new Date().toISOString()
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <I18nextProvider i18n={i18n}>
        <DomainTxt />
      </I18nextProvider>
    );

    const input = screen.getByPlaceholderText(/输入域名/i);
    const button = screen.getByText('查询');

    fireEvent.change(input, { target: { value: 'example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/未找到 TXT 记录/i)).toBeInTheDocument();
    });
  });
});
