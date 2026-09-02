import 'dotenv/config'
import  { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { AppRouter } from '../../server/server'

export const trpcClient = createTRPCProxyClient<AppRouter>({
    links: [ httpBatchLink({ url: process.env.SERVER_URL || 'http://127.0.0.1:3001' }) ]
})
