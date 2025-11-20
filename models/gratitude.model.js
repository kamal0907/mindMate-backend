import mongoose, { Schema, model } from "mongoose";
import User from './user.model.js'

const gratitudeSchema = new Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : User,
        required : true,
        index : true
    },
    content : { type : String, required : true, trim : true, maxLength : 200 },
    // createdAt : { type : Date, default : Date.now, index : true},
    // updatedAt : { type : Date, default : Date.now}
}, {
    timestamps : true
})

gratitudeSchema.virtual('created').get( function () {
    if (!this.createdAt)
        return null;

    const d = new Date(this.createdAt)

    const options = { weekday : "long", year : "numeric", month : "long", date : "numeric"}

    return {
        dayName : d.toLocaleDateString( undefined, {weekday : "long"}),

        formattedDate : d.toLocaleDateString ( undefined, { date : "numeric", month : "long", year : "numeric"}),

        short : d.toLocaleDateString()
    };
})

gratitudeSchema.set("toJSON", {virtuals : true});
gratitudeSchema.set("toObject", {virtuals : true});

const Gratitude = model ('Gratitude', gratitudeSchema);

export default Gratitude