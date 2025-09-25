import {Schema, model} from 'mongoose'

const userSchema = new Schema ( {
    name : {
        type : String,
        required : ture
    },
    email : {
        type : String,
        required : ture,
        unique : true
    }
}, {timestamps : ture}
);

const User = model('User', userSchema)

export default User;