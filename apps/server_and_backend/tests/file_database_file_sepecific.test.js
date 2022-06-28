import FileDatabase from '../file_database';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
    FilePathIsNotAFileError,
    FileIsNotJsonExtensionError,
    InvalidPathError, 
    NotAnArrayError,
    NotAnObjectError,
    FileDatabaseContainsNonArticleObjectError,
    NewArticlesArrayContainsNonArticleObjectError
} from '../errors';
import exp from 'constants';


describe('FileDatabase', () => {
    describe('Constructor', () => {
        let tempDirPath

        // tempDirPath = fs.mkdtempSync(
        //     path.join(
        //         os.tmpdir(),
        //         'vote_the_news_server_test_'
        //     )
        // );
        // databaseFilePathNotJson = tempDirPath + '/not_json.txt'
        // databaseFilePathJsonContentNotJson = tempDirPath + '/json_content_not_json.json'
        // databaseFilePath = tempDirPath + '/database.json'
        // testArray = [
        //     [invalidDatabaseFilePath, InvalidPath],
        //     [tempDirPath, FilePathIsNotAFile],
        //     [databaseFilePathNotJson, FileIsNotJsonExtension],
        //     [databaseFilePathJsonContentNotJson, SyntaxError]
        // ]

        // fs.writeFileSync(databaseFilePathNotJson, '');
        // fs.writeFileSync(databaseFilePathJsonContentNotJson, 'this is not json format');
        // fs.writeFileSync(databaseFilePath, '[{"test": "file"}]');

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

        // test.each(testArray)(`returns %o when database file path isn't a file`, (a, expected) => {
        //     expect(() => new FileDatabase(a)).toThrow(expected);
        // })


        test(`returns ${InvalidPathError.name} when invalid database file path`, () => {
            const invalidDatabaseFilePath = 'invalidFilePath'
            expect(() => new FileDatabase(invalidDatabaseFilePath)).toThrow(InvalidPathError);
        })

        test(`returns ${FilePathIsNotAFileError.name} when database file path isn't a file`, () => {
            const notAFilePath = tempDirPath
            expect(() => new FileDatabase(notAFilePath)).toThrow(FilePathIsNotAFileError);
        })

        test(`returns ${FileIsNotJsonExtensionError.name} error when database file doesn't have a .json extension`, () => {
            const databaseFilePathNotJson = tempDirPath + '/not_json.txt'
            fs.writeFileSync(databaseFilePathNotJson, '');
            expect(() => new FileDatabase(databaseFilePathNotJson)).toThrow(FileIsNotJsonExtensionError);
        })

        test(`returns ${SyntaxError.name} when database file content not in json format`, () => {
            const databaseFilePathJsonContentNotJson = tempDirPath + '/json_content_not_json.json'
            fs.writeFileSync(databaseFilePathJsonContentNotJson, 'this is not json format');
            expect(() => new FileDatabase(databaseFilePathJsonContentNotJson)).toThrow(SyntaxError);
        })

        test("doesn't return an error when database file is valid", () => {
            const databaseFilePath = tempDirPath + '/database.json'
            fs.writeFileSync(databaseFilePath, '[{"test": "file"}]');
            expect(() => new FileDatabase(databaseFilePath)).not.toThrow(Error);
        })
    })


    describe('arrayContainedInArray', () => {
        test(`returns ${NotAnArrayError.name} if one of the input is not an array`, () => {
            const notAnArray = 'text1';
            const anArray = ['text2', 'text3'];
            expect(() => FileDatabase.arrayContainedInArray(notAnArray, anArray)).toThrow(NotAnArrayError);
        })

        test("returns false if the array is not contained in the array", () => {
            const array1 = ['text1', 'text2'];
            const array2 = ['text3', 'text2'];
            expect(FileDatabase.arrayContainedInArray(array1, array2)).toBe(false);
        })

        test("returns true if the array is contained in the array", () => {
            const array1 = ['text1', 'text2'];
            const array2 = ['text3', 'text2'];
            expect(FileDatabase.arrayContainedInArray(array1, array2)).toBe(false);
        })
    })

    describe("isArticleObject", () => {
        test(`returns ${NotAnObjectError.name} if the input is not an object`, () => {
            const notAnObject = 'text'
            expect(() => FileDatabase.isArticleObject(notAnObject)).toThrow(NotAnObjectError);
        })

        test("returns false if the object is not an article object", () => {
            const notAnArticleObject = { url: 'test' }
            expect(FileDatabase.isArticleObject(notAnArticleObject)).toBe(false);
        })

        test("returns true if the object is an article object", () => {
            const articleObject = createArticleObject(1)
            expect(FileDatabase.isArticleObject(articleObject)).toBe(true);
        })

    })


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

        test(`returns ${FileDatabaseContainsNonArticleObjectError.name} if the database contains non article object`, async () => {
            const articleObject1 = createArticleObject(1);
            const articleObject2 = createArticleObject(2);
            const notArticleObject = {
                url: 'test2',
                id: 'test2',
                postTime: 'test2',
                numberOfVotes: 'test2',
                traplinkPreview: 'test2'
            };
            const invalidArticlesArray = [articleObject1, articleObject2, notArticleObject];
            const databaseFilePathInvalidDatabase = tempDirPath + '/invalide_database.json'
            fs.writeFileSync(databaseFilePathInvalidDatabase, JSON.stringify(invalidArticlesArray));

            const fileDatabase = new FileDatabase(databaseFilePathInvalidDatabase);
            await expect(fileDatabase.loadAllArticlesArray()).rejects.toThrow(FileDatabaseContainsNonArticleObjectError);

        })

        test(`returns ${NotAnArrayError.name} if the database is not an array`, async () => {
            const databaseFilePath = tempDirPath + '/file_database.json'
            fs.writeFileSync(databaseFilePath, JSON.stringify(''));

            const fileDatabase = new FileDatabase(databaseFilePath);
            await expect(fileDatabase.loadAllArticlesArray()).rejects.toThrow(NotAnArrayError);

        })

    })

    describe("saveAllArticlesArray", () => {
        let tempDirPath;
        let databaseFilePath;

        let articleObject1
        let articleObject2
        let notArticleObject

        beforeEach(() => {
            tempDirPath = fs.mkdtempSync(
                path.join(
                    os.tmpdir(),
                    'vote_the_news_server_test_'
                )
            );

            articleObject1 = createArticleObject(1);
            articleObject2 = createArticleObject(2);
            notArticleObject = {
                url: 'test2',
                id: 'test2',
                postTime: 'test2',
                numberOfVotes: 'test2',
                traplinkPreview: 'test2'
            };

            databaseFilePath = tempDirPath + '/file_database.json'
            fs.writeFileSync(databaseFilePath, JSON.stringify(''));
        })

        afterEach(() => {
            fs.rmSync(tempDirPath, { recursive: true });
        })

        test(`return ${NotAnArrayError.name} if input is not an array`, () => {
            const fileDatabase = new FileDatabase(databaseFilePath);
            expect(() => fileDatabase.saveAllArticlesArray(articleObject1)).toThrow(NotAnArrayError);
        })
        
        test(`return ${NewArticlesArrayContainsNonArticleObjectError.name} if input contains a non article object`, () => {
            const invalidArticlesArray = [articleObject1, articleObject2, notArticleObject];

            const fileDatabase = new FileDatabase(databaseFilePath);
            expect(() => fileDatabase.saveAllArticlesArray(invalidArticlesArray)).toThrow(NewArticlesArrayContainsNonArticleObjectError);
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

