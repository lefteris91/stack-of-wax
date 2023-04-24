const passport = require('passport');

module.exports = function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.isLoggedIn = true;
    res.locals.user = req.user;
  } else {
    res.locals.isLoggedIn = false;
    res.locals.user = null;
  }
  next();
};
