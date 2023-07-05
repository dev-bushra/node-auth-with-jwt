const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

// Schema
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


// fire a function before doc saved to db ( Hashing Password )
userSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// fire a function after doc saved to db
userSchema.post('save', function (doc, next) {
  console.log('new user was created & saved', doc);
  next();
});

// static method to login user
// 'statics' is a special property that allows you to define static methods on a Mongoose model, login method will be available directly on the model itself.
userSchema.statics.login = async function (email, password) {
  
  // 1. find the user
  const user = await this.findOne({ email });

  // 2. if user exist, check if inserted password is matched the stored password
  if (user) {
    const auth = await bcrypt.compare(password, user.password);

    // if the password is matching return the user object
    if (auth) {
      return user;
    }

    // if password is not matching throw an error
    throw Error('incorrect password');
  }

  // if the inserted email is not found through an error
  throw Error('incorrect email');
};

// create a model base on the schema
const User = mongoose.model('user', userSchema);

module.exports = User;