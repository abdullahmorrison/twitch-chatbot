import { Schema, model } from "mongoose";

const accessTokenSchema = new Schema({
    token: {
        type: String,
        required: true
    }
})

export const AccessTokenModel = model('Token', accessTokenSchema)
