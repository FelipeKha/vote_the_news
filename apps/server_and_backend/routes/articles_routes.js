import express from 'express';

import { InvalidURLError } from '../errors.js';
import catchAsync from '../utils/catchAsync.js';
import { dataManagement } from '../dataManagement_object.js';
import isLoggedIn from '../utils/isLoggedIn.js';


const router = express.Router();

router.get('/', catchAsync(async (req, res) => {
    console.log('REQ HEADERS');
    console.log(req.headers);
    const articlesArray = await dataManagement.getSortedArticlesArray();
    res.send(articlesArray);
    console.log('RES HEADERS');
    console.log(res);
}))

router.post('/', isLoggedIn, catchAsync(async (req, res) => {
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