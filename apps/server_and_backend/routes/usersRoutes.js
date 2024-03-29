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

        // database.userModel.register(
        //     new database.userModel({ username: req.body.username }),
        //     req.body.password,
        //     (err, user) => {
        //         if (err) {
        //             res.statusCode = 500;
        //             res.send(err);
        //         } else {
        //             user.firstName = req.body.firstName;
        //             user.lastName = req.body.lastName;
        //             user.nameDisplayed = req.body.nameDisplayed;
        //             const token = getToken({ _id: user._id });
        //             const refreshToken = getRefreshToken({ _id: user._id });
        //             user.refreshToken.push({ refreshToken });
        //             user.save((err, user) => {
        //                 if (err) {
        //                     res.statusCode = 500;
        //                     res.send(err);
        //                 } else {
        //                     res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
        //                     res.send({ success: true, token, username: user.nameDisplayed });
        //                 }
        //             })
        //         }
        //     }
        // )
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

    // const token = getToken({ _id: req.user._id });
    // const refreshToken = getRefreshToken({ _id: req.user._id });
    // database.userModel.findById(req.user._id)
    //     .then(user => {
    //         user.refreshToken.push({ refreshToken });
    //         user.save((err, user) => {
    //             if (err) {
    //                 res.statusCode = 500;
    //                 res.send(err);
    //             } else {
    //                 res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    //                 res.send({ success: true, token, username: user.nameDisplayed });
    //             }
    //         })
    //     },
    //         err => next(err)
    //     )
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


    //     try {
    //     database.userModel.findOne({ _id: userId })
    //         .then(user => {
    //             if (user) {
    //                 const tokenIndex = user.refreshToken.findIndex(
    //                     item => item.refreshToken === refreshToken
    //                 )
    //                 if (tokenIndex === -1) {
    //                     res.statusCode = 401;
    //                     res.send({ message: "Unauthorized" });
    //                 } else {
    //                     const token = getToken({ _id: userId });
    //                     const newRefreshToken = getRefreshToken({ _id: userId });
    //                     user.refreshToken[tokenIndex] = { refreshToken: newRefreshToken };
    //                     user.save((err, user) => {
    //                         if (err) {
    //                             res.statusCode = 500;
    //                             res.send(err);
    //                         } else {
    //                             res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
    //                             res.send({ success: true, token });
    //                         }
    //                     })
    //                 }
    //             } else {
    //                 res.statusCode = 401;
    //                 res.send({ message: "Unauthorized" });
    //             }
    //         },
    //             err => next(err)
    //         )
    // } catch(err) {
    //     res.statusCode = 401;
    //     res.send({ message: "Unauthorized" });
    // }
})

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


    // database.userModel.findById(req.user._id)
    //     .then(user => {
    //         const tokenIndex = user.refreshToken.findIndex(
    //             item => item.refreshToken === refreshToken
    //         )
    //         if (tokenIndex !== -1) {
    //             user.refreshToken.id(user.refreshToken[tokenIndex]._id).remove();
    //         }
    //         user.save((err, user) => {
    //             if (err) {
    //                 res.statusCode = 500;
    //                 res.send(err);
    //             } else {
    //                 res.clearCookie("refreshToken", COOKIE_OPTIONS);
    //                 res.send({ success: true });
    //             }
    //         })
    //     },
    //         err => next(err)
    //     )
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

export { router };