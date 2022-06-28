import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
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
    numberOfVotes: {
        type: Number,
        required: true
    },
    linkPreview: {
        title: String,
        description: String,
        domain: String,
        img: String
    }

})

// const Article = mongoose.model('Article', articleSchema);

// export default Article;
export default articleSchema;