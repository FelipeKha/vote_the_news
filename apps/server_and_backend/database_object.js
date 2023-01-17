import * as dotenv from 'dotenv';

import ArticleManagement from './article_management.js';
import articleSchema from "./models/article.js";
import Database from './database.js';
import LinkPreview from './link_preview.js';
import notificationUpvoteSchema from './models/notificationUpvote.js';
import UserManagement from './user_management.js';
import userSchema from './models/user.js';
import voteSchema from './models/vote.js';

dotenv.config();

const osPlatform = process.platform;

console.log("Mongo string: ", process.env.MONGO_CONNECTION_STRING);

// const databaseUrl = process.env.CONNECTIONSTRING;
const database = new Database(
    process.env.MONGO_CONNECTION_STRING,
    articleSchema,
    userSchema,
    voteSchema,
    notificationUpvoteSchema
);
await database.connectToDatabase();
database.associateModelToConnection();
// const linkPreview = new LinkPreview();
// const articleManagement = new ArticleManagement(database, linkPreview)
// const userManagement = new UserManagement(database);

export { database };