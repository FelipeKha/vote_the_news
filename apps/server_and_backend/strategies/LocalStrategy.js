import passport from "passport";
import LocalStrategy from "passport-local";

import { database } from '../dataManagement_object.js';

passport.use(new LocalStrategy(database.userModel.authenticate()));
passport.serializeUser(database.userModel.serializeUser());