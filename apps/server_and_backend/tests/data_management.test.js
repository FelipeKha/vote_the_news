import mongoose from 'mongoose';

import DataManagement from '../data_management';
import assert, { AssertionError } from 'node:assert';
import {
    InvalidURLError,
    ArticleAlreadyPostedError,
    ArticleAlreadyHasLinkPreviewError,
    FilePathIsNotAFileError,
    FileIsNotJsonExtensionError,
    FileDatabaseContainsNonArticleObjectError,
    NotAnArrayError,
    DoNotHavePostTimePropertyError,
    InvalidDateError
} from '../errors';


describe("DataManagement", () => {
    // describe("hasPostTimeProperty", () {
    //     test("returns false if the input object doesn't have a postTime property", () => {
    //         const noPostTimeProperty = { "test": "object" };
    //         expect(hasPostTimeProperty(noPostTimeProperty)).toBe(false);
    //     })

    //     test("returns true if the input object has a postTime property", () => {
    //         const withPostTimeProperty = { "postTime": "object" };
    //         expect(hasPostTimeProperty(withPostTimeProperty)).toBe(true);
    //     })
    // })


    describe("isValidDate", () => {
        test("returns false if the input object has an invalid date in its postTime property", () => {
            const invalidDate = { "postTime": "notADate" };
            expect(DataManagement.isValidDate(invalidDate)).toBe(false);
        })

        test("returns true if the input object has a valid date in its postTime property", () => {
            const invalidDate = { "postTime": Date() };
            expect(DataManagement.isValidDate(invalidDate)).toBe(true);
        })
    })


    // describe("sortArrayByPostingDate", () => {
    //     test(`returns ${NotAnArrayError.name} if input is not an array`, () => {
    //         const notAnArray = 'test'
    //         expect(() => DataManagement.sortArrayByPostingDate(notAnArray)).toThrow(NotAnArrayError);
    //     })

    //     test(`returns ${DoNotHavePostTimePropertyError.name} if one of the item of the input array doesn't have a postTime property`, () => {
    //         const arrayNoPostTimeProperty = [
    //             { "postTime": Date() },
    //             { "notPostTime": Date() }
    //         ]
    //         expect(() => DataManagement.sortArrayByPostingDate(arrayNoPostTimeProperty)).toThrow(DoNotHavePostTimePropertyError);
    //     })

    //     test(`returns ${InvalidDateError.name} if one of the item of the input array has an invalid date`, () => {
    //         const arrayPostTimeProperty = [
    //             { "postTime": Date() },
    //             { "postTime": "notADate" }
    //         ]
    //         expect(() => DataManagement.sortArrayByPostingDate(arrayPostTimeProperty)).toThrow(InvalidDateError);
    //     })

    //     test("returns array sorted in reverse chronological order ", () => {
    //         const time1 = new Date('Mon May 07 2022 18:44:03 GMT-0500 (Central Daylight Time)');
    //         const time2 = new Date('Mon May 08 2022 18:44:03 GMT-0500 (Central Daylight Time)');
    //         const time3 = new Date('Mon May 09 2022 18:44:03 GMT-0500 (Central Daylight Time)');
    //         const arrayNotOrdered = [
    //             { "postTime": time1 },
    //             { "postTime": time3 },
    //             { "postTime": time2 }
    //         ]
    //         const arrayOrdered = [
    //             { "postTime": time3 },
    //             { "postTime": time2 },
    //             { "postTime": time1 }
    //         ]

    //         let arrayAreIdenticals = true;
    //         const arrayOrderedByFunction = DataManagement.sortArrayByPostingDate(arrayNotOrdered);

    //         for (let i = 0; i < arrayOrdered.length; i++) {
    //             const dateOrdered = new Date(arrayOrdered[i].postTime);
    //             const dateOrderedByFunction = new Date(arrayOrderedByFunction[i].postTime);

    //             if (dateOrdered.toString() !== dateOrderedByFunction.toString()) {
    //                 arrayAreIdenticals = false;
    //             }
    //         }

    //         expect(arrayAreIdenticals).toBe(true);
    //     })
    // })

    describe('hasPostTimeProperty', () => {
        test("returns false if the input object doesn't have a postTime property", () => {
            const noPostTimeProperty = { test: "no post time" };
            expect(DataManagement.hasPostTimeProperty(noPostTimeProperty)).toBe(false);
        })

        test("returns true if the input object has a postTime property", () => {
            const withPostTimeProperty = { postTime: "no post time" };
            expect(DataManagement.hasPostTimeProperty(withPostTimeProperty)).toBe(true);
        })
    })

    describe('createNewArticleObject', () => {
        test("returns new article object with expected items", () => {
            let testPassed = true;
            const articleKeys = ['url', 'id', 'postTime', 'numberOfVotes'];
            const newArticleUrl = 'newArticleUrl';
            const newArticle = DataManagement.createNewArticleObject(newArticleUrl);

            const newArticleKeys = Object.keys(newArticle);

            for (let item of newArticleKeys) {
                if (!articleKeys.includes(item)) {
                    testPassed = false;
                }
            }

            // console.log(typeof newArticle.url === 'string');
            // console.log(newArticle.id instanceof mongoose.Types.ObjectId);
            // console.log(Object.prototype.toString.call('something'));
            // console.log(Object.prototype.toString.call(newArticle.postTime));
            // console.log(new Date('something') instanceof Date && toString(new Date('something')) !== 'Invalid Date');
            // console.log(Object.prototype.toString.call(new Date(newArticle.postTime)) === '[object Date]');
            // console.log(typeof newArticle.numberOfVotes === 'number');

            if (
                (typeof newArticle.url !== 'string') ||
                (!(newArticle.id instanceof mongoose.Types.ObjectId)) ||
                (typeof newArticle.postTime !== 'number') ||
                (typeof newArticle.numberOfVotes !== 'number')
            ) {
                testPassed = false;
            }

            expect(testPassed).toBe(true);
        })
    })

    describe('isValidHttpUrl', () => {
        test('returns false if input is an invalid url', () => {
            const invalidUrl = 'notAnUrl';
            expect(DataManagement.isValidHttpUrl(invalidUrl)).toBe(false);
        })

        test('returns true if input is a valid url', () => {
            const validUrl = 'https://www.lemonde.fr';
            expect(DataManagement.isValidHttpUrl(validUrl)).toBe(true);
        })
    })

    describe('getSortedArticlesArray', () => {
        test('returns expected content', async () => {
            let testPassed = true
            const fileDataBase = new MockFileDatabase();
            const linkPreview = new MockLinkPreview();
            const dataManagement = new DataManagement(fileDataBase, linkPreview);

            const expectedResult = [
                {
                    url: "https://www.nytimes.com/2022/04/28/technology/twitter-musk-content-moderators.html",
                    id: "f5b31ed5-3f8a-459e-8b04-6c74db692921",
                    postTime: "Thu Apr 28 2022 14:37:33 GMT-0500 (Central Daylight Time)",
                    numberOfVotes: 0,
                    linkPreview: {
                        title: "Inside Twitter, Fears Musk Will Return Platform to Its Early Troubles",
                        description: "Content moderators warn that Elon Musk doesn’t appear to understand the issues that he and the company will face if he drops its guardrails around speech.",
                        domain: "www.nytimes.com",
                        img: "https://static01.nyt.com/images/2022/04/28/business/28twitter-moderation1/merlin_205928799_05479b27-0eb8-48e6-8b77-3194925c3a54-articleLarge.jpg?quality=75&auto=webp&disable=upscale"
                    }
                },
                {
                    url: "https://www.nytimes.com/2022/04/28/technology/tech-uncertainty.html",
                    id: "4f32fa73-a474-43e7-b2d5-631accd6a225",
                    postTime: "Thu Apr 28 2022 14:30:40 GMT-0500 (Central Daylight Time)",
                    numberOfVotes: 0,
                    linkPreview: {
                        title: "An Unsteady Moment for Tech",
                        description: "The past decade has been one long party for tech. Where we go from here isn’t so clear.",
                        domain: "www.nytimes.com",
                        img: "https://static01.nyt.com/images/2022/04/28/autossell/Optimism-first-frame/Optimism-first-frame-square640.jpg"
                    }
                }
            ];

            const articleArray = await dataManagement.getSortedArticlesArray();

            console.log(articleArray);
            console.log(expectedResult);

            try {
                assert.deepStrictEqual(articleArray, expectedResult);
            } catch (e) {
                if (e instanceof AssertionError) {
                    testPassed = false;
                }
            }

            expect(testPassed).toBe(true);
        })
    })

    describe('addLinkPreview', () => {
        test(`returns ${ArticleAlreadyHasLinkPreviewError.name} if article already has a link preview`, async () => {
            const articleWithLinkPreview = createArticleObject(1);
            const fileDataBase = new MockFileDatabase();
            const linkPreview = new MockLinkPreview();
            const dataManagement = new DataManagement(fileDataBase, linkPreview);

            let spy = jest.spyOn(fileDataBase, 'loadArticleWithID').mockImplementation(() => {
                articleWithLinkPreview;
            })

            await expect(dataManagement.addLinkPreview(articleWithLinkPreview.id)).rejects.toThrow(InvalidURLError);
        })
    })

    describe('postNewArticle', () => {
        test(`returns ${InvalidURLError.name} if url is invalid`, async () => {
            const invalidUrl = 'invalidUrl';
            const fileDataBase = new MockFileDatabase();
            const linkPreview = new MockLinkPreview();
            const dataManagement = new DataManagement(fileDataBase, linkPreview);

            await expect(dataManagement.postNewArticle(invalidUrl)).rejects.toThrow(InvalidURLError);
        })

        test(`returns ${ArticleAlreadyPostedError.name} if article with same url already posted`, async () => {
            const alreadyPostedUrl = 'https://www.nytimes.com/2022/06/23/technology/0-5-selfie.html';
            const fileDataBase = new MockFileDatabase();
            const linkPreview = new MockLinkPreview();
            const dataManagement = new DataManagement(fileDataBase, linkPreview);

            await expect(dataManagement.postNewArticle(alreadyPostedUrl)).rejects.toThrow(ArticleAlreadyPostedError);
        })

        test(`returns ${ArticleAlreadyPostedError.name} if article with same url already posted`, async () => {
            const alreadyPostedUrl = 'https://www.nytimes.com/2022/06/23/technology/0-5-selfie.html';
            const fileDataBase = new MockFileDatabase();
            const linkPreview = new MockLinkPreview();
            const dataManagement = new DataManagement(fileDataBase, linkPreview);

            await expect(dataManagement.postNewArticle(alreadyPostedUrl)).rejects.toThrow(ArticleAlreadyPostedError);
        })
    })


})

class MockFileDatabase {
    loadAllArticlesArrayBySortedDates() {
        const articlesArray = [
            {
                url: "https://www.nytimes.com/2022/04/28/technology/twitter-musk-content-moderators.html",
                id: "f5b31ed5-3f8a-459e-8b04-6c74db692921",
                postTime: "Thu Apr 28 2022 14:37:33 GMT-0500 (Central Daylight Time)",
                numberOfVotes: 0,
                linkPreview: {
                    title: "Inside Twitter, Fears Musk Will Return Platform to Its Early Troubles",
                    description: "Content moderators warn that Elon Musk doesn’t appear to understand the issues that he and the company will face if he drops its guardrails around speech.",
                    domain: "www.nytimes.com",
                    img: "https://static01.nyt.com/images/2022/04/28/business/28twitter-moderation1/merlin_205928799_05479b27-0eb8-48e6-8b77-3194925c3a54-articleLarge.jpg?quality=75&auto=webp&disable=upscale"
                }
            },
            {
                url: "https://www.nytimes.com/2022/04/28/technology/tech-uncertainty.html",
                id: "4f32fa73-a474-43e7-b2d5-631accd6a225",
                postTime: "Thu Apr 28 2022 14:30:40 GMT-0500 (Central Daylight Time)",
                numberOfVotes: 0,
                linkPreview: {
                    title: "An Unsteady Moment for Tech",
                    description: "The past decade has been one long party for tech. Where we go from here isn’t so clear.",
                    domain: "www.nytimes.com",
                    img: "https://static01.nyt.com/images/2022/04/28/autossell/Optimism-first-frame/Optimism-first-frame-square640.jpg"
                }
            }
        ];
        return articlesArray;
    }

    saveNewArticle(newArticleObject) {
        if (newArticleObject.url === 'https://www.nytimes.com/2022/06/23/technology/0-5-selfie.html') {
            throw new ArticleAlreadyPostedError();
        } else {
            return newArticleObject;
        }
    }
}

class MockLinkPreview {
    linkPreview(url) {
        const linkPreview = {
            "title": "Twitter reports growth in revenue and users as Elon Musk prepares to take over.",
            "description": "The social media company reported a 16 percent jump in daily active users from a year ago.",
            "domain": "www.nytimes.com",
            "img": "https://static01.nyt.com/images/2022/04/28/multimedia/28twitter-earnings/28twitter-earnings-articleLarge.jpg?quality=75&auto=webp&disable=upscale"
        };
        return linkPreview;
    }
}

function createArticleObject(integer) {
    const article = {
        url: `test${integer}`,
        _id: new mongoose.Types.ObjectId,
        postTime: Date.now(),
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