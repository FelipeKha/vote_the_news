const isLoggedIn = (req, res, next) => {
    // console.log('isLoggedIn:', req.session);
    if (!req.isAuthenticated()) {
        return res.status(401).send({
            isLoggedIn: false,
            message: 'you must be logged in'
        });
    }
    next();
}

export default isLoggedIn;