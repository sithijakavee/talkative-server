import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
    {
        userEmail: {
            type: String,
            required: true,
            unique: true,
        },
        plan: {
            type: String,
            required: true,
        },
        expire:{
            type: Date,
            required: true,
        }
    },
    {timestamps: true}
)


const Subscription =   mongoose.model('Subscription', subscriptionSchema)
export default Subscription