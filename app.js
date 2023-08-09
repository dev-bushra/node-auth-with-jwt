const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');

const app = express();

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// EJS Template View Engine
app.set('view engine', 'ejs');

// Database Connection
const dbURI = "mongodb+srv://bushra:test123@cluster0.bpllgvr.mongodb.net/";
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
.then((result) => app.listen(3000))
.catch((err) => console.log(err));

// Routes
app.get('*', checkUser); // apply the checkUser middleware on all get requests
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', requireAuth, (req, res) => res.render('smoothies')); // apply requireAuth middleware on this route
app.use(authRoutes); // use authRoutes middleware