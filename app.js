var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { connection } = require("./db/connection.db");
var cors = require('cors');

var indexRouter = require('./routes/index.route');
var routes = require('./routes/index');
const { validate_header } = require('./middlewares/auth.middleware');
const { INTERNAL_SERVER_ERROR } = require("./constants/common.constants")

var app = express();

/** Connect with db */
connection();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/ping', (req, res) => {
  res
    .status(200)
    .json({ 
      message: "Ping successfully."
    })
});

app.use('/v0', validate_header, indexRouter);
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(async function (err, req, res, next) {
  
  if(err.status === 404) return res.status(404).json({ message: "Requested url not found, please check your url." });
  
  const err_res = {
    status: err.status || 500,
    data: err._response || null,
    message: err._message || INTERNAL_SERVER_ERROR,
    error_stack: err.message ? { message: err.message } : err.message || err._error_stack || err.statck || null,
    error: err._error || true
  };

  try {
    const insert_logs_data = {
      route: req.protocol + '://' + req.get('Host') + req.url,
      status: err.status || 500,
      error: err._message || INTERNAL_SERVER_ERROR,
      raw_data: JSON.stringify(err_res)
    }
    await insert_log_controller(insert_logs_data);
  
    res.status(err.status || 500);
    res.json(err_res);
  } catch (error) {
    res.status(err.status || 500);
    res.json(err_res);
  }
});
  

module.exports = app;
