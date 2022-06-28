import FileDatabase from '../file_database';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
    ArticleAlreadyPostedError,
    NoArticleWithThisIDError,
    NoArticleWithThisUrlError,
    NotAnArticleObjectError
} from '../errors'
import { url } from 'inspector';


describe("FileDatabase", () => {
    describe('loadAllArticlesArray', () => {
        let tempDirPath;

        beforeAll(() => {
            tempDirPath = fs.mkdtempSync(
                path.join(
                    os.tmpdir(),
                    'vote_the_news_server_test_'
                )
            );

        })

        afterAll(() => {
            fs.rmSync(tempDirPath, { recursive: true });
        })

        test("returns expected content", async () => {
            const testFileContent = [createArticleObject(1)];

            const databaseFilePath = tempDirPath + '/database.json'
            fs.writeFileSync(databaseFilePath, JSON.stringify(testFileContent));

            const fileDatabase = new FileDatabase(databaseFilePath);

            const content = await fileDatabase.loadAllArticlesArray();
            expect(content).toMatchObject(testFileContent);
        })
    });

    describe('saveAllArticlesArray', () => {
        let tempDirPath;

        beforeEach(() => {
            tempDirPath = fs.mkdtempSync(
                path.join(
                    os.tmpdir(),
                    'vote_the_news_server_test_'
                )
            );

        })

        afterEach(() => {
            fs.rmSync(tempDirPath, { recursive: true });
        })

        test('saves the new article array', async () => {
            const databaseFilePath = tempDirPath + '/file_database.json'
            fs.writeFileSync(databaseFilePath, JSON.stringify([]));

            const articleObject1 = createArticleObject(1);
            const articleObject2 = createArticleObject(2);
            const articlesArray = [articleObject1, articleObject2];

            const fileDatabase = new FileDatabase(databaseFilePath);



            fileDatabase.saveAllArticlesArray(articlesArray);
            const content = await fileDatabase.loadAllArticlesArray();
            expect(content).toMatchObject(articlesArray)
        })
    })

    describe('saveNewArticle', () => {
        let tempDirPath;
        let databaseFilePath;
        let fileDatabase;

        let articleObject1;
        let articleObject2;
        let articlesArray;


        beforeEach(() => {
            tempDirPath = fs.mkdtempSync(
                path.join(
                    os.tmpdir(),
                    'vote_the_news_server_test_'
                )
            );

            articleObject1 = createArticleObject(1);
            articleObject2 = createArticleObject(2);

            articlesArray = [articleObject1, articleObject2];

            databaseFilePath = tempDirPath + '/file_database.json'
            fs.writeFileSync(databaseFilePath, JSON.stringify(articlesArray));
            fileDatabase = new FileDatabase(databaseFilePath);
        })

        afterEach(() => {
            fs.rmSync(tempDirPath, { recursive: true });
        })

        test(`returns ${ArticleAlreadyPostedError.name} if new article already in database`, async () => {
            await expect(fileDatabase.saveNewArticle(articleObject1)).rejects.toThrow(ArticleAlreadyPostedError);
        })

        test('saves the new article in the database', async () => {
            const articleObject3 = createArticleObject(3);

            await fileDatabase.saveNewArticle(articleObject3);
            const newArticlesArray = articlesArray.concat(articleObject3);
            const content = await fileDatabase.loadAllArticlesArray();
            expect(content).toMatchObject(newArticlesArray);
        })
    })

    describe('loadArticleWithID', () => {
        let tempDirPath;
        let databaseFilePath;
        let fileDatabase;

        let articleObject1;
        let articleObject2;
        let articlesArray;


        beforeEach(() => {
            tempDirPath = fs.mkdtempSync(
                path.join(
                    os.tmpdir(),
                    'vote_the_news_server_test_'
                )
            );

            articleObject1 = createArticleObject(1);
            articleObject2 = createArticleObject(2);

            articlesArray = [articleObject1, articleObject2];

            databaseFilePath = tempDirPath + '/file_database.json'
            fs.writeFileSync(databaseFilePath, JSON.stringify(articlesArray));
            fileDatabase = new FileDatabase(databaseFilePath);
        })

        afterEach(() => {
            fs.rmSync(tempDirPath, { recursive: true });
        })

        test(`returns ${NoArticleWithThisIDError.name} if no article with this id in database`, async () => {
            const articleObject3 = createArticleObject(3);

            await expect(fileDatabase.loadArticleWithID(articleObject3.id)).rejects.toThrow(NoArticleWithThisIDError);
        })

        test('returns the correct article', async () => {
            const result = await fileDatabase.loadArticleWithID(articleObject1.id);
            expect(result).toMatchObject(articleObject1);
        })
    })


    describe('loadArticleWithUrl', () => {
        let tempDirPath;
        let databaseFilePath;
        let fileDatabase;

        let articleObject1;
        let articleObject2;
        let articlesArray;


        beforeEach(() => {
            tempDirPath = fs.mkdtempSync(
                path.join(
                    os.tmpdir(),
                    'vote_the_news_server_test_'
                )
            );

            articleObject1 = createArticleObject(1);
            articleObject2 = createArticleObject(2);

            articlesArray = [articleObject1, articleObject2];

            databaseFilePath = tempDirPath + '/file_database.json'
            fs.writeFileSync(databaseFilePath, JSON.stringify(articlesArray));
            fileDatabase = new FileDatabase(databaseFilePath);
        })

        afterEach(() => {
            fs.rmSync(tempDirPath, { recursive: true });
        })

        test(`returns ${NoArticleWithThisUrlError.name} if no article with this url in database`, async () => {
            const articleObject3 = createArticleObject(3);

            await expect(fileDatabase.loadArticleWithUrl(articleObject3.url)).rejects.toThrow(NoArticleWithThisUrlError);
        })

        test('returns the correct article', async () => {
            const result = await fileDatabase.loadArticleWithUrl(articleObject1.url);
            expect(result).toMatchObject(articleObject1);
        })
    })

    describe('saveModifiedArticle', () => {
        let tempDirPath;
        let databaseFilePath;
        let fileDatabase;

        let articleObject1;
        let articleObject2;
        let articlesArray;


        beforeEach(() => {
            tempDirPath = fs.mkdtempSync(
                path.join(
                    os.tmpdir(),
                    'vote_the_news_server_test_'
                )
            );

            articleObject1 = createArticleObject(1);
            articleObject2 = createArticleObject(2);
            
            articlesArray = [articleObject1, articleObject2];
            
            databaseFilePath = tempDirPath + '/file_database.json'
            fs.writeFileSync(databaseFilePath, JSON.stringify(articlesArray));
            fileDatabase = new FileDatabase(databaseFilePath);
        })
        
        afterEach(() => {
            fs.rmSync(tempDirPath, { recursive: true });
        })
        
        test(`returns ${NotAnArticleObjectError.name} if the modified article is not an article object`, async () => {
            const notArticleObject = {
                url: 'test2',
                id: 'test2',
                postTime: 'test2',
                numberOfVotes: 'test2',
                traplinkPreview: 'test2'
            };
            
            await expect(fileDatabase.saveModifiedArticle(notArticleObject)).rejects.toThrow(NotAnArticleObjectError);
        })
        
        test(`returns ${NoArticleWithThisIDError.name} if there is no article with the same id in the database`, async () => {
            const articleObject3 = createArticleObject(3);
            
            await expect(fileDatabase.saveModifiedArticle(articleObject3)).rejects.toThrow(NoArticleWithThisIDError);
        })
        
        test('save the modified artilce', async () => {
            const modifiedArticleObject2 = articleObject2
            modifiedArticleObject2['url'] = 'newUrl'

            await fileDatabase.saveModifiedArticle(modifiedArticleObject2);
            const modifiedArticlesArray = [articleObject1, modifiedArticleObject2];
            const result = await fileDatabase.loadAllArticlesArray();
            expect(result).toMatchObject(modifiedArticlesArray);
        })
    })
})

function createArticleObject(integer) {
    const article = {
        url: `test${integer}`,
        id: `test${integer}`,
        postTime: `test${integer}`,
        numberOfVotes: integer,
        linkPreview: {
            title: `test${integer}`,
            description: `test${integer}`,
            domain: `test${integer}`,
            img: `test${integer}`
        }
    }
    return article;
}