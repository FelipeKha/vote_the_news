import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import passport from 'passport';
import session from 'express-session';

import ArticleManagement from './article_management.js';
import articleSchema from './models/article.js';
import Database from './database.js';
import LinkPreview from './link_preview.js';
import UserManagement from './user_management.js';
import userSchema from './models/user.js';
import voteSchema from './models/vote.js';
import { } from "./strategies/LocalStrategy.js";
import { } from "./strategies/JwtStrategy.js";
import { } from "./authenticate.js"
import { database } from './database_object.js';
import { router as articlesRouter } from './routes/articlesRoutes.js';
import { router as usersRouter } from './routes/usersRoutes.js';
// import ExpressError from './utils/ExpressError.js';

dotenv.config();

const app = express();
const port = process.env.SERVER_PORT;

const osPlatform = process.platform;
console.log("OS platform:", osPlatform);

let corsOrigin;
let databaseUrl;
let puppeteerExecutablePath;
if (osPlatform === 'darwin') {
    corsOrigin = process.env.CORS_ORIGINS;
    databaseUrl = process.env.MONGO_CONNECTION_STRING_LOCAL;
    puppeteerExecutablePath = process.env.PUPPETEER_EXECUTABLE_PATH_LOCAL;
} else if (osPlatform === 'linux') {
    corsOrigin = process.env.CORS_ORIGINS;
    databaseUrl = process.env.MONGO_CONNECTION_STRING_DOCKER;
    puppeteerExecutablePath = process.env.PUPPETEER_EXECUTABLE_PATH_DOCKER;
}

// const database = new Database(
//     databaseUrl,
//     articleSchema,
//     userSchema,
//     voteSchema
// );
// await database.connectToDatabase();
// database.associateModelToConnection();

const linkPreview = new LinkPreview(puppeteerExecutablePath);
const articleManagement = new ArticleManagement(database, linkPreview);
const userManagement = new UserManagement(database);

// To be modified for production app
const corsOptions = {
    origin: corsOrigin,
    credentials: true,
    optionSuccessStatus: 200
}

const sessionSecret = process.env.SESSION_SECRET;

const sessionConfig = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + eval(process.env.WEEK_IN_MILISECONDS),
        maxAge: eval(process.env.WEEK_IN_MILISECONDS)
    }
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser(sessionSecret));
app.use(cors(corsOptions));
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use('/', usersRouter);
app.use('/', articlesRouter);


// app.all('*', (req, res, next) => {
//     next(new ExpressError('Page not found', 404));
// })

// app.use((err, req, res, next) => {
//     const {statusCode = 500} = err;
//     if (!err.message) err.message = 'Something went wrong and we do not have an error message';
//     res.status(statusCode).send(err.message)
// })

app.listen(port, () => {
    console.log(`Listening port ${port}`);
})

export { articleManagement, userManagement };