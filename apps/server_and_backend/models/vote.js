import mongoose from "mongoose";

const voteSchema = mongoose.Schema({
    status: {
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
})

voteSchema.index({ author: 1, article: 1 }, { unique: true })

export default voteSchema;