const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash-messages');
const validator = require('express-validator');
const passport = require('passport');
const reload = require('reload');
const Article = require("./models/article");

const app = express();

// Use the body parser for POST method
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve public path
app.use("/public", express.static(path.join(__dirname, "public"))); 

// Use cookie-parser with secret from session
app.use(cookieParser('keyboard cat'));

// Express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Use express-flash middleware
app.use(flash());
app.use((req, res, next) => {
  res.locals.flash = res.locals.getMessages();
  next();
});

// express-validator Middleware
app.use(validator());

// Create error global variable (locals.error)
app.use((req, res, next) => {
  res.locals.error = req.validationErrors();
  next();
});

// Import Database Configuration
require('./config/database');

//Passport config
require('./config/passport')(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Setting Up templating Engine (EJS)
app.set("view engine", "ejs");

//Using EJS Layout Template
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);
app.use(expressLayouts);

app.use((req, res, next) => {
  res.locals.client = req.user;
  next();
});

// Home Page (index)
app.get("/", (req, res) => {
  Article.find()
    .exec((err, doc) => {
      res.render("index", {
        title: "Articles",
        articles: doc
      });
    });
});

// Set the Articles Router
const articleRoute = require('./routes/articlesRoute');
app.use('/articles', articleRoute);

// Set the Users Router
const userRoute = require('./routes/userRoutes');
app.use('/user', userRoute);

reload(app);

// PORT listen
app.listen(3000, () => console.log("Server started on PORT 3000"));
