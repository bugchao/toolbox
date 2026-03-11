import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const router = t.router({
  // 邮编查询
  zipcode: t.procedure
    .input(z.object({ q: z.string() }))
    .query(({ input }) => {
      const q = input.q || '';
      if (/^\d{6}$/.test(q)) {
        return {
          code: q,
          province: '北京市',
          city: '北京市',
          district: '海淀区',
          address: '北京市海淀区相关地址'
        };
      } else {
        return {
          code: '100080',
          province: '北京市',
          city: '北京市',
          district: '海淀区',
          address: q
        };
      }
    }),
  
  // AI聊天
  aiChat: t.procedure
    .input(z.object({ message: z.string(), model: z.enum(['deepseek', 'openai']).default('deepseek') }))
    .mutation(async ({ input }) => {
      try {
        // 调用Cloudflare Workers
        const response = await fetch('https://your-worker.your-subdomain.workers.dev', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: input.message,
            model: input.model
          }),
        });
        
        if (!response.ok) {
          throw new Error('AI服务调用失败');
        }
        
        const data = await response.json();
        return {
          success: true as const,
          response: data.response,
          error: undefined
        };
      } catch (error) {
        return {
          success: false as const,
          error: error instanceof Error ? error.message : '未知错误',
          response: undefined
        };
      }
    }),
});

export type Router = typeof router;
