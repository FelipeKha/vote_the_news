import * as dotenv from 'dotenv';

import articleSchema from "./models/article.js";
import Database from './database.js';
import notificationUpvoteSchema from './models/notificationUpvote.js';
import userSchema from './models/user.js';
import voteSchema from './models/vote.js';

dotenv.config();

const database = new Database(
    process.env.MONGO_CONNECTION_STRING,
    articleSchema,
    userSchema,
    voteSchema,
    notificationUpvoteSchema
);
await database.connectToDatabase();
database.associateModelToConnection();

export { database };