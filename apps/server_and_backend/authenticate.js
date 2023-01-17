import * as dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import passport from "passport";

dotenv.config();

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false,
    signed: true,
    // domain: ".votethenews.com",
    maxAge: eval(process.env.MONTH_IN_MILISECONDS)
}

const jwtSecret = process.env.JWT_SECRET

function getToken(user) {
    const token = jwt.sign(user, jwtSecret, {
        expiresIn: eval(process.env.QUARTER_HOUR_IN_SECONDS)
    })
    return token;
}

const WsTokenSecret = process.env.WS_TOKEN_SECRET

function getWsToken(user) {
    const WsToken = jwt.sign(user, WsTokenSecret, {
        expiresIn: eval(process.env.MINUTE_IN_SECONDS)
    })
    return WsToken;
}

const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

function getRefreshToken(user) {
    const refreshToken = jwt.sign(user, refreshTokenSecret, {
        expiresIn: eval(process.env.MONTH_IN_SECONDS)
    })
    return refreshToken;
}

const verifyUser = passport.authenticate("jwt", { session: false });

export {
    COOKIE_OPTIONS,
    getToken,
    getRefreshToken,
    getWsToken,
    verifyUser
}