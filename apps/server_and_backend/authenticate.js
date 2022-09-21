import * as dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import passport from "passport";

dotenv.config();

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false,
    signed: true,
    maxAge: eval(process.env.MONTH_IN_MILISECONDS)
}

const jwtSecret = process.env.JWT_SECRET

function getToken(user) {
    const token = jwt.sign(user, jwtSecret, {
        expiresIn: eval(process.env.QUARTER_HOUR_IN_SECONDS)
    })
    return token;
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
    verifyUser
}