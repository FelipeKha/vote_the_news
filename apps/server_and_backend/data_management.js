import mongoose from 'mongoose';

import dataManagementErrorsHandler from './utils/dataManagementErrorsHandler.js';
import {
    InvalidURLError,
    ArticleAlreadyHasLinkPreviewError,
    ArticleAlreadyPostedError,
    NoArticleWithThisIDError,
    FilePathIsNotAFileError,
    FileIsNotJsonExtensionError,
    NotAnArrayError,
    DoNotHavePostTimePropertyError,
    InvalidDateError
} from './errors.js';


class DataManagement {
    constructor(fileDatabase, linkPreview) {
        this.fileDataBase = fileDatabase;
        this.linkPreview = linkPreview;
    }

    async getSortedArticlesArray() {
        let sortedArticlesArray;
        try {
            const sortedArticlesArray = await this.fileDataBase.loadAllArticlesArrayBySortedDates();
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
            // if (e instanceof ArticleAlreadyPostedError) {
            //     console.log(`Error at saveNewArticle: ${e.message}`);
            //     const existingArticle = await this.fileDataBase.loadArticleWithUrl(url);
            //     existingArticle.userMessage = e.message
            //     return existingArticle
            // } else {
            //     throw e;
            // }
            dataManagementErrorsHandler(e);
        }

        try {
            await this.addLinkPreview(newArticleSaved._id)
            console.log('Link preview added');
        } catch (e) {
            dataManagementErrorsHandler(e);
        }

        console.log('End of newArticle function');
        let newArticleObjectWithLinkPreview;
        try {
            newArticleObjectWithLinkPreview = await this.fileDataBase.loadArticleWithID(newArticleSaved.id);
        } catch (e) {
            dataManagementErrorsHandler(e);
        }
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
        if (article.linkPreview.title &&
            article.linkPreview.description &&
            article.linkPreview.domain &&
            article.linkPreview.img) {
            throw new ArticleAlreadyHasLinkPreviewError('This article already has a link preview');
        } else {
            article.linkPreview = await this.getLinkPreview(article.url);
        }
        await this.fileDataBase.saveModifiedArticle(article);
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
        // const id = uuidv4();
        const id = new mongoose.Types.ObjectId;
        // console.log(id);
        const newArticleObject = {
            'url': url,
            'id': id,
            'postTime': Date.now(),
            'numberOfVotes': 0
        }
        return newArticleObject
    }

    // No longer required since Mongoose can return sorted arrays
    // static sortArrayByPostingDate(array) {
    //     if (!Array.isArray(array)) {
    //         throw new NotAnArrayError('Input is not an array')
    //     }
    //     if (!array.every(DataManagement.hasPostTimeProperty)) {
    //         throw new DoNotHavePostTimePropertyError('One of the object does not have a postTime property')
    //     }
    //     if (!array.every(DataManagement.isValidDate)) {
    //         throw new InvalidDateError('One of the object has an invalid date')
    //     }

    //     const sortedArray = array.sort((a, b) => {
    //         const postTimeA = new Date(a.postTime);
    //         const postTimeB = new Date(b.postTime);
    //         return postTimeB - postTimeA;
    //     })
    //     return sortedArray
    // }

    static hasPostTimeProperty(objectItem) {
        console.log(objectItem.postTime);
        return objectItem.hasOwnProperty('postTime')
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

// const fileDatabase = new FileDatabase('/Users/felipekharaba/Documents/Documents – Felipe’s MacBook Pro/Coding courses/Projects/server_for_vote_the_news/data_articles.json');
// const dataManagement = new DataManagement(fileDatabase);
// const articlesArray  = await dataManagement.getSortedArticlesArray();
// console.log(articlesArray);
// dataManagement.newArticle('https://www.nytimes.com/2022/04/11/technology/china-russia-propaganda.html')
// dataManagement.getData()
// await dataManagement.addLinkPreview("a0a1162d-8a02-4874-879d-419eabe3beb0");
// dataManagement.newArticle('https://www.nytimes.com/2022/04/06/technology/personaltech/text-scam-spam.html');