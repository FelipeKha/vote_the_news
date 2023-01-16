import express from 'express';
import passport from 'passport';
import jwt from "jsonwebtoken";

import { articleManagement, userManagement } from '../index.js';
import { COOKIE_OPTIONS, getToken, getRefreshToken, verifyUser } from '../authenticate.js';
import catchAsync from '../utils/catchAsync.js';
import isLoggedIn from '../utils/middleware.js';

const router = express.Router();

router.post('/signup', catchAsync(async (req, res) => {
    const {
        firstName,
        lastName,
        nameDisplayed,
        username,
        password
    } = req.body;
    if (!firstName || !lastName) {
        res.statusCode = 500;
        res.send({
            name: "FirstNameError",
            message: "First and last names are required"
        })
    } else {
        try {
            const { user, token, refreshToken } = await userManagement.registerNewUser(
                firstName,
                lastName,
                nameDisplayed,
                username,
                password
            )
            res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
            res.send({ success: true, token, username: user.nameDisplayed })
        } catch (e) {
            throw e;
        }
    }
}))

router.post('/login', passport.authenticate('local'), async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { user, token, refreshToken } = await userManagement.loginUser(userId);
        res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
        res.send({ success: true, token, username: user.nameDisplayed });
    } catch (e) {
        throw e;
    }
})

router.post("/refreshToken", async (req, res, next) => {
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;
    if (refreshToken) {
        try {
            const payload = jwt.verify(refreshToken, refreshTokenSecret);
            const userId = payload._id;
            const user = await userManagement.loadUserWithId(userId);
            if (user) {
                const {
                    updatedUser,
                    newToken,
                    newRefreshToken
                } = await userManagement.saveNewRefreshToken(user, refreshToken);
                res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
                res.send({ success: true, newToken });
            } else {
                res.redirect('/logout')
            }
        } catch (e) {
            throw e;
        }
    } else {
        res.statusCode = 401;
        res.send({ message: "Unauthorized" });
    }
})

router.get('/wstoken', verifyUser, async (req, res, next) => {
    const userId = req.user._id;
    try {
        const wsToken = await userManagement.saveNewWsToken(userId);
        res.send({ wsToken: wsToken });
    } catch (e) {
        throw e;
    }
});

router.get('/me', verifyUser, (req, res, next) => {
    res.send(req.user);
})


router.get('/logout', verifyUser, async (req, res, next) => {
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;
    const userId = req.user._id;
    try {
        await userManagement.logoutUser(userId, refreshToken);
        res.clearCookie("refreshToken", COOKIE_OPTIONS);
        res.send({ success: true });
    } catch (e) {
        throw e;
    }
})

router.get('/isloggedin', isLoggedIn, (req, res) => {
    res.status(200).send({
        isLoggedIn: true,
        user: req.user
    })
})

router.get('/articlesposted', isLoggedIn, async (req, res) => {
    console.log('Request for posted articles');
    const userId = req.user._id;
    const userPosts = await articleManagement.loadAllUserPostsArray(userId);
    res.status(200).send(userPosts);
})

router.get('/articlesupvoted', isLoggedIn, async (req, res) => {
    console.log('Request for upvoted articles');
    const userId = req.user._id;
    const userUpVotes = await articleManagement.loadAllUserUpVotesArray(userId);
    res.status(200).send(userUpVotes);
})

router.post('/updateuserinfo', verifyUser, catchAsync(async (req, res) => {
    console.log(req.body);
    const {
        firstName,
        lastName,
        nameDisplayed,
        username
    } = req.body;
    const userId = req.user._id;
    if (!firstName || !lastName) {
        res.statusCode = 500;
        res.send({
            name: "FirstNameError",
            message: "First and last names are required"
        })
    } else {
        try {
            const updatedUser = await userManagement.updateUserInfo(
                userId,
                firstName,
                lastName,
                nameDisplayed,
                username
            )
            res.send({ success: true, username: updatedUser.nameDisplayed })
        } catch (e) {
            res.statusCode = 500;
            res.send({
                name: e.name,
                message: e.message
            })
            throw e;
        }
    }
}))

router.post('/changepassword', verifyUser, catchAsync(async (req, res) => {
    const { oldPassword, newPassword, newPasswordConfirm } = req.body;
    const userId = req.user._id;
    try {
        const updatedUser = await userManagement.changePassword(
            userId,
            oldPassword,
            newPassword,
            newPasswordConfirm
        );
        res.send({ success: true });
    } catch (e) {
        console.log('sending the error for change password');
        res.statusCode = 500;
        res.send({
            name: e.name,
            message: e.message
        })
        throw e;
    }
}))

export { router };