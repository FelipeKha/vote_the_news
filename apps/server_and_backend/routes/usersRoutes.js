import express from 'express';
import passport from 'passport';
import jwt from "jsonwebtoken";

import { database, dataManagement } from '../dataManagement_object.js';
import { COOKIE_OPTIONS, getToken, getRefreshToken, verifyUser } from '../authenticate.js';
import catchAsync from '../utils/catchAsync.js';
import isLoggedIn from '../utils/middleware.js';

const router = express.Router();

router.post('/signup', catchAsync(async (req, res) => {
    console.log(req.body);
    console.log(await database.userModel.find());
    if (!req.body.firstName || !req.body.lastName) {
        res.statusCode = 500;
        res.send({
            name: "FirstNameError",
            message: "First and last names are required"
        })
    } else {
        database.userModel.register(
            new database.userModel({ username: req.body.username }),
            req.body.password,
            (err, user) => {
                if (err) {
                    res.statusCode = 500;
                    res.send(err);
                } else {
                    user.firstName = req.body.firstName;
                    user.lastName = req.body.lastName;
                    user.nameDisplayed = req.body.nameDisplayed;
                    const token = getToken({ _id: user._id });
                    const refreshToken = getRefreshToken({ _id: user._id });
                    user.refreshToken.push({ refreshToken });
                    user.save((err, user) => {
                        if (err) {
                            res.statusCode = 500;
                            res.send(err);
                        } else {
                            res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
                            res.send({ success: true, token });
                        }
                    })
                }
            }
        )
    }
}))

router.post('/login', passport.authenticate('local'), (req, res, next) => {
    const token = getToken({ _id: req.user._id });
    const refreshToken = getRefreshToken({ _id: req.user._id });
    database.userModel.findById(req.user._id)
        .then(user => {
            user.refreshToken.push({ refreshToken });
            user.save((err, user) => {
                if (err) {
                    res.statusCode = 500;
                    res.send(err);
                } else {
                    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
                    res.send({ success: true, token });
                }
            })
        },
            err => next(err)
        )
})

router.post("/refreshToken", (req, res, next) => {
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;
    if (refreshToken) {
        try {
            const payload = jwt.verify(refreshToken, "thisisnotagoodsecret");
            const userId = payload._id;
            database.userModel.findOne({ _id: userId })
                .then(user => {
                    if (user) {
                        const tokenIndex = user.refreshToken.findIndex(
                            item => item.refreshToken === refreshToken
                        )
                        if (tokenIndex === -1) {
                            res.statusCode = 401;
                            res.send({ message: "Unauthorized" });
                        } else {
                            const token = getToken({ _id: userId });
                            const newRefreshToken = getRefreshToken({ _id: userId });
                            user.refreshToken[tokenIndex] = { refreshToken: newRefreshToken };
                            user.save((err, user) => {
                                if (err) {
                                    res.statusCode = 500;
                                    res.send(err);
                                } else {
                                    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
                                    res.send({ success: true, token });
                                }
                            })
                        }
                    } else {
                        res.statusCode = 401;
                        res.send({ message: "Unauthorized" });
                    }
                },
                    err => next(err)
                )
        } catch (err) {
            res.statusCode = 401;
            res.send({ message: "Unauthorized" });
        }
    } else {
        res.statusCode = 401;
        res.send({ message: "Unauthorized" });
    }
})

router.get('/me', verifyUser, (req, res, next) => {
    res.send(req.user);
})


router.get('/logout', verifyUser, (req, res, next) => {
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;
    database.userModel.findById(req.user._id)
        .then(user => {
            const tokenIndex = user.refreshToken.findIndex(
                item => item.refreshToken === refreshToken
            )
            if (tokenIndex !== -1) {
                user.refreshToken.id(user.refreshToken[tokenIndex]._id).remove();
            }
            user.save((err, user) => {
                if (err) {
                    res.statusCode = 500;
                    res.send(err);
                } else {
                    res.clearCookie("refreshToken", COOKIE_OPTIONS);
                    res.send({ success: true });
                }
            })
        },
            err => next(err)
        )
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
    const userPosts = await dataManagement.loadAllUserPostsArray(userId);
    res.status(200).send(userPosts);
})


router.get('/articlesupvoted', isLoggedIn, async (req, res) => {
    console.log('Request for upvoted articles');
    const userId = req.user._id;
    const userUpVotes = await dataManagement.loadAllUserUpVotesArray(userId);
    res.status(200).send(userUpVotes);
})

export { router };