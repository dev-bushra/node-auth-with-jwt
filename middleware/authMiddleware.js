const jwt = require('jsonwebtoken');
const User = require('../models/User');

// check token
const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check if token exists & verified
  if (token) {
    jwt.verify(token, 'net ninja secret', (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/login');
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect('/login');
  }
};

// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;

  // check if token exists & verified
  if (token) {
    jwt.verify(token, "net ninja secret", async (err, decodedToken) => {
      if (err) {
        res.locals.user = null; // clear the locals
        next();
      } else {
        let user = await User.findById(decodedToken.id); // found the user data in the db through his token
        res.locals.user = user; // return the user data on locals
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};


module.exports = { requireAuth, checkUser };