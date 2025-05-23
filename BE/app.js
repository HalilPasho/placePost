const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const app = express();
const httpError = require('./models/httpError');
require('dotenv').config();

const placesRoute = require('./routes/placesRoute');
const userRoute = require('./routes/usersRoute');

const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
    res.setHeader(
        'Access-Control-Allow-Origin',
        'https://placepst.netlify.app'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    );

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

app.use(bodyParser.json());
app.use('/uploads/images', express.static(__dirname + '/uploads/images'));
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/places', placesRoute);
app.use('/user', userRoute);

app.use((req, res, next) => {
    throw new httpError('Page router was not found', 404);
});

app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        });
    }
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
