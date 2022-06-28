import fs from 'fs';
import path from 'path';
import {
    ArticleAlreadyPostedError,
    NoArticleWithThisIDError,
    NoArticleWithThisUrlError,
    FilePathIsNotAFileError,
    FileIsNotJsonExtensionError,
    FileDatabaseContainsNonArticleObjectError,
    NewArticlesArrayContainsNonArticleObjectError,
    NotAnArrayError,
    NotAnObjectError,
    NotAnArticleObjectError,
    InvalidPathError
} from './errors.js';



class FileDatabase {
    constructor(databaseFilePath) {
        this.databaseFilePath = databaseFilePath;

        let stats;
        try {
            stats = fs.statSync(this.databaseFilePath)
        } catch (e) {
            if (e.message === `ENOENT: no such file or directory, stat '${this.databaseFilePath}'`) {
                throw new InvalidPathError('Invalid database path');
            } else {
                throw e;
            }
        }
        if (!stats.isFile()) {
            throw new FilePathIsNotAFileError('File path for database is not a file')
        } else if (path.extname(this.databaseFilePath) !== '.json') {
            throw new FileIsNotJsonExtensionError('File for database is not a json extension')
        }
        const fileContent = fs.readFileSync(this.databaseFilePath);
        try {
            JSON.parse(fileContent);
        } catch (e) {
            throw e;
        }
    }

    async loadAllArticlesArray() {
        const articlesArrayUnparsed = await fs.promises.readFile(this.databaseFilePath);
        let articlesArray
        try {
            articlesArray = JSON.parse(articlesArrayUnparsed);
        } catch (e) {
            throw e
        }
        if (!Array.isArray(articlesArray)) {
            throw new NotAnArrayError('Input is not an array')
        }
        if (!articlesArray.every(FileDatabase.isArticleObject)) {
            throw new FileDatabaseContainsNonArticleObjectError('Some items in the article database are not article object');
        }
        return articlesArray;
    }

    saveAllArticlesArray(newArticleArray) {
        if (!Array.isArray(newArticleArray)) {
            throw new NotAnArrayError('Input is not an array')
        }
        if (!newArticleArray.every(FileDatabase.isArticleObject)) {
            throw new NewArticlesArrayContainsNonArticleObjectError('Some items in the new articles array are not article object');
        }
        const newJSON = JSON.stringify(newArticleArray);
        fs.promises.writeFile(this.databaseFilePath, newJSON)
    }

    async saveNewArticle(newArticle) {
        const articlesArray = await this.loadAllArticlesArray();
        if (articlesArray.some(article => article.url === newArticle.url)) {
            throw new ArticleAlreadyPostedError('Article already posted');
        }
        const newArticlesArray = articlesArray.concat(newArticle);
        this.saveAllArticlesArray(newArticlesArray);
    }

    async loadArticleWithID(id) {
        const articlesArray = await this.loadAllArticlesArray();
        const article = articlesArray.find((article) => article.id === id)
        if (article) {
            return article;
        } else {
            throw new NoArticleWithThisIDError('There is no article with this id')
        }
    }

    async loadArticleWithUrl(url) {
        const articlesArray = await this.loadAllArticlesArray();
        const article = articlesArray.find((article) => article.url === url)
        if (article) {
            return article;
        } else {
            throw new NoArticleWithThisUrlError('There is no article with this url')
        }
    }

    async saveModifiedArticle(modifiedArticle) {
        if (!FileDatabase.isArticleObject(modifiedArticle)) {
            throw new NotAnArticleObjectError('The modified article is not an article object')
        }

        const articlesArray = await this.loadAllArticlesArray();
        let articleIndex
        articlesArray.find((article, index) => {
            if (article.id === modifiedArticle.id) {
                articleIndex = index;
            }
        });
        if (articleIndex) {
            const newArticlesArray = [
                ...articlesArray.slice(0, articleIndex),
                modifiedArticle,
                ...articlesArray.slice(articleIndex + 1, articleIndex.length)
            ];
            this.saveAllArticlesArray(newArticlesArray);
        } else {
            throw new NoArticleWithThisIDError('There is no article with this id')
        }
    }

    static isArticleObject(article) {
        if (!(article instanceof Object)) {
            throw new NotAnObjectError('Input is not an object');
        }
    
        const articleObjectKeysArray = [
            'url',
            'id',
            'postTime',
            'numberOfVotes',
            'linkPreview'
        ]
        const articleKeys = Object.keys(article);
    
        const articleIsArticle = FileDatabase.arrayContainedInArray(articleObjectKeysArray, articleKeys) &&
            FileDatabase.arrayContainedInArray(articleKeys, articleObjectKeysArray);
    
        return articleIsArticle
    }
    
    static arrayContainedInArray(arrayContain, arrayContained) {
        if (!Array.isArray(arrayContain) || !Array.isArray(arrayContained)) {
            throw new NotAnArrayError('Input is not an array')
        }
    
        let contained = true
    
        for (let item of arrayContained) {
            if (!arrayContain.includes(item)) {
                contained = false;
            }
        }
    
        return contained;
    }
}


export default FileDatabase;

// const fileDatabase = new FileDatabase('/Users/felipekharaba/Documents/Documents – Felipe’s MacBook Pro/Coding courses/Projects/server_for_vote_the_news/data_articles.json')
// const fileDatabase = new FileDatabase('/Users/felipekharaba/Documents/Documents – Felipe’s MacBook Pro/Coding courses/Projects/server_for_vote_the_news/not_json.json')
// const fileDatabase = new FileDatabase("invalidFilePath")
// const data = await fileDatabase.loadAllArticlesArray();
// console.log(data);
// fileDatabase.articleAllreadyInDatabase('https://www.nytimes.com/2022/04/12/technology/rto-return-office-technology.html')
// console.log(await fileDatabase.loadArticle("f40c334e-5841-40c7-83d8-64caed4b95a0"));
// console.log(await fileDatabase.loadArticleWithID("ec9d36be-83e4-43c6-9525-32a6b46b1f45"));
// const array1 = ['text1', 'text2'];
// const array2 = ['text3', 'text2'];
// console.log(typeof arrayContainedInArray(array1, array2));