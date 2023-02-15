import express from 'express';

import catchAsync from '../utils/catchAsync.js';
import { articleManagement } from '../index.js';
import {
    DomainNotInWhiteListError,
    InvalidURLError,
} from '../errors.js';
import { verifyUser } from '../authenticate.js';


const router = express.Router();

router.post('/allarticles', catchAsync(async (req, res) => {
    const lastPostTime = req.body.lastPostTime;
    const articleObject = await articleManagement.getSortedArticlesArray(lastPostTime);
    res.statusCode = 200;
    res.send(articleObject);
}))

router.post('/myarticles', verifyUser, catchAsync(async (req, res) => {
    const lastPostTime = req.body.lastPostTime;
    const userId = req.user._id;
    const articlesArray = await articleManagement.getMyArticlesArray(userId, lastPostTime);
    res.statusCode = 200;
    res.send(articlesArray);
}))

router.post('/myvotes', verifyUser, catchAsync(async (req, res) => {
    const lastPostTime = req.body.lastPostTime;
    const userId = req.user._id;
    const articlesArray = await articleManagement.getMyVotesArray(userId, lastPostTime);
    res.statusCode = 200;
    res.send(articlesArray);
}))

router.post('/mynotifications', verifyUser, catchAsync(async (req, res) => {
    const lastPostTime = req.body.lastPostTime;
    const userId = req.user._id;
    const articlesArray = await articleManagement.getMyNotificationsArray(userId, lastPostTime);
    res.statusCode = 200;
    res.send(articlesArray);
}))

router.post('/newarticlepost', verifyUser, catchAsync(async (req, res) => {
    console.log('Post request received', req.body.url);
    const newArticleURL = req.body.url;
    console.log(req.user._id);
    const authorId = req.user._id
    try {
        const newArticle = await articleManagement.postNewArticle(newArticleURL, authorId);
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
        const upVote = await articleManagement.upVote(userId, id);
        res.status(200).send({
            upVote: upVote,
            message: 'Upvote saved'
        })
    } catch (e) {
        throw e;
    }
}))

router.delete('/:articleId/delete', verifyUser, catchAsync(async (req, res) => {
    const { articleId } = req.params;
    const userId = req.user._id;
    try {
        const deletedArticle = await articleManagement.deleteArticle(articleId, userId);
        res.status(200).send({
            deletedArticle: deletedArticle,
            message: 'Article deleted'
        })
    } catch (e) {
        throw e;
    }
}))


export { router };