var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongo = require('mongodb').MongoClient

var config = require('./config/config');
var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', userRouter);

// Create a MongoDB connection pool and start the application
// after the database connection is ready
mongo.connect(config.database_url, { useNewUrlParser: true, useUnifiedTopology: true }, { promiseLibrary: Promise }, (err, db) => {
  if (err) {
    // logger.warn(`Failed to connect to the database. ${err.stack}`);
    throw err;
  }
  app.locals.db = db;
  app.listen(config.port, () => {
    console.log(`Node.js app is listening at http://localhost:${config.port}`);
  });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
