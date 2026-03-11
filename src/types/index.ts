export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  category: '实用工具' | '查询工具' | '资讯工具' | '研发工具';
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  url: string;
  category: '科技' | '体育' | 'AI' | 'OpenClaw' | 'MCP' | '国际';
}

export interface WeatherInfo {
  city: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    description: string;
  }>;
}

export interface ZipCodeInfo {
  code: string;
  province: string;
  city: string;
  district: string;
  address: string;
}
