var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    GoogleStrategy = require("passport-google-oauth20").Strategy,
    FacebookStrategy = require("passport-facebook").Strategy,
    cookieParser = require("cookie-parser"),
    LocalStrategy = require("passport-local"),
    flash        = require("connect-flash"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    session = require("express-session"),
    seedDB      = require("./seeds"),
    methodOverride = require("method-override");clearInterval()
    const keys = require("./config/keys");
// configure dotenv
require('dotenv').load();

//requiring routes
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index")
    
// assign mongoose promise library and connect to database
mongoose.Promise = global.Promise;

const databaseUri = process.env.MONGODB_URI || 'mongodb://localhost/yelp_camp';

mongoose.connect(databaseUri, { useMongoClient: true })
      .then(() => console.log(`Database connected`))
      .catch(err => console.log(`Database connection error: ${err.message}`));

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));
//require moment
app.locals.moment = require('moment');
// seedDB(); //seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Google auth
passport.use(new GoogleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    console.log("access Token: ", accessToken);
    console.log("refresh Token: ", refreshToken);
    console.log("profile ", profile);
    
}));
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));
app.get(
    '/auth/google/callback',
    passport.authenticate('google'),
    (err,req, res, next) => {
        if (err.name === 'TokenError') {
                console.log(err)
                res.redirect('/'); // redirect them back to the login page
            } else {
                console.log(err)
                res.redirect('/');
            }
        },
    (req, res) => { // On success, redirect back to '/'
        res.redirect('/');
    }
);
// facebook auth
//passport.use(new FacebookStrategy({
//    clientID: keys.facebookClientID,
 //   clientSecret: keys.facebookClientSecret,
//    callbackURL: 'https://magicteam-yaseen2016.c9users.io/auth/facebook/callback'
//}, accessfacebookToken => {
 //   console.log(accessfacebookToken);
//}));
//app.get('/auth/facebook/', passport.authenticate('facebook'));
//app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), function(req, res) {
    // Successful authentication, redirect home.
//    res.redirect('/campgrounds');
 // });

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});


app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The WWDeveloper Server Has Started!");
});