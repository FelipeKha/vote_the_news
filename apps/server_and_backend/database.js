import mongoose from "mongoose";

// import Article from './models/article.js'
// import articleSchema from './models/article.js'
import mongoErrorsHandler from "./utils/mongoErrorsHandler.js";
import {
    NoArticleWithThisIDError,
    NoArticleWithThisUrlError
} from "./errors.js";


class Database {
    constructor(databaseUrl, databaseSchema) {
        this.databaseUrl = databaseUrl;
        this.databaseSchema = databaseSchema;
        this.conn
        this.articleModel;

        // this.conn = mongoose.createConnection(this.databaseUrl);
        // this.conn.on('error', (e) => mongoErrorsHandler(e));
        // this.articleModel = this.conn.model('Article', this.databaseSchema);
    }

    async connectToDatabase() {
        // await mongoose.connect(this.databaseUrl);
        this.conn = await mongoose.createConnection();
        await this.conn.openUri(this.databaseUrl)
        // const conn = mongoose.createConnection(this.databaseUrl, { useNewUrlParser: true });
        this.conn.on('error', (e) => mongoErrorsHandler(e));
        // conn.catch(e => console.log('got the error'));
        return this.conn;
    }

    associateModelToConnection() {
        this.articleModel = this.conn.model('Article', this.databaseSchema);
        return this.articleModel;
    }

    async loadAllArticlesArray() {
        const articlesArray = this.articleModel.find({});
        return articlesArray;
    }

    async loadAllArticlesArraySortedByDates() {
        const articlesArray = this.articleModel.find({}).sort({ postTime: -1 });
        return articlesArray;
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
}

export default Database;



// const articlesArray = [
//     {
//         "url": "https://www.nytimes.com/2022/04/28/technology/tech-uncertainty.html",
//         "id": "4f32fa73-a474-43e7-b2d5-631accd6a225",
//         "postTime": "Thu Apr 28 2022 14:30:40 GMT-0500 (Central Daylight Time)",
//         "numberOfVotes": 0,
//         "linkPreview": {
//             "title": "An Unsteady Moment for Tech",
//             "description": "The past decade has been one long party for tech. Where we go from here isn’t so clear.",
//             "domain": "www.nytimes.com",
//             "img": "https://static01.nyt.com/images/2022/04/28/autossell/Optimism-first-frame/Optimism-first-frame-square640.jpg"
//         }
//     },
//     {
//         "url": "https://www.nytimes.com/2022/04/28/technology/twitter-musk-content-moderators.html",
//         "id": "f5b31ed5-3f8a-459e-8b04-6c74db692921",
//         "postTime": "Thu Apr 28 2022 14:37:33 GMT-0500 (Central Daylight Time)",
//         "numberOfVotes": 0,
//         "linkPreview": {
//             "title": "Inside Twitter, Fears Musk Will Return Platform to Its Early Troubles",
//             "description": "Content moderators warn that Elon Musk doesn’t appear to understand the issues that he and the company will face if he drops its guardrails around speech.",
//             "domain": "www.nytimes.com",
//             "img": "https://static01.nyt.com/images/2022/04/28/business/28twitter-moderation1/merlin_205928799_05479b27-0eb8-48e6-8b77-3194925c3a54-articleLarge.jpg?quality=75&auto=webp&disable=upscale"
//         }
//     }
// ]

// const newArticle = {
//     "url": "https://www.nytimes.com/2022/04/28/technology/twitter-first-quarter-earnings-elon-musk.html",
//     "id": "7a5e341b-084f-4223-9388-162f02324593",
//     "postTime": "Thu Apr 28 2022 14:47:26 GMT-0500 (Central Daylight Time)",
//     "numberOfVotes": 0,
//     "linkPreview": {
//         "title": "Twitter reports growth in revenue and users as Elon Musk prepares to take over.",
//         "description": "The social media company reported a 16 percent jump in daily active users from a year ago.",
//         "domain": "www.nytimes.com",
//         "img": "https://static01.nyt.com/images/2022/04/28/multimedia/28twitter-earnings/28twitter-earnings-articleLarge.jpg?quality=75&auto=webp&disable=upscale"
//     }
// }


// await database.saveAllArticlesArray(articlesArray);
// const articlesArray = await database.loadAllArticlesArray();
// console.log(articlesArray);
// await database.saveNewArticle(newArticle2);

// const databaseUrl = 'mongodb://localhost:27017/vote-the-news';
// const databaseSchema = Article;
// const database = new Database(databaseUrl, databaseSchema);
// await database.connectToDatabase();

// const newArticle2 = {
//     _id: new mongoose.Types.ObjectId,
//     url: "https://www.nytimes.com/2022/05/27/technology/crypto-influencers.html",
//     postTime: Date.now(),
//     numberOfVotes: 0,
//     __v: 0,
//     linkPreview: {
//         title: "How Influencers Hype Crypto, Without Disclosing Their Financial Ties",
//         domain: "www.nytimes.com",
//         img: "https://static01.nyt.com/images/2022/05/26/business/26crypto-influencers1/26crypto-influencers1-facebookJumbo.jpg"
//     }
// }

// // const articleFoundById = await database.loadArticleWithID(newArticle2._id)
// const articleFoundById = await database.loadArticleWithID('notAnID')
// console.log(articleFoundById);

// const databaseUrl = 'mongodb://localhost:27017/vote-the-news';
// const databaseSchema = Article;
// const database = new Database(databaseUrl, databaseSchema);
// await database.connectToDatabase();
// const articleObject1 = {
//     // url: 'thisIsUrl2',
//     numberOfVotes: 0,
//     _id: new mongoose.Types.ObjectId,
//     postTime: Date.now()
// }


// await database.saveNewArticle(articleObject1);
// await database.loadArticleWithID('notAnId');

// const articleDatabase = {
//     _id: new mongoose.Types.ObjectId("629a32fb68cdc84bc7a6ab3a"),
//     // _id: 'notAnID',
//     // url : "thisIsUrlEither", 
//     // url : 'hereIsTheUrl', 
//     url : ['this is a ,bloody array'], 
//     // numberOfVotes: 8,
//     numberOfVotes: 'notANumber',
//     postTime: Date.now(),
//     __v: 0
// }
// const databaseUrl = 'mongodb://localhost:27017/vote-the-news';
// const databaseSchema = Article;
// const database = new Database(databaseUrl, databaseSchema);
// await database.connectToDatabase();
// console.log(await database.saveModifiedArticle(articleDatabase));

// const invalidUrl = 'invalidUrl';
// const database = new Database(invalidUrl, articleSchema);
// database.connectToDatabase();

// const databaseUrl = 'mongodb://localhost:27017/vote-the-news';
// const database = new Database(databaseUrl, articleSchema);
// const connection = database.connectToDatabase();
// console.log(connection.readyState);
// console.log(await database.loadAllArticlesArray());