import express from 'express';
import cors from 'cors';
import path from 'path';
import url from 'url';

import DataManagement from './data_management.js'
import FileDatabase from './file_database.js';
import Database from './database.js';
import LinkPreview from './link_preview.js'
import { InvalidURLError } from './errors.js';
// import Article from "./models/article.js";
import articleSchema from "./models/article.js";
import catchAsync from './utils/catchAsync.js';
import ExpressError from './utils/ExpressError.js';


const currentDirPath = path.dirname(url.fileURLToPath(import.meta.url));
const databaseFilePath = path.join(currentDirPath, '/data_articles.json')

const databaseUrl = 'mongodb://localhost:27017/vote-the-news';
// const databaseSchema = Article;
const databaseSchema = articleSchema;
// const fileDatabase = new FileDatabase(databaseFilePath);
const fileDatabase = new Database(databaseUrl, databaseSchema);
await fileDatabase.connectToDatabase();
fileDatabase.associateModelToConnection();
const linkPreview = new LinkPreview();
const dataManagement = new DataManagement(fileDatabase, linkPreview)

const app = express();
const port = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// To be modified for production app
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions));

app.get('/', catchAsync(async (req, res) => {
    const articlesArray = await dataManagement.getSortedArticlesArray();
    res.send(articlesArray);
}))

app.post('/', catchAsync(async (req, res) => {
    console.log('Post request received', req.body.url);
    const newArticleURL = req.body.url;
    try {
        const newArticle = await dataManagement.postNewArticle(newArticleURL);
        // console.log(newArticle);
        res.send(newArticle);
    } catch (e) {
        if (e instanceof InvalidURLError) {
            console.log(`Error at newArticle: ${e.message}`);
            res.send({ userMessage: e.message })
        } else {
            throw e
        }
    }
}))

// app.all('*', (req, res, next) => {
//     next(new ExpressError('Page not found', 404));
// })

// app.use((err, req, res, next) => {
//     const {statusCode = 500} = err;
//     if (!err.message) err.message = 'Something went wrong and we do not have an error message';
//     res.status(statusCode).send(err.message)
// })

app.listen(port, () => {
    console.log(`Listening port ${port}`);
})

