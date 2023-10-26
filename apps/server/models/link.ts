import { Schema, model } from "mongoose";

const linkSchema = new Schema({
    url: {
        type: String,
        required: true,
        unique: true
    },
    safteyStatus: {
        type: String,
        required: true,
        enum: ['safe', 'unsafe', 'unknown'],
        default: 'unknown'
    },
    tags: {
        type: [String],
        required: true,
        default: []
    }
})

export const LinkModel = model('Link', linkSchema)