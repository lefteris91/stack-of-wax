// dependancies and routes 
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./api/models/users');
const userRoute = require('./api/routes/user');
const vinylRoute = require('./api/routes/vinyl');
const filterRoute = require('./api/routes/filters');
const bcrypt = require('bcrypt');
const checkAuth = require('./api/middleware/check-auth');
const commentLikeRoute = require('./api/routes/comment_like');


// database connection
mongoose.connect('mongodb+srv://stackofwax:'+ process.env.MONGO_ATLAS_PASSWORD +'@my-stack-of-wax.u0aspko.mongodb.net/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((error) => {
    console.log('Database connection error:', error);
  });


// Configure session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));


// Configure Passport.js middleware
app.use(passport.initialize());
app.use(passport.session());


// views
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/',checkAuth, (req, res) => {
  res.render('homepage');
});


// middle-w
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));


// cors errors 
app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
    "Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept");
    if (req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'POST , GET');
        return res.status(200).json({});
    }
    next();
});


// Define Passport.js local authentication strategy
passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, (username, password, done) => {
  User.findOne({ username: username })
    .then(user => {
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return done(err);
        }
        if (result) {
          return done(null, user);
        }
        return done(null, false, { message: 'Incorrect password.' });
      });
    })
    .catch(err => done(err));
}));


// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});


// Set up login route
app.post('/user/login', passport.authenticate('local'),checkAuth, (req, res) => {
  console.log('Request received at /user/login');
  // Authentication succeeded, so create a session for the user
  req.session.user = req.user;
  const user = req.session.user;
  res.redirect('/filters');
});


// Set up logout route
app.get('/user/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err);} })
    return res.redirect('/');
});


// Define route handlers
app.use('/user', userRoute);
app.use('/vinyl', vinylRoute);
app.use('/filters', filterRoute);
app.use('/list', commentLikeRoute);


// handling errors
app.use((req,res,next)=>{
    const error = new Error('Not Found!');
    error.status = 404;
    next(error);
});

app.use((error,req,res,next)=>{
  res.status(error.status || 500);
  res.json({
      error:{
          message: error.message
      }
  })
});


module.exports = app;