import { Schema, model } from "mongoose";

const linkSchema = new Schema({
    url: {
        type: String,
        required: true,
        unique: true
    }
})

export const LinkModel = model('Link', linkSchema)