import express from 'express';
import session from 'express-session';
import cors from 'cors';
import passport from 'passport';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import { } from "./strategies/LocalStrategy.js";
import { } from "./strategies/JwtStrategy.js";
import { } from "./authenticate.js"
import { router as articlesRouter } from './routes/articlesRoutes.js';
import { router as usersRouter } from './routes/usersRoutes.js';
// import ExpressError from './utils/ExpressError.js';

const app = express();
const port = 4000;

// To be modified for production app
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    optionSuccessStatus: 200
}
const sessionConfig = {
    secret: 'thisisnotagoodsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
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

