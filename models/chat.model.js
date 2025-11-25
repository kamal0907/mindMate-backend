import mongoose, {Schema, model} from 'mongoose';

const chatSchema = new Schema({
    message : { type : String, required : true, trim : true, maxLength : 4000}
},{
    timestamps : true
});

const Chat = model ('Chat', chatSchema);

export default Chat;