import mongoose from 'mongoose';

import dataManagementErrorsHandler from './utils/dataManagementErrorsHandler.js';
import {
    InvalidURLError,
    ArticleAlreadyHasLinkPreviewError,
} from './errors.js';


class DataManagement {
    constructor(fileDatabase, linkPreview) {
        this.fileDataBase = fileDatabase;
        this.linkPreview = linkPreview;
    }

    async getSortedArticlesArray() {
        let sortedArticlesArray;
        try {
            sortedArticlesArray = await this.fileDataBase.loadAllArticlesArrayBySortedDates();
        } catch (e) {
            dataManagementErrorsHandler(e);
        }
        return sortedArticlesArray;
    }

    async postNewArticle(url) {
        if (!DataManagement.isValidHttpUrl(url)) {
            throw new InvalidURLError('Invalid URL');
        }

        const newArticleObject = DataManagement.createNewArticleObject(url);
        let newArticleSaved;

        try {
            newArticleSaved = await this.fileDataBase.saveNewArticle(newArticleObject);
            console.log('New article saved without link preview', newArticleSaved.id);
        } catch (e) {
            dataManagementErrorsHandler(e);
        }
        
        let newArticleObjectWithLinkPreview;
        try {
            newArticleObjectWithLinkPreview = await this.addLinkPreview(newArticleSaved._id)
            console.log('Link preview added');
        } catch (e) {
            dataManagementErrorsHandler(e);
        }

        console.log('End of newArticle function');
        return newArticleObjectWithLinkPreview;
    }

    async getLinkPreview(url) {
        const linkPreviewObject = await this.linkPreview.linkPreview(url);
        return linkPreviewObject;
    }

    async addLinkPreview(id) {
        let article;
        try {
            article = await this.fileDataBase.loadArticleWithID(id);
        } catch (e) {
            dataManagementErrorsHandler(e);
        }
        console.log(article);
        if (article.linkPreview) {
            if (article.linkPreview.title &&
                article.linkPreview.description &&
                article.linkPreview.domain &&
                article.linkPreview.img) {
                throw new ArticleAlreadyHasLinkPreviewError('This article already has a link preview');
            }
        } else {
            article.linkPreview = await this.getLinkPreview(article.url);
        }
        const articleSaved = await this.fileDataBase.saveModifiedArticle(article);
        return articleSaved;
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

    static createNewArticleObject(url) {
        const id = new mongoose.Types.ObjectId;
        const newArticleObject = {
            'url': url,
            '_id': id,
            'postTime': Date.now(),
            'numberOfVotes': 0
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