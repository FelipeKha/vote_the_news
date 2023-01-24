import mongoose from "mongoose";

import mongoErrorsHandler from "./utils/mongoErrorsHandler.js";
import {
    NoArticleWithThisIDError,
    NoArticleWithThisUrlError,
    NoUserOrArticleWithIDError,
    UserNotAuthorError
} from "./errors.js";


class Database {
    constructor(databaseUrl, articleSchema, userSchema, voteSchema, notificationUpvoteSchema) {
        this.databaseUrl = databaseUrl;
        this.articleSchema = articleSchema;
        this.userSchema = userSchema;
        this.voteSchema = voteSchema;
        this.notificationUpvoteSchema = notificationUpvoteSchema;
        this.conn;
        this.articleModel;
        this.userModel;
        this.voteModel;
        this.loadLimit = 7;

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
        this.notificationUpvoteModel = this.conn.model('NotificationUpvote', this.notificationUpvoteSchema);
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
        let articlesArray;
        let lastArticle = false;
        if (lastPostTime === '') {
            articlesArray = await this.articleModel.find({})
                .populate('author', 'nameDisplayed')
                .populate('numUpVotes')
                .sort({ postTime: -1 })
                .limit(this.loadLimit + 1);
        } else {
            articlesArray = await this.articleModel.find({ postTime: { $lt: lastPostTime } })
                .populate('author', 'nameDisplayed')
                .populate('numUpVotes')
                .sort({ postTime: -1 })
                .limit(this.loadLimit + 1);
        }
        if (articlesArray.length < this.loadLimit + 1) {
            lastArticle = true;
        }
        return {
            "articlesArray": articlesArray.slice(0, this.loadLimit),
            "lastArticle": lastArticle
        };
    }

    async loadMyArticlesArray(userId, lastPostTime) {
        let articlesArray;
        let lastArticle = false;
        if (lastPostTime === '') {
            articlesArray = await this.articleModel.find({ author: userId })
                .populate('author', 'nameDisplayed')
                .populate('numUpVotes')
                .sort({ postTime: -1 })
                .limit(this.loadLimit + 1);
        } else {
            articlesArray = await this.articleModel.find({ author: userId, postTime: { $lt: lastPostTime } })
                .populate('author', 'nameDisplayed')
                .populate('numUpVotes')
                .sort({ postTime: -1 })
                .limit(this.loadLimit + 1);
        }
        if (articlesArray.length < this.loadLimit + 1) {
            lastArticle = true;
        }
        return {
            "articlesArray": articlesArray.slice(0, this.loadLimit),
            "lastArticle": lastArticle
        };
    }

    async loadMyVotesArray(userId, lastPostTime) {
        let votesArray;
        let lastVote = false;
        if (lastPostTime === '') {
            votesArray = await this.voteModel.find({
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
                .limit(this.loadLimit);
        } else {
            votesArray = await this.voteModel.find({
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
                .limit(this.loadLimit);
        }
        if (votesArray.length < this.loadLimit + 1) {
            lastVote = true;
        }
        return {
            "votesArray": votesArray.slice(0, this.loadLimit),
            "lastVote": lastVote
        };
    }

    async loadArticleVotes(articleIdArray, userId) {
        const votesArray = await this.articleModel.find({
            "_id": { $in: articleIdArray }
        })
            .populate('numUpVotes')
            .select('numUpVotes')
            .lean();

        return votesArray;
    }

    async loadUserVotedArticle(articleIdArray, userId) {
        const votesArray = await this.voteModel.find({
            "article": { $in: articleIdArray },
            "author": userId,
            "status": true
        })
            .select('article');

        return votesArray;
    }

    async loadMyNotificationsArray(userId, lastPostTime) {
        let notificationsArray;
        let lastNotification = false;
        if (lastPostTime === '') {
            notificationsArray = await this.notificationUpvoteModel.find({
                author: userId,
                active: true
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
                .limit(this.loadLimit);
        } else {
            notificationsArray = await this.notificationUpvoteModel.find({
                author: userId,
                active: true,
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
                .limit(this.loadLimit);
        }
        if (notificationsArray.length < this.loadLimit + 1) {
            lastNotification = true;
        }
        return {
            "notificationsArray": notificationsArray.slice(0, this.loadLimit),
            "lastNotification": lastNotification
        };
    }

    async markNotificationAsRead(notificationId) {
        let notification;
        try {
            notification = await this.notificationUpvoteModel.findByIdAndUpdate(
                notificationId,
                { active: false },
                { new: true }
            )
        } catch (e) {
            mongoErrorsHandler(e);
        }
    }

    async getNotificationCount(userId) {
        const notificationCount = await this.notificationUpvoteModel.where({
            author: userId,
            active: true
        }).countDocuments();
        return notificationCount;
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

    async notificationUpvote(upVote) {
        const userId = upVote.author;
        const articleId = upVote.article;

        let notificationUpvote;
        try {
            notificationUpvote = await this.notificationUpvoteModel.findOne({ author: userId, article: articleId });
        } catch (e) {
            throw e;
        }

        if (upVote.status === true) {
            if (notificationUpvote !== null) {
                const updatedNotificationUpvote = await this.notificationUpvoteModel.findByIdAndUpdate(
                    notificationUpvote._id,
                    { active: true },
                    { new: true }
                )
                return updatedNotificationUpvote;
            } else {
                const articleCount = await this.articleModel.countDocuments({ _id: articleId });
                const userCount = await this.userModel.countDocuments({ _id: userId });
                if (articleCount !== 0 && userCount !== 0) {
                    const newNotificationUpvoteDocument = new this.notificationUpvoteModel({
                        active: true,
                        author: userId,
                        article: articleId
                    })
                    let newNotificationUpvote;
                    try {
                        newNotificationUpvote = await newNotificationUpvoteDocument.save();
                    } catch (e) {
                        throw e;
                    }
                    return newNotificationUpvote;
                } else {
                    throw new NoUserOrArticleWithIDError('No article and/or user with id provided');
                }
            }
        } else {
            if (notificationUpvote !== null) {
                const updatedNotificationUpvote = await this.notificationUpvoteModel.findByIdAndUpdate(
                    notificationUpvote._id,
                    { active: false },
                    { new: true }
                )
                return updatedNotificationUpvote;
            } else {
                const articleCount = await this.articleModel.countDocuments({ _id: articleId });
                const userCount = await this.userModel.countDocuments({ _id: userId });
                if (articleCount !== 0 && userCount !== 0) {
                    const newNotificationUpvoteDocument = new this.notificationUpvoteModel({
                        active: false,
                        author: userId,
                        article: articleId
                    })
                    let newNotificationUpvote;
                    try {
                        newNotificationUpvote = await newNotificationUpvoteDocument.save();
                    } catch (e) {
                        throw e;
                    }
                    return newNotificationUpvote;
                } else {
                    throw new NoUserOrArticleWithIDError('No article and/or user with id provided');
                }
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
        return userUpVotes;
    }

    async loadNotificationUpvotesArray(userId) {
        const notificationUpvotes = await this.userModel.findById(userId)
            .populate({
                path: 'notificationUpvotes',
                populate: { path: 'article' }
            });
    }

    async deleteArticle(articleId, userId) {
        let deletedArticle;
        const article = await this.articleModel.findById(articleId);
        if (article === null) {
            throw new NoArticleWithThisIDError('There is no article with this id');
        }
        const authorId = new mongoose.Types.ObjectId(article.author.id);
        if (authorId.toString() === userId.toString()) {
            deletedArticle = await this.articleModel.findByIdAndDelete(articleId)
        } else {
            throw new UserNotAuthorError('User is not the author of this article');
        }
        return deletedArticle;
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

    async changePassword(user, oldPassword, newPassword) {
        try {
            const updatedUser = await user.changePassword(oldPassword, newPassword);
            return updatedUser;
        } catch (e) {
            throw e;
        }
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