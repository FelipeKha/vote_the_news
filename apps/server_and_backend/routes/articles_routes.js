import express from 'express';

import { InvalidURLError } from '../errors.js';
import catchAsync from '../utils/catchAsync.js';
import { dataManagement } from '../dataManagement_object.js';
import isLoggedIn from '../utils/middleware.js';


const router = express.Router();

router.get('/', catchAsync(async (req, res) => {
    const articlesArray = await dataManagement.getSortedArticlesArray();
    res.send(articlesArray);
}))

router.post('/newarticlepost', isLoggedIn, catchAsync(async (req, res) => {
    console.log('Post request received', req.body.url);
    const newArticleURL = req.body.url;
    console.log(req.user._id);
    const authorId = req.user._id
    try {
        const newArticle = await dataManagement.postNewArticle(newArticleURL, authorId);
        // console.log(newArticle);
        res.send(newArticle);
    } catch (e) {
        if (e instanceof InvalidURLError) {
            console.log(`Error at newArticle: ${e.message}`);
            res.status(401).send({ message: e.message })
        } else {
            throw e
        }
    }
}))

router.post('/:id/vote', isLoggedIn, catchAsync(async (req, res) => {
    console.log('New vote');
    const { id } = req.params;
    const userId = req.user._id;
    try {
        const upVote = await dataManagement.upVote(userId, id);
        res.status(200).send({
            upVote: upVote,
            message: 'Upvote saved'
        })
    } catch(e) {
        throw e;
    }
}))

export { router };