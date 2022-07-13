import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            unique: true,
            required: true
        },
        postTime: {
            type: Date,
            default: Date.now,
            required: true
        },
        linkPreview: {
            title: String,
            description: String,
            domain: String,
            img: String
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

articleSchema.virtual('numUpVotes', {
    ref: 'Vote',
    localField: '_id',
    foreignField: 'article',
    match: { status: true },
    count: true
})

// const Article = mongoose.model('Article', articleSchema);

// export default Article;
export default articleSchema;