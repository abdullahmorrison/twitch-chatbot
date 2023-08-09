import  { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { AppRouter } from '../../server/server'

export const client = createTRPCProxyClient<AppRouter>({
    links: [ httpBatchLink({ url: 'https://chatbot-server.up.railway.app' }) ]
})
