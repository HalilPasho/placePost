const express = require('express');
const { check } = require('express-validator');
const usersController = require('../controllers/usersController');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/', usersController.getUsers);

router.post('/login', usersController.login);

router.post(
  '/signup',
  fileUpload.single('image'),
  [
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 8 }),
    check('name').not().isEmpty(),
  ],
  usersController.signup
);

module.exports = router;
