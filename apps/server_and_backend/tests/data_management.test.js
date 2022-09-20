import mongoose from 'mongoose';
import { spyOn } from 'jest-mock';

import ArticleManagement from '../article_management';
import assert, { AssertionError } from 'node:assert';
import {
    InvalidURLError,
    ArticleAlreadyPostedError,
    ArticleAlreadyHasLinkPreviewError,
    NoArticleWithThisIDError,
} from '../errors';


describe("ArticleManagement", () => {
    describe("isValidDate", () => {
        test("returns false if the input object has an invalid date in its postTime property", () => {
            const invalidDate = { "postTime": "notADate" };
            expect(ArticleManagement.isValidDate(invalidDate)).toBe(false);
        })

        test("returns true if the input object has a valid date in its postTime property", () => {
            const invalidDate = { "postTime": Date() };
            expect(ArticleManagement.isValidDate(invalidDate)).toBe(true);
        })
    })

    describe('hasPostTimeProperty', () => {
        test("returns false if the input object doesn't have a postTime property", () => {
            const noPostTimeProperty = { test: "no post time" };
            expect(ArticleManagement.hasPostTimeProperty(noPostTimeProperty)).toBe(false);
        })

        test("returns true if the input object has a postTime property", () => {
            const withPostTimeProperty = { postTime: "no post time" };
            expect(ArticleManagement.hasPostTimeProperty(withPostTimeProperty)).toBe(true);
        })
    })

    describe('createNewArticleObject', () => {
        test("returns new article object with expected items", () => {
            let testPassed = true;
            const articleKeys = ['url', '_id', 'postTime', 'author'];
            const newArticleUrl = 'newArticleUrl';
            const newArticle = ArticleManagement.createNewArticleObject(newArticleUrl);

            const newArticleKeys = Object.keys(newArticle);

            for (let item of newArticleKeys) {
                if (!articleKeys.includes(item)) {
                    testPassed = false;
                }
            }

            if (
                (typeof newArticle.url !== 'string') ||
                (!(newArticle._id instanceof mongoose.Types.ObjectId)) ||
                (typeof newArticle.postTime !== 'number')
            ) {
                testPassed = false;
            }

            expect(testPassed).toBe(true);
        })
    })

    describe('isValidHttpUrl', () => {
        test('returns false if input is an invalid url', () => {
            const invalidUrl = 'notAnUrl';
            expect(ArticleManagement.isValidHttpUrl(invalidUrl)).toBe(false);
        })

        test('returns true if input is a valid url', () => {
            const validUrl = 'https://www.lemonde.fr';
            expect(ArticleManagement.isValidHttpUrl(validUrl)).toBe(true);
        })
    })

    describe('getSortedArticlesArray', () => {
        test('returns expected content', async () => {
            let testPassed = true
            const fileDataBase = new MockFileDatabase();
            const linkPreview = new MockLinkPreview();
            const articleManagement = new ArticleManagement(fileDataBase, linkPreview);

            const expectedResult = [
                {
                    url: "https://www.nytimes.com/2022/04/28/technology/twitter-musk-content-moderators.html",
                    id: "f5b31ed5-3f8a-459e-8b04-6c74db692921",
                    postTime: "Thu Apr 28 2022 14:37:33 GMT-0500 (Central Daylight Time)",
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
                    linkPreview: {
                        title: "An Unsteady Moment for Tech",
                        description: "The past decade has been one long party for tech. Where we go from here isn’t so clear.",
                        domain: "www.nytimes.com",
                        img: "https://static01.nyt.com/images/2022/04/28/autossell/Optimism-first-frame/Optimism-first-frame-square640.jpg"
                    }
                }
            ];

            const articleArray = await articleManagement.getSortedArticlesArray();

            try {
                assert.deepStrictEqual(articleArray, expectedResult);
            } catch (e) {
                if (e instanceof AssertionError) {
                    testPassed = false;
                } else {
                    throw e;
                }
            }

            expect(testPassed).toBe(true);
        })
    })

    describe('getLinkPreview', () => {
        test('returns expected link preview object', async () => {
            let testPassed = true;
            const url = 'https://www.nytimes.com/2022/06/29/technology/crypto-crash-divide.html';
            const fileDataBase = new MockFileDatabase();
            const linkPreview = new MockLinkPreview();
            const articleManagement = new ArticleManagement(fileDataBase, linkPreview);

            const linkPreviewExpected = {
                "title": "Twitter reports growth in revenue and users as Elon Musk prepares to take over.",
                "description": "The social media company reported a 16 percent jump in daily active users from a year ago.",
                "domain": "www.nytimes.com",
                "img": "https://static01.nyt.com/images/2022/04/28/multimedia/28twitter-earnings/28twitter-earnings-articleLarge.jpg?quality=75&auto=webp&disable=upscale"
            };

            const linkPreviewFromMock = await articleManagement.getLinkPreview(url);

            try {
                assert.deepStrictEqual(linkPreviewExpected, linkPreviewFromMock);
            } catch (e) {
                if (e instanceof AssertionError) {
                    testPassed = false;
                } else {
                    throw e;
                }
            }

            expect(testPassed).toBe(true);
        })
    })

    describe('addLinkPreview', () => {
        test(`returns ${NoArticleWithThisIDError.name}if no article in the database with this id`, async () => {
            const nonExistingId = 'nonExistingId';
            const fileDataBase = new MockFileDatabase();
            const linkPreview = new MockLinkPreview();
            const articleManagement = new ArticleManagement(fileDataBase, linkPreview);

            const spy = spyOn(fileDataBase, 'loadArticleWithID').mockImplementation(() => {
                throw new NoArticleWithThisIDError();
            })

            await expect(articleManagement.addLinkPreview(nonExistingId)).rejects.toThrow(NoArticleWithThisIDError);

            spy.mockRestore();
        })


        test(`returns ${ArticleAlreadyHasLinkPreviewError.name} if article already has a link preview`, async () => {
            const articleWithLinkPreview = createArticleObject(1);
            const fileDataBase = new MockFileDatabase();
            const linkPreview = new MockLinkPreview();
            const articleManagement = new ArticleManagement(fileDataBase, linkPreview);

            const spy = spyOn(fileDataBase, 'loadArticleWithID').mockImplementation(() => {
                return articleWithLinkPreview;
            })

            await expect(articleManagement.addLinkPreview(articleWithLinkPreview._id)).rejects.toThrow(ArticleAlreadyHasLinkPreviewError);

            spy.mockRestore();

        })

        test('returns article with link preview added', async () => {
            let testPassed = true;
            const articleWithoutLinkPreview = {
                url: `test`,
                _id: new mongoose.Types.ObjectId,
                postTime: Date.now()
            }

            const fileDataBase = new MockFileDatabase();
            const linkPreview = new MockLinkPreview();
            const articleManagement = new ArticleManagement(fileDataBase, linkPreview);

            const spy = spyOn(fileDataBase, 'loadArticleWithID').mockImplementation(() => {
                return articleWithoutLinkPreview;
            })

            const expectedArticle = {
                url: articleWithoutLinkPreview.url,
                _id: articleWithoutLinkPreview._id,
                postTime: articleWithoutLinkPreview.postTime,
                linkPreview: {
                    title: "Twitter reports growth in revenue and users as Elon Musk prepares to take over.",
                    description: "The social media company reported a 16 percent jump in daily active users from a year ago.",
                    domain: "www.nytimes.com",
                    img: "https://static01.nyt.com/images/2022/04/28/multimedia/28twitter-earnings/28twitter-earnings-articleLarge.jpg?quality=75&auto=webp&disable=upscale"
                }
            }

            const articleResult = await articleManagement.addLinkPreview(articleWithoutLinkPreview._id);

            try {
                assert.deepStrictEqual(expectedArticle, articleResult);
            } catch (e) {
                if (e instanceof AssertionError) {
                    testPassed = false;
                } else {
                    throw e;
                }
            }

            expect(testPassed).toBe(true);

            spy.mockRestore();

        })

    })

    describe('postNewArticle', () => {
        test(`returns ${InvalidURLError.name} if url is invalid`, async () => {
            const invalidUrl = 'invalidUrl';
            const fileDataBase = new MockFileDatabase();
            const linkPreview = new MockLinkPreview();
            const articleManagement = new ArticleManagement(fileDataBase, linkPreview);

            await expect(articleManagement.postNewArticle(invalidUrl)).rejects.toThrow(InvalidURLError);
        })

        test(`returns ${ArticleAlreadyPostedError.name} if article with same url already posted`, async () => {
            const alreadyPostedUrl = 'https://www.nytimes.com/2022/06/23/technology/0-5-selfie.html';
            const fileDataBase = new MockFileDatabase();
            const linkPreview = new MockLinkPreview();
            const articleManagement = new ArticleManagement(fileDataBase, linkPreview);

            await expect(articleManagement.postNewArticle(alreadyPostedUrl)).rejects.toThrow(ArticleAlreadyPostedError);
        })

        test(`returns ${ArticleAlreadyPostedError.name} if article with same url already posted`, async () => {
            const alreadyPostedUrl = 'https://www.nytimes.com/2022/06/23/technology/0-5-selfie.html';
            const fileDataBase = new MockFileDatabase();
            const linkPreview = new MockLinkPreview();
            const articleManagement = new ArticleManagement(fileDataBase, linkPreview);

            await expect(articleManagement.postNewArticle(alreadyPostedUrl)).rejects.toThrow(ArticleAlreadyPostedError);
        })

        test('returns expected article object', async () => {
            let testPassed = true;

            const url = 'https://www.nytimes.com/2022/06/29/technology/crypto-crash-divide.html';
            const articleExpected = createArticleObject(1);
            articleExpected.url = url;

            const fileDataBase = new MockFileDatabase();
            const linkPreview = new MockLinkPreview();
            const articleManagement = new ArticleManagement(fileDataBase, linkPreview);

            const spy = spyOn(fileDataBase, 'saveModifiedArticle').mockImplementation(() => {
                return articleExpected;
            })

            const articleResult = await articleManagement.postNewArticle(url);

            try {
                assert.deepStrictEqual(articleExpected, articleResult);
            } catch (e) {
                if (e instanceof AssertionError) {
                    testPassed = false;
                } else {
                    throw e;
                }
            }

            expect(testPassed).toBe(true);

            spy.mockRestore();
        })


    })
})

class MockFileDatabase {
    loadArticlesArrayInfiniteScroll(lastPostTime) {
        const articlesArray = [
            {
                url: "https://www.nytimes.com/2022/04/28/technology/twitter-musk-content-moderators.html",
                id: "f5b31ed5-3f8a-459e-8b04-6c74db692921",
                postTime: "Thu Apr 28 2022 14:37:33 GMT-0500 (Central Daylight Time)",
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

    loadArticleWithID(id) {
        const articleWithoutLinkPreview = {
            url: `test`,
            _id: id,
            postTime: Date.now()
        }
        return articleWithoutLinkPreview;
    }

    saveModifiedArticle(article) {
        return article
    }
}

class MockLinkPreview {
    linkPreview(url) {
        url;
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
        linkPreview: {
            title: `test${integer}`,
            description: `test${integer}`,
            domain: `test${integer}`,
            img: `test${integer}`
        }
    }
    return article;
}