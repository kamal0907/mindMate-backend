import { Schema, model } from 'mongoose'

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    googleId: {
        type: String,
        required: true,
        unique: true
    }
},
    { timestamps: ture }
);

const User = model('User', userSchema)

export default User;