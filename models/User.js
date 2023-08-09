const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'Minimum password length is 6 characters'],
  }
});


// Hashing Password [ .pre fire a function before a document saved to db ]
userSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// [ .post fire a function after doc saved to db ]
userSchema.post('save', function (doc, next) {
  console.log('new user was created & saved', doc);
  next();
});


// Static Method to Login User [ 'statics' is a special property that allows you to define static methods on a Mongoose model, login method will be available directly on the model itself. ]
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email }); // find the user

  // check if user exist & inserted pw is matched the stored pw
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      // if pw matching return the user object
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect email");
};

const User = mongoose.model('user', userSchema); // create a model base on the schema

module.exports = User;