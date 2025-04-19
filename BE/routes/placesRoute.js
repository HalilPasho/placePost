const express = require('express');
const httpError = require('../models/httpError');
const placesController = require('../controllers/placesController');

const router = express.Router();

router.get('/user/:uid', placesController.findPlacesByUserId);

router.get('/:pid', placesController.findPlacesById);

router.post('/', placesController.createPlace);

module.exports = router;
