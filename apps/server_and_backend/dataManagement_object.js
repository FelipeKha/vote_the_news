import * as dotenv from 'dotenv';

import articleSchema from "./models/article.js";
import Database from './database.js';
import DataManagement from './data_management.js';
import LinkPreview from './link_preview.js'
import userSchema from './models/user.js';
import voteSchema from './models/vote.js';

dotenv.config();

const databaseUrl = process.env.MONGO_CONNECTION_STRING;
// const databaseUrl = process.env.CONNECTIONSTRING;
const database = new Database(
    databaseUrl,
    articleSchema,
    userSchema,
    voteSchema
);
await database.connectToDatabase();
database.associateModelToConnection();
const linkPreview = new LinkPreview();
const dataManagement = new DataManagement(database, linkPreview)

export { database, dataManagement };