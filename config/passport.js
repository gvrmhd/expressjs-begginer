const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/user');

module.exports = function (passport) {
    //Local strategy
    passport.use(new LocalStrategy((username, password, done) => {
        let query = { username: username };
        User.findOne(query, (err, doc) => {
            if(err) throw err;
            if(!doc) return done(null, false, {message: 'Username Not Found !'});
            
            bcrypt.compare(password, doc.password, 
                (errs, match) => {
                    if(errs) throw errs;
                    if (match) {
                        return done(null, doc, {message: 'Login Success !'});
                    } else {
                        return done(null, false, {message: 'Wrong Password !'});
                    }
            });
        });
    }));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
}
