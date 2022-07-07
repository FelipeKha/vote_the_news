import express from 'express';
import passport from 'passport';

import { database } from '../dataManagement_object.js';
import catchAsync from '../utils/catchAsync.js';

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
            res.send(registeredUser);
        })
    } catch (e) {
        res.send(e);
    }
}))

router.get('/login', (req, res) => {
    res.send('This is the login page')
})

router.post(
    '/login',
    passport.authenticate(
        'local',
        { failureFlash: true, failureRedirect: '/login' }
    ),
    (req, res) => {
        res.send('Successfully logged in');
    })

router.get('/logout', (req, res) => {
    req.logout((e) => {
        if (e) {
            return next(e);
        }
        res.send('You are logged out');
    });
})

export { router };