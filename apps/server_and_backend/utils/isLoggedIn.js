const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.send('You must be logged in');
    }
    next();
}

export default isLoggedIn;