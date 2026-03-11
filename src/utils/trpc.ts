import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import type { Router } from '../server/trpc';

export const trpc = createTRPCReact<Router>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/trpc',
    }),
  ],
});
