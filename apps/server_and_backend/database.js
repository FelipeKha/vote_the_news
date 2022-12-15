import mongoose from "mongoose";

import articleSchema from './models/article.js';
import userSchema from './models/user.js';
import voteSchema from './models/vote.js'
import mongoErrorsHandler from "./utils/mongoErrorsHandler.js";
import {
    NoArticleWithThisIDError,
    NoArticleWithThisUrlError,
    NoUserOrArticleWithIDError
} from "./errors.js";


class Database {
    constructor(databaseUrl, articleSchema, userSchema, voteSchema) {
        this.databaseUrl = databaseUrl;
        this.articleSchema = articleSchema;
        this.userSchema = userSchema;
        this.voteSchema = voteSchema;
        this.conn
        this.articleModel;
        this.userModel;
        this.voteModel;

        // this.conn = mongoose.createConnection(this.databaseUrl);
        // this.conn.on('error', (e) => mongoErrorsHandler(e));
        // this.articleModel = this.conn.model('Article', this.articleSchema);
    }

    async connectToDatabase() {
        // await mongoose.connect(this.databaseUrl);
        this.conn = await mongoose.createConnection();
        await this.conn.openUri(this.databaseUrl, { autoIndex: false });
        // const conn = mongoose.createConnection(this.databaseUrl, { useNewUrlParser: true });
        this.conn.on('error', (e) => mongoErrorsHandler(e));
        // conn.catch(e => console.log('got the error'));
        return this.conn;
    }

    associateModelToConnection() {
        this.articleModel = this.conn.model('Article', this.articleSchema);
        this.userModel = this.conn.model('User', this.userSchema);
        this.voteModel = this.conn.model('Vote', this.voteSchema);
        return this.articleModel;
    }

    async loadAllArticlesArray() {
        const articlesArray = this.articleModel.find({});
        return articlesArray;
    }

    async loadAllArticlesArraySortedByDates() {
        const articlesArray = this.articleModel.find({})
            .populate('author', 'nameDisplayed')
            .populate('numUpVotes')
            .sort({ postTime: -1 });
        return articlesArray;
    }

    async loadArticlesArrayInfiniteScroll(lastPostTime) {
        let articlesArray
        if (lastPostTime === '') {
            articlesArray = this.articleModel.find({})
                .populate('author', 'nameDisplayed')
                .populate('numUpVotes')
                .sort({ postTime: -1 })
                .limit(7);
        } else {
            articlesArray = this.articleModel.find({ postTime: { $lt: lastPostTime } })
                .populate('author', 'nameDisplayed')
                .populate('numUpVotes')
                .sort({ postTime: -1 })
                .limit(7);
        }
        return articlesArray;
    }

    async loadMyArticlesArray(userId, lastPostTime) {
        let articlesArray
        if (lastPostTime === '') {
            articlesArray = this.articleModel.find({ author: userId })
                .populate('author', 'nameDisplayed')
                .populate('numUpVotes')
                .sort({ postTime: -1 })
                .limit(20);
        } else {
            articlesArray = this.articleModel.find({ author: userId, postTime: { $lt: lastPostTime } })
                .populate('author', 'nameDisplayed')
                .populate('numUpVotes')
                .sort({ postTime: -1 })
                .limit(20);
        }
        return articlesArray;
    }

    async loadMyVotesArray(userId, lastPostTime) {
        let votesArray
        if (lastPostTime === '') {
            votesArray = this.voteModel.find({
                author: userId,
                status: true
            })
                .populate({
                    path: 'article',
                    populate: [
                        {
                            path: 'author',
                            select: 'nameDisplayed'
                        },
                        {
                            path: 'numUpVotes'
                        }
                    ]
                })
                .sort({ postTime: -1 })
                .limit(20);
        } else {
            votesArray = this.voteModel.find({
                author: userId,
                status: true,
                postTime: { $lt: lastPostTime }
            })
                .populate({
                    path: 'article',
                    populate: [
                        {
                            path: 'author',
                            select: 'nameDisplayed'
                        },
                        {
                            path: 'numUpVotes'
                        }
                    ]
                })
                .sort({ postTime: -1 })
                .limit(20);
        }
        return votesArray;
    }

    async saveAllArticlesArray(newArticleArray) {
        await this.articleModel.deleteMany({});
        try {
            await this.articleModel.insertMany(newArticleArray);
        } catch (e) {
            mongoErrorsHandler(e);
        }
    }

    async saveNewArticle(newArticle) {
        const newArticleDocument = new this.articleModel(newArticle);
        let articleSaved
        try {
            articleSaved = await newArticleDocument.save();
        } catch (e) {
            mongoErrorsHandler(e);
        }
        return articleSaved;
    }

    async loadArticleWithID(id) {
        let article;
        try {
            article = await this.articleModel.findById(id);
        } catch (e) {
            mongoErrorsHandler(e);
        }
        if (article === null) {
            throw new NoArticleWithThisIDError('There is no article with this id');
        }
        return article;
    }

    async loadArticleWithUrl(url) {
        let article;
        try {
            article = await this.articleModel.findOne({ url: url });
        } catch (e) {
            mongoErrorsHandler(e);
        }
        if (article === null) {
            throw new NoArticleWithThisUrlError('There is no article wih this url')
        }
        return article;
    }

    async saveModifiedArticle(modifiedArticle) {
        let article;
        try {
            article = await this.articleModel.findByIdAndUpdate(
                modifiedArticle._id,
                modifiedArticle,
                { new: true, runValidators: true });
        } catch (e) {
            mongoErrorsHandler(e);
        }
        if (article === null) {
            throw new NoArticleWithThisIDError('There is no article wih this url')
        }
        return article;
    }

    async upVote(userId, articleId) {
        let upVote;
        try {
            upVote = await this.voteModel.findOne({ author: userId, article: articleId });
        } catch (e) {
            throw e;
        }
        if (upVote !== null) {
            let newUpVoteStatus
            upVote.status ? newUpVoteStatus = false : newUpVoteStatus = true;
            const updatedUpVote = await this.voteModel.findByIdAndUpdate(
                upVote._id,
                { status: newUpVoteStatus },
                { new: true }
            )
            return updatedUpVote;
        } else {
            const articleCount = await this.articleModel.countDocuments({ _id: articleId });
            const userCount = await this.userModel.countDocuments({ _id: userId });
            if (articleCount !== 0 && userCount !== 0) {
                const newUpVoteDocument = new this.voteModel({
                    status: true,
                    author: userId,
                    article: articleId
                })
                let newUpVote;
                try {
                    newUpVote = await newUpVoteDocument.save();
                } catch (e) {
                    throw e;
                }
                return newUpVote;
            } else {
                throw new NoUserOrArticleWithIDError('No article and/or user with id provided');
            }

        }
    }

    async loadAllUserPostsArray(userId) {
        const userPosts = await this.userModel.findById(userId)
            .populate('articlesPosted');
        return userPosts;
    }

    async loadAllUserUpVotesArray(userId) {
        const userUpVotes = await this.userModel.findById(userId)
            .populate({
                path: 'articlesUpVoted',
                populate: { path: 'article' }
            });
        console.log(userUpVotes);
        return userUpVotes;
    }

    async deleteArticle(id) {
        const articleDeleted = await this.articleModel.findByIdAndDelete(id)
    }

    async createNewUserDocument(
        firstName,
        lastName,
        nameDisplayed,
        username,
        password
    ) {
        const user = await this.userModel.register(
            new this.userModel({ username: username }),
            password
        )
        user.firstName = firstName;
        user.lastName = lastName || "";
        user.nameDisplayed = nameDisplayed;
        const userSaved = await user.save()
        return userSaved;
    }

    async saveUser(userDocument) {
        const user = await userDocument.save();
        return user;
    }

    async loadUserWithId(userId) {
        const user = await this.userModel.findById(userId);
        return user;
    }

    async loadUserWithUsername(username) {
        const user = await this.userModel.find({ "username": username });
        return user;
    }
}

export default Database;


// const databaseUrl = 'mongodb://localhost:27017/vote-the-news';
// const database = new Database(databaseUrl, articleSchema, userSchema, voteSchema);
// await database.connectToDatabase();
// database.associateModelToConnection();
// const articlesArray = await database.loadArticlesArrayInfiniteScroll("");
// console.log(articlesArray);
// const allArticles = await database.loadAllArticlesArray();
// console.log(allArticles);