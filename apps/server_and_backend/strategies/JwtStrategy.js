import passport from "passport";
import { Strategy as JwtStrategy } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";

import { database } from "../articleManagement_object.js";

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'thisisnotagoodsecret'
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