import DataManagement from './data_management.js';
import Database from './database.js';
import LinkPreview from './link_preview.js'
import articleSchema from "./models/article.js";
import userSchema from './models/user.js';
import voteSchema from './models/vote.js';

const databaseUrl = 'mongodb://localhost:27017/vote-the-news';
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