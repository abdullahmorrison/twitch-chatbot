import { LinkModel } from './models/link';
import { initTRPC } from '@trpc/server';
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import 'dotenv/config'
import { connect } from 'mongoose'
import { AccessTokenModel } from './models/access'
import { UserModel } from './models/user'
import cors from 'cors'
import { z } from 'zod'

import express from 'express'

const t = initTRPC.create()

const appRouter = t.router({
    accessToken: t.procedure.query(async ()=>{
        return await AccessTokenModel.find()
    }),
    accessTokenUpdate: t.procedure.input(
        z.string()
    ).mutation(async req=>{
        return AccessTokenModel.findOneAndUpdate({}, { token: req.input })
    }),
    
    linkList: t.procedure.query(async ()=>{
        return await LinkModel.find()
    }),
    linkCreate: t.procedure.input(z.string()).mutation(async req=>{
        if(await LinkModel.findOne({ url: req.input })) return

        const link = new LinkModel({ url: req.input })
        return await link.save()
    }),
    linkRandom: t.procedure.query(async ()=>{
        const links = await LinkModel.find()
        return links[Math.floor(Math.random() * links.length)]
    }),
    linkRandomUnlabelled: t.procedure.query(async ()=>{
        const links = await LinkModel.find({ safteyStatus: 'unknown' })
        return links[Math.floor(Math.random() * links.length)]
    }),
    linkUpdateSafetyStatus: t.procedure.input(
        z.object({
            id: z.string(),
            safetyStatus: z.enum(['safe', 'unsafe', 'unknown'])
        })
    ).mutation(async req => {
        const link = await LinkModel.findById(req.input.id);
        if (!link) throw new Error('link not found');
        link.safteyStatus = req.input.safetyStatus as 'safe' | 'unsafe' | 'unknown';
        return await link.save();
    }),
    linkDelete: t.procedure.input(
        z.string()
    ).mutation(async req=>{
        const result = await LinkModel.findOneAndRemove({ url: req.input })
        if(result) return true
        return false
    }),

    userList: t.procedure.query(async ()=>{
        const users = await UserModel.find()
        return users.filter(user=>user.isBlacklisted)
    }),
    userBlacklistCreate: t.procedure.input(
        z.string()
    ).mutation(async req =>{
        const user = new UserModel({ user: req.input, isBlacklisted: true })
        return await user.save()
    }),
    userBlacklistUpdate: t.procedure.input(
        z.string()
    ).mutation(async req=>{
        const user = await UserModel.findOne({ user: req.input })
        if(!user) throw new Error('user not found')
        user.isBlacklisted = !user.isBlacklisted
        return await user.save()
    })
})

const app = express()

const whitelist = process.env.CORS_WHITELIST?.split(',')
app.use(cors({
    origin: function (origin: any, callback: any) {
        if (whitelist && whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}))

app.use('/', createExpressMiddleware({ router: appRouter }))

const port = process.env.PORT || 3001
connect(process.env.MONGO_URL as string, { dbName: process.env.DB_NAME })
    .then(()=>{ app.listen(port, ()=>{ console.log(`Server started on port ${port}`) })})
    .catch(err=>{ console.error(err) })

export type AppRouter = typeof appRouter