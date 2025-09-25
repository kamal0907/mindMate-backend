import {Schema, model } from 'mongoose';

const diarySchema = new Schema({
    msg : {
        type : String,
        required : true
    },
    emotions : {
        type : String,
    },
    toggle : {
        type : String,
    }
})

const Diary = model('Diary', diarySchema)

export default Diary;