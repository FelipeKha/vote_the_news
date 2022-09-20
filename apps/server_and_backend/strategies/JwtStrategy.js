import passport from "passport";
import { Strategy as JwtStrategy } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";

import { database } from "../database_object.js";

const jwtSecret = process.env.JWT_SECRET;

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret
}

passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
        database.userModel.findOne({ _id: jwt_payload._id }, (err, user) => {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
    })
)