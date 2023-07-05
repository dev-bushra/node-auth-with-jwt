const User = require("../models/User");
const jwt = require('jsonwebtoken');

// handle errors method
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  // 1. LogIn Errors (custom returned error.message)

  // incorrect email
  if (err.message === 'incorrect email') {
    errors.email = 'That email is not registered';
  }

  // incorrect password
  if (err.message === 'incorrect password') {
    errors.password = 'That password is incorrect';
  }

  // 2. SignUp Errors (mongoDB returned error.message)

  // duplicate email error
  if (err.code === 11000) {
    errors.email = 'that email is already registered';
    return errors;
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
}

// create json web token JWT method
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'net ninja secret', {
    expiresIn: maxAge
  });
};



// controller actions
module.exports.signup_get = (req, res) => {
  res.render('signup');
}

module.exports.login_get = (req, res) => {
  res.render('login');
}

module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    // .create method allow u to create a new instance or document based on the defined schema/model.
    const user = await User.create({ email, password });

    const token = createToken(user._id); // generate token for this user
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 }); // store the token in the cookies by jwt name
    res.status(201).json({ user: user._id });
  }
  catch(err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
  
}

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    // call the login method in the user schema to check if the user is exist 
    const user = await User.login(email, password);

    // if user is exist create a token for him and store it in cookie
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });

    res.status(200).json({ user: user._id });
  } 
  catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }

}

// logout method
module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 }); // replace the token with an empty value
  res.redirect('/');
}