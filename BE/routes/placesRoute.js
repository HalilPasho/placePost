const express = require('express');
const { check } = require('express-validator');
const placesController = require('../controllers/placesController');
const fileUpload = require('../middleware/file-upload');
const auth = require('../middleware/check-auth');

const router = express.Router();

router.get('/user/:uid', placesController.findPlacesByUserId);

router.get('/:pid', placesController.findPlacesById);

const validatePlaceInput = [
    check('title').notEmpty().withMessage('Title must not be empty.'),
    check('description')
        .isLength({ min: 5 })
        .withMessage('Description must be at least 5 characters long.'),
    check('address').notEmpty().withMessage('Address must not be empty.'),
];

const validateUpdatePlace = [
    check('title').notEmpty().withMessage('Title must not be empty.'),
    check('description')
        .isLength({ min: 5 })
        .withMessage('Description must be at least 5 characters long.'),
];

router.use(auth);

router.patch('/:pid', ...validateUpdatePlace, placesController.updatePlace);

router.post(
    '/',
    fileUpload.single('image'),
    ...validatePlaceInput,
    placesController.createPlace
);

router.delete('/:pid', placesController.deletePlace);

module.exports = router;
