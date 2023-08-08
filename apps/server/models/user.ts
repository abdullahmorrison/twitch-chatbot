import { Schema, model } from "mongoose";

const UserSchema = new Schema({
    user: {
        type: String,
        required: true,
        unique: true
    },
    isBlacklisted: {
        type: Boolean,
        default: false
    }
})

export const UserModel = model('User', UserSchema)