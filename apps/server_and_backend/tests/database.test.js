// import { MongoClient as MongoClient } from 'mongodb';
import mongoose from 'mongoose';

import Database from '../database';
// import Article from '../models/article';
import articleSchema from '../models/article';
import {
  ArticleAlreadyPostedError,
  NoArticleWithThisIDError,
  InvalidArticleIDError,
  InvalidMongoUrlError,
  MongoCastError,
  MongoValidatorError,
  NoArticleWithThisUrlError
} from "../errors"

const tempMongoUrl = globalThis.__MONGO_URI__;

describe('Database', () => {
  describe('connectToDatabase', () => {
    // let database;
    // let conn;
    // let articleModel;

    // beforeEach(async () => {
    //   database = new Database(tempMongoUrl, articleSchema);
    //   conn = await database.connectToDatabase();
    //   articleModel = database.associateModelToConnection();
    // })

    // afterEach(async () => {
    //   await articleModel.deleteMany({});
    //   conn.close()
    // })

    // test(`returns ${InvalidMongoUrlError.name} if database url is invalid`, () => {
    //   const invalidUrl = 'invalidUrl';
    //   const database = new Database(invalidUrl, articleSchema);
    //   expect(() => database.connectToDatabase()).toThrow(InvalidMongoUrlError);
    // })

    test('does not returns an error if url is valid', async () => {
      const database = new Database(tempMongoUrl, articleSchema);
      const conn = await database.connectToDatabase();
      expect(conn.readyState).toBe(1);
      conn.close();
    })

  })

  describe('loadAllArticlesArray', () => {
    let database;
    let conn;
    let articleModel;

    beforeEach(async () => {
      database = new Database(tempMongoUrl, articleSchema);
      conn = await database.connectToDatabase();
      articleModel = database.associateModelToConnection();
    })

    afterEach(async () => {
      await articleModel.deleteMany({});
      conn.close()
    })

    test("returns expected content", async () => {
      const testFileContent = [createArticleObject(1), createArticleObject(2)];

      await articleModel.insertMany(testFileContent);

      const contentDatabase = await database.loadAllArticlesArray();

      const contained = articleArrayContainedInOtherArray(testFileContent, contentDatabase)

      expect(contained).toBe(true);
    })
  })

  describe('loadAllArticlesArraySortedByDates', () => {
    let database;
    let conn;
    let articleModel;

    beforeEach(async () => {
      database = new Database(tempMongoUrl, articleSchema);
      conn = await database.connectToDatabase();
      articleModel = database.associateModelToConnection();
    })

    afterEach(async () => {
      await articleModel.deleteMany({});
      conn.close()
    })

    test("returns expected content", async () => {
      const articleObject1 = createArticleObject(10);
      const articleObject2 = createArticleObject(20)
      const articleObject3 = createArticleObject(30)

      articleObject1.postTime = new Date('2022-06-01T15:07:04.898Z');
      articleObject2.postTime = new Date('2022-06-02T15:07:04.898Z');
      articleObject3.postTime = new Date('2022-06-03T15:07:04.898Z');

      const testFileContent = [
        articleObject3,
        articleObject1,
        articleObject2
      ];

      await articleModel.insertMany(testFileContent);

      const contentDatabase = await database.loadAllArticlesArraySortedByDates();

      const identical1 = articlesAreIdenticle(contentDatabase[0], articleObject3);
      const identical2 = articlesAreIdenticle(contentDatabase[1], articleObject2);
      const identical3 = articlesAreIdenticle(contentDatabase[2], articleObject1);

      // console.log(identical1, identical2, identical3);
      // console.log(contentDatabase);

      const articlesIdenticalAndOrdered = identical1 && identical2 && identical3;

      expect(articlesIdenticalAndOrdered).toBe(true);
    })
  })

  describe('saveAllArticlesArray', () => {
    let database;
    let conn;
    let articleModel;

    beforeEach(async () => {
      database = new Database(tempMongoUrl, articleSchema);
      conn = await database.connectToDatabase();
      articleModel = database.associateModelToConnection();
    })

    afterEach(async () => {
      await articleModel.deleteMany({});
      conn.close()
    })

    test(`returns ${MongoCastError.name} if one of the value of one of the new articles is not of the expected type`, async () => {
      const articleArrayCastError = [
        {
          url: `test`,
          _id: new mongoose.Types.ObjectId,
          postTime: 'notADate',
          numberOfVotes: 0
        },
        createArticleObject(1)
      ]
      await expect(database.saveAllArticlesArray(articleArrayCastError)).rejects.toThrow(MongoCastError);
    })

    test(`returns ${MongoValidatorError.name} if one of the key of one of the new articles is missing`, async () => {
      const articleObjectValidatorError = [
        {
          _id: new mongoose.Types.ObjectId,
          postTime: Date.now(),
          numberOfVotes: 0
        },
        createArticleObject(1)
      ]
      await expect(database.saveAllArticlesArray(articleObjectValidatorError)).rejects.toThrow(MongoValidatorError);
    })

    test('saves the new articles array', async () => {
      const articlesArray = [createArticleObject(1), createArticleObject(2)];

      await database.saveAllArticlesArray(articlesArray);

      const contentDatabase = await articleModel.find({});

      const contained = articleArrayContainedInOtherArray(articlesArray, contentDatabase);

      expect(contained).toBe(true);
    })
  })

  describe('saveNewArticle', () => {
    let database;
    let conn;
    let articleModel;

    beforeEach(async () => {
      database = new Database(tempMongoUrl, articleSchema);
      conn = await database.connectToDatabase();
      articleModel = database.associateModelToConnection();
    })

    afterEach(async () => {
      await articleModel.deleteMany({});
      conn.close()
    })

    test(`returns ${ArticleAlreadyPostedError.name} if new article already in database`, async () => {
      const articleObject1 = createArticleObject(1);
      const articleDoc1 = new articleModel(articleObject1);
      await articleDoc1.save();
      await expect(database.saveNewArticle(articleObject1)).rejects.toThrow(ArticleAlreadyPostedError);
    })

    test(`returns ${MongoCastError.name} if one of the value of the new article is not of the expected type`, async () => {
      const articleObjectCastError = {
        url: `test`,
        _id: new mongoose.Types.ObjectId,
        postTime: 'notADate',
        numberOfVotes: 0
      }
      await expect(database.saveNewArticle(articleObjectCastError)).rejects.toThrow(MongoCastError);
    })

    test(`returns ${MongoValidatorError.name} if one of the key of the new article is missing`, async () => {
      const articleObjectValidatorError = {
        _id: new mongoose.Types.ObjectId,
        postTime: Date.now(),
        numberOfVotes: 0
      }
      await expect(database.saveNewArticle(articleObjectValidatorError)).rejects.toThrow(MongoValidatorError);
    })

    test('saves the new article in the database', async () => {
      const articleObject1 = createArticleObject(1);
      await database.saveNewArticle(articleObject1);

      const articleDatabase1 = await articleModel.findById(articleObject1._id)
      const identical = articlesAreIdenticle(articleObject1, articleDatabase1);

      expect(identical).toBe(true);
    })
  })

  describe('loadArticleWithId', () => {
    let database;
    let conn;
    let articleModel;

    beforeEach(async () => {
      database = new Database(tempMongoUrl, articleSchema);
      conn = await database.connectToDatabase();
      articleModel = database.associateModelToConnection();
    })

    afterEach(async () => {
      await articleModel.deleteMany({});
      conn.close()
    })

    test(`returns ${InvalidArticleIDError.name} if id entered is not cast-able into an ObjectId`, async () => {
      const invalidID = 'notValidID'
      await expect(database.loadArticleWithID(invalidID)).rejects.toThrow(InvalidArticleIDError);
    })

    test(`returns ${NoArticleWithThisIDError.name} if no article with this id in database`, async () => {
      const articleObject = createArticleObject(1);
      await expect(database.loadArticleWithID(articleObject._id)).rejects.toThrow(NoArticleWithThisIDError);
    })

    test('returns the correct article', async () => {
      const articleObject1 = createArticleObject(1);
      const articleDocument1 = new articleModel(articleObject1);
      await articleDocument1.save();

      const articleDatabase1 = await database.loadArticleWithID(articleObject1._id);
      const identical = articlesAreIdenticle(articleObject1, articleDatabase1);

      expect(identical).toBe(true);
    })
  })

  describe('loadArticleWithUrl', () => {
    let database;
    let conn;
    let articleModel;

    beforeEach(async () => {
      database = new Database(tempMongoUrl, articleSchema);
      conn = await database.connectToDatabase();
      articleModel = database.associateModelToConnection();
    })

    afterEach(async () => {
      await articleModel.deleteMany({});
      conn.close()
    })

    test(`returns ${NoArticleWithThisUrlError.name} if no article with this url in database`, async () => {
      const urlNotInDatabse = 'urlNotInDatabase'
      await expect(database.loadArticleWithUrl(urlNotInDatabse)).rejects.toThrow(NoArticleWithThisUrlError);
    })

    test('returns the correct article', async () => {
      const articleObject1 = createArticleObject(1);
      const articleDocument1 = new articleModel(articleObject1);
      await articleDocument1.save();

      const articleDatabase1 = await database.loadArticleWithUrl(articleObject1.url);

      const identical = articlesAreIdenticle(articleObject1, articleDatabase1);

      expect(identical).toBe(true);
    })
  })

  describe('saveModifiedArticle', () => {
    let database;
    let conn;
    let articleModel;

    beforeEach(async () => {
      database = new Database(tempMongoUrl, articleSchema);
      conn = await database.connectToDatabase();
      articleModel = database.associateModelToConnection();
    })

    afterEach(async () => {
      await articleModel.deleteMany({});
      conn.close()
    })

    test(`returns ${InvalidArticleIDError.name} if id entered is not cast-able into an ObjectId`, async () => {
      const articleWithInvalidID = {
        _id: 'notAnID',
        url: "thisIsUrl",
        numberOfVotes: 8,
        postTime: Date.now(),
        __v: 0
      }
      await expect(database.saveModifiedArticle(articleWithInvalidID)).rejects.toThrow(InvalidArticleIDError);
    })

    test(`returns ${MongoCastError.name} if article entered is not valid`, async () => {
      const articleObject1 = createArticleObject(1);
      const articleDocument1 = new articleModel(articleObject1);
      await articleDocument1.save();

      const invalidArticle = {
        _id: articleObject1._id,
        url: 'hereIsTheUrl',
        numberOfVotes: 'notANumber',
        postTime: Date.now(),
        __v: 0
      }
      await expect(database.saveModifiedArticle(invalidArticle)).rejects.toThrow(MongoCastError);
    })

    test(`returns ${NoArticleWithThisIDError.name} if no article with this id in database`, async () => {
      const articleObject = createArticleObject(1);
      await expect(database.saveModifiedArticle(articleObject)).rejects.toThrow(NoArticleWithThisIDError);
    })

    test('save the modified article in the database', async () => {
      const articleObject1 = createArticleObject(1);
      const articleDocument1 = new articleModel(articleObject1);
      await articleDocument1.save();

      const modifiedArticle1 = {
        url: 'aBrandNewUrlForTesting',
        _id: articleDocument1._id,
        postTime: Date.now(),
        numberOfVotes: articleDocument1.numberOfVotes,
        linkPreview: {
          title: articleDocument1.linkPreview.title,
          description: articleDocument1.linkPreview.description,
          domain: articleDocument1.linkPreview.domain,
          img: articleDocument1.linkPreview.img
        }
      }

      const articleDatabase1 = await database.saveModifiedArticle(modifiedArticle1);
      const modifiedArticle1Database = await articleModel.findById(articleObject1._id)
      const identical = articlesAreIdenticle(modifiedArticle1, modifiedArticle1Database);

      expect(identical).toBe(true);
    })
  })

});


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

function articlesAreIdenticle(article1, article2) {
  let identical = false;

  // console.log(article1._id);
  // console.log(article2);

  // console.log(article1.url === article2.url);
  // console.log(article1._id.toString() === article2._id.toString());
  // console.log(getPostTimeNumber(article1) === getPostTimeNumber(article2));
  // console.log(article1.numberOfVotes === article2.numberOfVotes);
  // console.log(article1.linkPreview.title === article2.linkPreview.title);
  // console.log(article1.linkPreview.description === article2.linkPreview.description);
  // console.log(article1.linkPreview.domain === article2.linkPreview.domain);
  // console.log(article1.linkPreview.img === article2.linkPreview.img);


  if (
    article1.url === article2.url &&
    article1._id.toString() === article2._id.toString() &&
    getPostTimeNumber(article1) === getPostTimeNumber(article2) &&
    article1.numberOfVotes === article2.numberOfVotes &&
    article1.linkPreview.title === article2.linkPreview.title &&
    article1.linkPreview.description === article2.linkPreview.description &&
    article1.linkPreview.domain === article2.linkPreview.domain &&
    article1.linkPreview.img === article2.linkPreview.img
  ) {
    identical = true;
  }
  return identical
}

function getPostTimeNumber(article) {
  if (Number.isInteger(article.postTime)) {
    return article.postTime;
  } else if ((typeof article.postTime) === 'object') {
    return article.postTime.getTime();
  } else {
    throw new Error('Article postTime was not a number nor an object');
  }
}

function articleArrayContainedInOtherArray(articlesArrayContained, articlesArrayContaining) {
  let contained = true;
  articlesArrayContained.forEach((article) => {
    const articleCompared = articlesArrayContaining.find((element) => {
      return element._id.toString() === article._id.toString();
    })

    if (!articlesAreIdenticle(article, articleCompared)) {
      contained = false;
    }
  })
  return contained
}