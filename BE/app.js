const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const httpError = require('./models/httpError');
require('dotenv').config();

const placesRoute = require('./routes/placesRoute');
const userRoute = require('./routes/usersRoute');

const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/places', placesRoute);
app.use('/user', userRoute);

app.use((req, res, next) => {
  throw new httpError('Page router was not found', 404);
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  res.status(error.status || 500).json({
    message: error.message || 'Something went wrong',
  });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
