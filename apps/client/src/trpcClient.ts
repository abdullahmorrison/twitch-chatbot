import  { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { AppRouter } from '../../server/server'

export const client = createTRPCProxyClient<AppRouter>({
    links: [ httpBatchLink({ url: 'http://localhost:3000' }) ]
})
