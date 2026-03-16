import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import DnsNxdomain from '../DnsNxdomain';

i18n.init({
  lng: 'zh',
  resources: {
    zh: {
      translation: {}
    }
  }
});

global.fetch = vi.fn();

describe('DnsNxdomain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DnsNxdomain />
      </I18nextProvider>
    );
    
    expect(screen.getByPlaceholderText(/输入域名/i)).toBeInTheDocument();
    expect(screen.getByText('检测')).toBeInTheDocument();
  });

  it('handles existing domain', async () => {
    const mockResponse = {
      domain: 'example.com',
      exists: true,
      nxdomain: false,
      responseTime: 50,
      timestamp: new Date().toISOString()
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <I18nextProvider i18n={i18n}>
        <DnsNxdomain />
      </I18nextProvider>
    );

    const input = screen.getByPlaceholderText(/输入域名/i);
    const button = screen.getByText('检测');

    fireEvent.change(input, { target: { value: 'example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/域名存在/i)).toBeInTheDocument();
    });
  });

  it('handles NXDOMAIN response', async () => {
    const mockResponse = {
      domain: 'nonexistent.example',
      exists: false,
      nxdomain: true,
      errorCode: 'ENOTFOUND',
      timestamp: new Date().toISOString(),
      suggestions: ['域名可能未注册', '域名拼写可能有误']
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <I18nextProvider i18n={i18n}>
        <DnsNxdomain />
      </I18nextProvider>
    );

    const input = screen.getByPlaceholderText(/输入域名/i);
    const button = screen.getByText('检测');

    fireEvent.change(input, { target: { value: 'nonexistent.example' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/NXDOMAIN - 域名不存在/i)).toBeInTheDocument();
      expect(screen.getByText(/域名可能未注册/i)).toBeInTheDocument();
    });
  });

  it('shows DNS servers', async () => {
    const mockResponse = {
      domain: 'example.com',
      exists: true,
      nxdomain: false,
      timestamp: new Date().toISOString(),
      dnsServers: ['8.8.8.8', '8.8.4.4']
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <I18nextProvider i18n={i18n}>
        <DnsNxdomain />
      </I18nextProvider>
    );

    const input = screen.getByPlaceholderText(/输入域名/i);
    const button = screen.getByText('检测');

    fireEvent.change(input, { target: { value: 'example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('8.8.8.8')).toBeInTheDocument();
      expect(screen.getByText('8.8.4.4')).toBeInTheDocument();
    });
  });
});
