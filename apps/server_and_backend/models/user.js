import mongoose from "mongoose";
import passportLocalMongoose from 'passport-local-mongoose';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        signUpTime: {
            type: Date,
            default: Date.now,
            required: true
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

userSchema.virtual('articlesPosted', {
    ref: 'Article',
    localField: '_id',
    foreignField: 'author'
})

userSchema.virtual('articlesUpVoted', {
    ref: 'Vote',
    localField: '_id',
    foreignField: 'author',
    match: { status: true }
})

userSchema.plugin(passportLocalMongoose);

export default userSchema;