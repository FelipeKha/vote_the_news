import express from 'express';

import catchAsync from '../utils/catchAsync.js';
import isLoggedIn from '../utils/middleware.js';
import {
    InvalidURLError,
    DomainNotInWhiteListError
} from '../errors.js';
import { dataManagement } from '../dataManagement_object.js';
import { verifyUser } from '../authenticate.js';


const router = express.Router();

router.post('/allarticles', catchAsync(async (req, res) => {
    const lastPostTime = req.body.lastPostTime;
    console.log(lastPostTime);
    const articlesArray = await dataManagement.getSortedArticlesArray(lastPostTime);
    res.statusCode = 200;
    res.send(articlesArray);
}))

router.post('/myarticles', verifyUser, catchAsync(async (req, res) => {
    const lastPostTime = req.body.lastPostTime;
    const userId = req.user._id;
    const articlesArray = await dataManagement.getMyArticlesArray(userId, lastPostTime);
    res.statusCode = 200;
    res.send(articlesArray);
}))

router.post('/myvotes', verifyUser, catchAsync(async (req, res) => {
    const lastPostTime = req.body.lastPostTime;
    const userId = req.user._id;
    const articlesArray = await dataManagement.getMyVotesArray(userId, lastPostTime);
    res.statusCode = 200;
    res.send(articlesArray);
}))

router.post('/newarticlepost', verifyUser, catchAsync(async (req, res) => {
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
            res.statusCode = 401;
            res.send({ message: e.message });
        } else if (e instanceof DomainNotInWhiteListError) {
            res.statusCode = 401;
            res.send({ message: e.message });
        } else {
            throw e
        }
    }
}))

router.post('/:id/vote', verifyUser, catchAsync(async (req, res) => {
    console.log('New vote');
    const { id } = req.params;
    const userId = req.user._id;
    try {
        const upVote = await dataManagement.upVote(userId, id);
        res.status(200).send({
            upVote: upVote,
            message: 'Upvote saved'
        })
    } catch (e) {
        throw e;
    }
}))


export { router };