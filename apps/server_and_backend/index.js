import express from 'express';
import cors from 'cors';

import {router as articlesRouter} from './routes/articles_routes.js';
// import ExpressError from './utils/ExpressError.js';

const app = express();
const port = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// To be modified for production app
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
}
app.use(cors(corsOptions));

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

