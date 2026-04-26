import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import DnsNs from '../DnsNs';

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

describe('DnsNs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DnsNs />
      </I18nextProvider>
    );
    
    expect(screen.getByPlaceholderText(/输入域名/i)).toBeInTheDocument();
    expect(screen.getByText('查询')).toBeInTheDocument();
  });

  it('handles successful query', async () => {
    const mockResponse = {
      domain: 'example.com',
      nsRecords: [
        {
          nameserver: 'ns1.example.com',
          ip: ['192.0.2.1'],
          status: 'success',
          responseTime: 50
        }
      ],
      timestamp: new Date().toISOString()
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <I18nextProvider i18n={i18n}>
        <DnsNs />
      </I18nextProvider>
    );

    const input = screen.getByPlaceholderText(/输入域名/i);
    const button = screen.getByText('查询');

    fireEvent.change(input, { target: { value: 'example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('ns1.example.com')).toBeInTheDocument();
      expect(screen.getByText('192.0.2.1')).toBeInTheDocument();
    });
  });

  it('handles query error', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Domain not found' })
    });

    render(
      <I18nextProvider i18n={i18n}>
        <DnsNs />
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

  it('disables query button when input is empty', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DnsNs />
      </I18nextProvider>
    );

    const button = screen.getByText('查询');
    expect(button).toBeDisabled();
  });

  it('supports Enter key to submit', async () => {
    const mockResponse = {
      domain: 'example.com',
      nsRecords: [],
      timestamp: new Date().toISOString()
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <I18nextProvider i18n={i18n}>
        <DnsNs />
      </I18nextProvider>
    );

    const input = screen.getByPlaceholderText(/输入域名/i);
    fireEvent.change(input, { target: { value: 'example.com' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/dns/ns',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ domain: 'example.com' })
        })
      );
    });
  });
});
