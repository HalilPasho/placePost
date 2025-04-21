const express = require('express');
const { check } = require('express-validator');
const placesController = require('../controllers/placesController');

const router = express.Router();

router.get('/user/:uid', placesController.findPlacesByUserId);

router.get('/:pid', placesController.findPlacesById);

router.patch(
  '/:pid',
  [check('title').not().isEmpty(), check('description').isLength({ min: 5 })],
  placesController.updatePlace
);

router.post(
  '/',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty(),
  ],
  placesController.createPlace
);

router.delete('/:pid', placesController.deletePlace);

module.exports = router;
