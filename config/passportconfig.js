var passport = require('passport')
var Strategy = require('passport-facebook').Strategy

const User = require('../models/user')
const setup = require('./settings');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new Strategy({
    clientID: setup.CLIENT_ID,
    clientSecret: setup.CLIENT_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields:['id','email', 'profileUrl', 'picture', 'name', 'age_range']
  }, function(accessToken, refreshToken, profile, done) {
        var new_user = new User({
            email:profile.emails[0].value,
            firstname:profile.name.givenName,
            lastname : profile.name.familyName,
            photo : profile.photos[0].value,
            token: accessToken

        })
        console.log(new_user);
        // /* save if new */
        User.findOne({ email : profile.emails[0].value }, function(err, u) {
            if(!u) {
                new_user.save(function(err, user) {
                    if(err) return done(err)
                    console.log(user)
                    done(null,user)
                });
            } else {
                console.log(u)
                done(null, u)
            }
        })
  }
))


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

module.exports = passport
