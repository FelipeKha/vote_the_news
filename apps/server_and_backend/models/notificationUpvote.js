import mongoose from "mongoose";

const notificationUpvoteSchema = mongoose.Schema({
    active: {
        type: Boolean,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
    }
});

notificationUpvoteSchema.index({ author: 1, article: 1 }, { unique: true });

export default notificationUpvoteSchema;