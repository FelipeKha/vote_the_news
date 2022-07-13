import express from 'express';
import passport from 'passport';

import { database, dataManagement } from '../dataManagement_object.js';
import catchAsync from '../utils/catchAsync.js';
import isLoggedIn from '../utils/middleware.js';

const router = express.Router();

router.get('/register', (req, res) => {
    res.send('You are in register');
})

router.post('/register', catchAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new database.userModel({ email, username });
        const registeredUser = await database.userModel.register(user, password);
        req.login(registeredUser, (e) => {
            if (e) return next(e);
            console.log('registered');
            res.status(200).send({
                message: 'user created',
                user: registeredUser
            });
        })
    } catch (e) {
        res.send(e);
    }
}))

router.get('/login', (req, res) => {
    res.status(401).send({ message: 'username or password invalid' });
})

router.post(
    '/login',
    passport.authenticate(
        'local',
        { failureRedirect: '/login' }
    ),
    (req, res) => {
        res.status(200).send({
            message: 'successfully logged in',
            user: req.user
        });
        console.log('In login:', req.session);
    })

router.get('/logout', (req, res) => {
    console.log('In logout:', req.session);
    req.logout((e) => {
        if (e) {
            return next(e);
        }
        res.status(200).send({ message: 'successfully logged out' });
    });
})

router.get('/isloggedin', isLoggedIn, (req, res) => {
    res.status(200).send({
        isLoggedIn: true,
        user: req.user
    })
})

router.get('/articlesposted', isLoggedIn, async (req, res) =>{
    console.log('Request for posted articles');
    const userId = req.user._id;
    const userPosts = await dataManagement.loadAllUserPostsArray(userId);
    res.status(200).send(userPosts);
})


router.get('/articlesupvoted', isLoggedIn, async (req, res) =>{
    console.log('Request for upvoted articles');
    const userId = req.user._id;
    const userUpVotes = await dataManagement.loadAllUserUpVotesArray(userId);
    res.status(200).send(userUpVotes);
})

export { router };