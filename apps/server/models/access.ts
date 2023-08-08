import { Schema, model } from "mongoose";

const accessTokenSchema = new Schema({
    accessToken: {
        type: String,
        required: true
    }
})

export const AccessTokenModel = model('Token', accessTokenSchema)
