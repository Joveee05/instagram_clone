const express = require('express');
const globalErrorHandler = require('./controllers/error');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');

const app = express();

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use('/api/v1/users/', userRouter);
app.use('/api/v1/posts/', postRouter);

app.use(globalErrorHandler);

module.exports = app;
