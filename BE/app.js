const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const httpError = require('./models/httpError');

const placesRoute = require('./routes/placesRoute');

const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/places', placesRoute);

app.use((req, res, next) => {
  const error = new httpError('Page router was not found', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  res.status(error.status || 500).json({
    message: error.message || 'Something went wrong',
  });
});

app
  .listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
  .on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `Port ${PORT} is already in use. Kill the process or use another port.`
      );
      process.exit(1);
    } else {
      throw err;
    }
  });
