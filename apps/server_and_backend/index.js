import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import https from 'https';
import jwt from 'jsonwebtoken';
import os from 'os';
import passport from 'passport';
import session from 'express-session';
import { parse } from 'url';
import { WebSocketServer } from 'ws';

import ArticleManagement from './article_management.js';
import LinkPreview from './link_preview.js';
import UserManagement from './user_management.js';
import { } from "./strategies/LocalStrategy.js";
import { } from "./strategies/JwtStrategy.js";
import { database } from './database_object.js';
import { router as articlesRouter } from './routes/articlesRoutes.js';
import { router as usersRouter } from './routes/usersRoutes.js';
// import ExpressError from './utils/ExpressError.js';

dotenv.config();

const app = express();
const port = process.env.SERVER_PORT;

const corsOrigin = getCorsOriginsArray();

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
    const domainUrlS = process.env.DOMAIN_URL_S;
    const domainUrlSWww = process.env.DOMAIN_URL_S_WWW;
    corsOriginsArray.push(
        localHostUrl,
        digitalOceanUrl,
        domainUrl,
        domainUrlWww,
        domainUrlS,
        domainUrlSWww
    );
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

const privateKey = fs.readFileSync('/server_and_backend/keys_folder/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/server_and_backend/keys_folder/fullchain.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);

// Start websocket server notifications


const wssOptions = { noServer: true }
const wssNotif = new WebSocketServer(wssOptions);

wssNotif.on('connection', async (ws) => {
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
        } else {
            ws.close();
        }
    })

    const intervalId = setInterval(sendNewNotifCount, 5000);

    ws.on('close', () => {
        clearInterval(intervalId);
    })

    ws.onerror = (error) => {
        console.log('THERE WAS AN ERROR:');
        console.log(error);
    }

    async function sendNewNotifCount() {
        if (ws.readyState === 3) return clearInterval(intervalId);
        const newNotifCount = await userManagement.getNotificationCount(ws.userId);
        if (ws.lastNotifCountSent !== newNotifCount) {
            const newMessageNotifCount = JSON.stringify({ "notificationCount": newNotifCount });
            ws.send(newMessageNotifCount);
            ws.lastNotifCountSent = JSON.parse(newMessageNotifCount).notificationCount;
        }
    }

    function heartbeat() {
        ws.isAlive = true;
    }

})

const intervalCloseBrokenWs = setInterval(function ping() {
    wssNotif.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.send(JSON.stringify({ "ping": true }));
    });
}, 30000);

wssNotif.on('close', function close() {
    clearInterval(intervalCloseBrokenWs);
});

// End websocket server notifications

// Start websocket server votes

const wssVotesOptions = { noServer: true }
const wssVotes = new WebSocketServer(wssVotesOptions);

wssVotes.on('connection', async (ws) => {
    ws.isAlive = true;

    ws.on('message', async message => {
        const result = JSON.parse(message);

        if (result.articleIdArray !== undefined) {
            if (result.userId && result.wsToken) {
                const { userId, wsToken } = result;
                const WsTokenSecret = process.env.WS_TOKEN_SECRET;
                let decodedWsToken;
                try {
                    decodedWsToken = jwt.verify(wsToken, WsTokenSecret);
                } catch (e) {
                    ws.close();
                    console.log(e);
                }

                if (decodedWsToken._id === userId) {
                    const user = await userManagement.loadUserWithId(userId);
                    if (user.wsToken !== wsToken) {
                        ws.close();
                    } else {
                        ws.userId = userId;
                    }
                }
            }
            const { articleIdArray } = result;
            ws.articleIdArray = articleIdArray;
            const articleVotes = await articleManagement.getArticleVotes(ws.articleIdArray, ws.userId);
            const messageArtVotes = JSON.stringify({ articleVotes: articleVotes });
            ws.send(messageArtVotes);
            ws.lastArtVotesSent = JSON.parse(messageArtVotes).articleVotes;
        } else if (result.pong === true) {
            heartbeat();
        } else {
            ws.close();
        }
    })

    const intervalId = setInterval(sendNewVotesObject, 5000);

    ws.on('close', () => {
        clearInterval(intervalId);
    })

    ws.onerror = (error) => {
        console.log('THERE WAS AN ERROR:');
        console.log(error);
    }

    async function sendNewVotesObject() {
        if (ws.readyState === 3) return clearInterval(intervalId);
        const newVoteObject = await articleManagement.getArticleVotes(ws.articleIdArray, ws.userId);
        if (JSON.stringify(ws.lastArtVotesSent) !== JSON.stringify(newVoteObject)) {
            const newMessageVotes = JSON.stringify({ articleVotes: newVoteObject });
            ws.send(newMessageVotes);
            ws.lastArtVotesSent = JSON.parse(newMessageVotes).articleVotes;
        }
    }

    function heartbeat() {
        ws.isAlive = true;
    }

})

const intervalCloseBrokenWsVotes = setInterval(function ping() {
    wssVotes.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.send(JSON.stringify({ "ping": true }));
    });
}, 30000);

wssVotes.on('close', function close() {
    clearInterval(intervalCloseBrokenWsVotes);
});

httpsServer.on('upgrade', function upgrade(request, socket, head) {
    const { pathname } = parse(request.url);

    if (pathname === '/notif') {
        wssNotif.handleUpgrade(request, socket, head, function done(ws) {
            wssNotif.emit('connection', ws, request);
        });
    } else if (pathname === '/votes') {
        wssVotes.handleUpgrade(request, socket, head, function done(ws) {
            wssVotes.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

// End websocket server votes

httpsServer.listen(port, () => {
    console.log(`Listening port ${port}`);
})


export { articleManagement, userManagement };