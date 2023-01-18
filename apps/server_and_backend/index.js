import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import jwt from 'jsonwebtoken';
import os, { type } from 'os';
import passport from 'passport';
import session from 'express-session';
import { WebSocketServer } from 'ws';

import ArticleManagement from './article_management.js';
import LinkPreview from './link_preview.js';
import UserManagement from './user_management.js';
import { } from "./strategies/LocalStrategy.js";
import { } from "./strategies/JwtStrategy.js";
import { verifyUser } from "./authenticate.js"
import { database } from './database_object.js';
import { router as articlesRouter } from './routes/articlesRoutes.js';
import { router as usersRouter } from './routes/usersRoutes.js';
// import ExpressError from './utils/ExpressError.js';

dotenv.config();

const app = express();
const port = process.env.SERVER_PORT;

const osPlatform = process.platform;
console.log("OS platform:", osPlatform);

const corsOrigin = getCorsOriginsArray();

// console.log("IP address:", os.networkInterfaces());
// console.log(getIpAddress());
// console.log("Running in docker container: ", process.env.RUNNING_IN_DOCKER_CONTAINER);
// console.log("Running in digital ocean: ", process.env.RUNNING_IN_DIGITAL_OCEAN);

// const database = new Database(
//     process.env.MONGO_CONNECTION_STRING,
//     articleSchema,
//     userSchema,
//     voteSchema
// );
// await database.connectToDatabase();
// database.associateModelToConnection();

const linkPreview = new LinkPreview(process.env.PUPPETEER_EXECUTABLE_PATH);
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
        secure: false,
        signed: true,
        domain: ".votethenews.com",
        sameSite: "none",
        expires: Date.now() + eval(process.env.WEEK_IN_MILISECONDS),
        maxAge: eval(process.env.WEEK_IN_MILISECONDS)
    }
}

function getIpAddress() {
    const networkInterfaces = os.networkInterfaces();
    const results = {};
    for (let key of Object.keys(networkInterfaces)) {
        for (let network of networkInterfaces[key]) {
            const familyV4Value = typeof network.family === 'string' ? "IPv4" : 4;
            if (network.family === familyV4Value && !network.internal) {
                if (!results[key]) {
                    results[key] = [];
                }
                results[key].push(network.address);
            }
        }
    }
    return results;
}

function getCorsOriginsArray() {
    const reactAppPort = process.env.REACT_APP_PORT
    const IpAddressesObject = getIpAddress();
    let corsOriginsArray = [];
    for (let key of Object.keys(IpAddressesObject)) {
        for (let item of IpAddressesObject[key]) {
            const origin = "http://" + item + ":" + reactAppPort;
            corsOriginsArray.push(origin);
        }
    }
    const localHostUrl = process.env.LOCAL_HOST_URL;
    const digitalOceanUrl = process.env.DIGITAL_OCEAN_URL;
    const domainUrl = process.env.DOMAIN_URL;
    const domainUrlWww = process.env.DOMAIN_URL_WWW;
    corsOriginsArray.push(localHostUrl, digitalOceanUrl, domainUrl, domainUrlWww);
    console.log("CORS origins: ", corsOriginsArray);
    return corsOriginsArray;
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

const wss = new WebSocketServer({ port: process.env.WEBSOCKET_SERVER_PORT });

wss.on('connection', async (ws, request) => {
    ws.isAlive = true;

    ws.on('message', async message => {
        const result = JSON.parse(message);

        if (result.userId && result.wsToken) {
            const { userId, wsToken } = result;
            ws.userId = userId;
            const WsTokenSecret = process.env.WS_TOKEN_SECRET;
            const decodedWsToken = jwt.verify(wsToken, WsTokenSecret);

            if (decodedWsToken._id === ws.userId) {
                const user = await userManagement.loadUserWithId(ws.userId);
                if (user.wsToken === wsToken) {
                    const notificationCount = await userManagement.getNotificationCount(ws.userId);
                    const messageNotifCount = JSON.stringify({ "notificationCount": notificationCount });
                    ws.send(messageNotifCount);
                    ws.lastNotifCountSent = JSON.parse(messageNotifCount).notificationCount;
                } else {
                    ws.close();
                }
            } else {
                ws.close();
            }
        } else if (result.pong === true) {
            heartbeat();
        }
    })

    const intervalId = setInterval(sendNewNotifCount, 5000);

    ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(intervalId);
    })

    ws.onerror = (error) => {
        console.log('THERE WAS AN ERROR:');
        console.log(error);
    }

    async function sendNewNotifCount() {
        if (ws.readyState === 3) return clearInterval(intervalId);
        const newNotifCount = await userManagement.getNotificationCount(ws.userId);;
        if (ws.lastNotifCountSent !== newNotifCount) {
            const newMessageNotifCount = JSON.stringify({ "notificationCount": newNotifCount });
            ws.send(newMessageNotifCount);
            ws.lastNotifCountSent = JSON.parse(newMessageNotifCount).notificationCount;
        }
    };

    function heartbeat() {
        ws.isAlive = true;
    }

})

const intervalCloseBrokenWs = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.send(JSON.stringify({ "ping": true }));
    });
}, 30000);

wss.on('close', function close() {
    clearInterval(intervalCloseBrokenWs);
});

app.listen(port, () => {
    console.log(`Listening port ${port}`);
})


export { articleManagement, userManagement };