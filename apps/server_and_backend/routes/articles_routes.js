import express from 'express';

import { InvalidURLError } from '../errors.js';
import catchAsync from '../utils/catchAsync.js';
import DataManagement from '../data_management.js';
import Database from '../database.js';
import LinkPreview from '../link_preview.js'
import articleSchema from "../models/article.js";

const router = express.Router();

const databaseUrl = 'mongodb://localhost:27017/vote-the-news';
const databaseSchema = articleSchema;
const database = new Database(databaseUrl, databaseSchema);
await database.connectToDatabase();
database.associateModelToConnection();
const linkPreview = new LinkPreview();
const dataManagement = new DataManagement(database, linkPreview)


router.get('/', catchAsync(async (req, res) => {
    console.log('REQ HEADERS');
    console.log(req.headers);
    const articlesArray = await dataManagement.getSortedArticlesArray();
    res.send(articlesArray);
    console.log('RES HEADERS');
    console.log(res);
}))

router.post('/', catchAsync(async (req, res) => {
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

export { router };