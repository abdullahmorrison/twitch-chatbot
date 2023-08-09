import  { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { AppRouter } from '../../server/server'

export const trpcClient = createTRPCProxyClient<AppRouter>({
    links: [ httpBatchLink({ url: 'https://chatbot-server.up.railway.app' }) ]
})
