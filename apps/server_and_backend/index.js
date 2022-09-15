import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import passport from 'passport';
import session from 'express-session';

import { } from "./strategies/LocalStrategy.js";
import { } from "./strategies/JwtStrategy.js";
import { } from "./authenticate.js"
import { router as articlesRouter } from './routes/articlesRoutes.js';
import { router as usersRouter } from './routes/usersRoutes.js';
// import ExpressError from './utils/ExpressError.js';

dotenv.config();

const app = express();
const port = process.env.SERVER_PORT;

// To be modified for production app
const corsOptions = {
    origin: process.env.CORS_ORIGINS,
    credentials: true,
    optionSuccessStatus: 200
}

console.log(corsOptions);

const sessionConfig = {
    secret: 'thisisnotagoodsecret',
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
app.use(cookieParser("thisisnotagoodsecret"));
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

