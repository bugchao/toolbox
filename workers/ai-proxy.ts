export interface Env {
  DEEPSEEK_API_KEY: string;
  OPENAI_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 处理CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: '仅支持POST请求' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    try {
      const { message, model = 'deepseek' } = await request.json() as {
        message: string;
        model?: 'deepseek' | 'openai';
      };

      if (!message) {
        return new Response(JSON.stringify({ error: '消息内容不能为空' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      let response: Response;

      if (model === 'deepseek') {
        response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: '你是一个有用的助手' },
              { role: 'user', content: message },
            ],
            temperature: 0.7,
            stream: false,
          }),
        });
      } else {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: '你是一个有用的助手' },
              { role: 'user', content: message },
            ],
            temperature: 0.7,
            stream: false,
          }),
        });
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API请求失败: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      return new Response(JSON.stringify({
        success: true,
        response: aiResponse,
        model,
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
