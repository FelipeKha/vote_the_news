import mongoose from 'mongoose';

import dataManagementErrorsHandler from './utils/dataManagementErrorsHandler.js';
import {
    InvalidURLError,
    ArticleAlreadyHasLinkPreviewError,
    DomainNotInWhiteListError
} from './errors.js';


class DataManagement {
    constructor(database, linkPreview) {
        this.database = database;
        this.linkPreview = linkPreview;
    }

    async getSortedArticlesArray(lastPostTime) {
        let sortedArticlesArray;
        try {
            sortedArticlesArray = await this.database.loadArticlesArrayInfiniteScroll(lastPostTime);
            console.log(sortedArticlesArray);
        } catch (e) {
            dataManagementErrorsHandler(e);
        }
        return sortedArticlesArray;
    }

    async getMyArticlesArray(userId, lastPostTime) {
        let articlesArray;
        try {
            articlesArray = await this.database.loadMyArticlesArray(userId, lastPostTime);
        } catch (e) {
            dataManagementErrorsHandler(e);
        }
        return articlesArray;
    }

    async getMyVotesArray(userId, lastPostTime) {
        let votesArray;
        try {
            votesArray = await this.database.loadMyVotesArray(userId, lastPostTime);
        } catch (e) {
            dataManagementErrorsHandler(e);
        }
        const articlesArray = [];
        for (let vote of votesArray) {
            articlesArray.push(vote.article);
        }
        return articlesArray;
    }

    async postNewArticle(url, authorId) {
        if (!DataManagement.isValidHttpUrl(url)) {
            throw new InvalidURLError('Invalid URL');
        }

        const newArticleObject = DataManagement.createNewArticleObject(url, authorId);
        let newArticleSaved;

        try {
            newArticleSaved = await this.database.saveNewArticle(newArticleObject);
            console.log('New article saved without link preview', newArticleSaved.id);
        } catch (e) {
            dataManagementErrorsHandler(e);
        }

        let newArticleObjectWithLinkPreview;
        try {
            newArticleObjectWithLinkPreview = await this.addLinkPreview(newArticleSaved._id)
            console.log('Link preview added');
        } catch (e) {
            if (e instanceof DomainNotInWhiteListError){
                this.database.deleteArticle(newArticleSaved._id);
                throw e;
            } else {
                dataManagementErrorsHandler(e);
            }
        }

        console.log('End of newArticle function');
        return newArticleObjectWithLinkPreview;
    }

    async upVote(userId, articleId) {
        let upVote;
        try {
            upVote = await this.database.upVote(userId, articleId);
        } catch (e) {
            throw e;
        }
        return upVote;
    }

    async getLinkPreview(url) {
        const linkPreviewObject = await this.linkPreview.linkPreview(url);
        return linkPreviewObject;
    }

    async addLinkPreview(id) {
        let article;
        try {
            article = await this.database.loadArticleWithID(id);
        } catch (e) {
            dataManagementErrorsHandler(e);
        }
        if (Object.prototype.hasOwnProperty.call(article, 'linkPreview') &&
            Object.prototype.hasOwnProperty.call(article.linkPreview, 'title') &&
            Object.prototype.hasOwnProperty.call(article.linkPreview, 'description') &&
            Object.prototype.hasOwnProperty.call(article.linkPreview, 'domain') &&
            Object.prototype.hasOwnProperty.call(article.linkPreview, 'img')) {
            throw new ArticleAlreadyHasLinkPreviewError('This article already has a link preview');
        } else {
            article.linkPreview = await this.getLinkPreview(article.url);
        }
        const articleSaved = await this.database.saveModifiedArticle(article);
        return articleSaved;
    }

    async loadAllUserPostsArray(userId) {
        const userPosts = await this.database.loadAllUserPostsArray(userId);
        return userPosts;
    }

    async loadAllUserUpVotesArray(userId) {
        const userUpVotes = await this.database.loadAllUserUpVotesArray(userId);
        return userUpVotes;
    }

    static isValidHttpUrl(string) {
        let url;

        try {
            url = new URL(string);
        } catch (_) {
            return false;
        }

        return url.protocol === "http:" || url.protocol === "https:";
    }

    static createNewArticleObject(url, authorId) {
        const id = new mongoose.Types.ObjectId;
        const newArticleObject = {
            'url': url,
            '_id': id,
            'postTime': Date.now(),
            'author': authorId
        }
        return newArticleObject
    }

    static hasPostTimeProperty(objectItem) {
        const hasPostTimeProperty = Object.prototype.hasOwnProperty.call(objectItem, 'postTime');
        return hasPostTimeProperty;
    }

    static isValidDate(objectItem) {
        const dataObject = new Date(objectItem.postTime)
        if (dataObject.toString() === 'Invalid Date') {
            return false
        }
        return true
    }
}



export default DataManagement;