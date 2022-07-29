import passport from "passport";
import jwt from "jsonwebtoken";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false,
    signed: true,
    maxAge: 1000 * 60 * 60 * 24 * 30
}

function getToken(user) {
    const token = jwt.sign(user, "thisisnotagoodsecret", {
        expiresIn: 60 * 15
    })
    return token;
}

function getRefreshToken(user) {
    const refreshToken = jwt.sign(user, "thisisnotagoodsecret", {
        expiresIn: 60 * 60 * 24 * 30
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