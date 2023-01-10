import mongoose from "mongoose";
import passportLocalMongoose from 'passport-local-mongoose';

const Session = new mongoose.Schema({
    refreshToken: {
        type: String,
        default: ""
    }
})

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String
        },
        lastName: {
            type: String
        },
        nameDisplayed: {
            type: String,
            unique: true
        },
        signUpTime: {
            type: Date,
            default: Date.now,
            required: true
        },
        authStrategy: {
            type: String,
            default: "local"
        },
        refreshToken: {
            type: [Session]
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

userSchema.set("toJSON", {
    transform: (doc, ret, options) => {
        delete ret.refreshToken;
        return ret;
    }
})

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

userSchema.virtual('notificationUpvotes', {
    ref: 'NotificationUpvote',
    localField: '_id',
    foreignField: 'author',
    match: { active: true }
});

userSchema.plugin(passportLocalMongoose);

export default userSchema;