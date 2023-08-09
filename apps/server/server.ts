import { initTRPC } from '@trpc/server';
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import 'dotenv/config'
import { connect } from 'mongoose'
import { AccessTokenModel } from './models/access'
import { UserModel } from './models/user'

import express from 'express'

const t = initTRPC.create()

const appRouter = t.router({
    accessToken: t.procedure.query(async ()=>{
        return await AccessTokenModel.find()
    }),
    accessTokenUpdate: t.procedure.input(token=>{
        if(typeof token === 'string') return token
        throw new Error('invalid token')
    }).mutation(async req=>{
        return AccessTokenModel.findByIdAndUpdate(req.input, { accessToken: req.input }, { upsert: true, new: true })
    }),

    userList: t.procedure.query(async ()=>{
        const users = await UserModel.find()
        return users.filter(user=>user.isBlacklisted)
    }),
    userBlacklistCreate: t.procedure.input(username=>{
        if(typeof username === 'string') return username
        throw new Error('invalid user')
    }).mutation(async req =>{
        const user = new UserModel({ user: req.input, isBlacklisted: true })
        return await user.save()
    }),
    userBlacklistUpdate: t.procedure.input(username=>{
        if(typeof username === 'string') return username
        throw new Error('invalid user')
    }).mutation(async req=>{
        const user = await UserModel.findOne({ user: req.input })
        if(!user) throw new Error('user not found')
        user.isBlacklisted = !user.isBlacklisted
        return await user.save()
    })
})

const app = express()

app.use('/', createExpressMiddleware({ router: appRouter }))

const port = process.env.PORT || 3000
connect(process.env.MONGO_URL as string, { dbName: process.env.DB_NAME })
    .then(()=>{ app.listen(port, ()=>{ console.log(`Server started on port ${port}`) })})
    .catch(err=>{ console.error(err) })

export type AppRouter = typeof appRouter