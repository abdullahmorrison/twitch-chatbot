import { initTRPC } from '@trpc/server';
import { createExpressMiddleware } from '@trpc/server/adapters/express'

import express from 'express'

const t = initTRPC.create()

const appRouter = t.router({
    hello: t.procedure.query(() => {
        return 'hello'
    })
})

const app = express()

app.use('/', createExpressMiddleware({ router: appRouter }))

app.listen(3000, () => {
    console.log('listening on port 3000')
})
