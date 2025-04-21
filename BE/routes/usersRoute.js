const express = require('express');
const { check } = require('express-validator');
const usersController = require('../controllers/usersController');

const router = express.Router();

router.get('/', usersController.getUsers);

router.post('/login', usersController.login);

router.post(
  '/signup',
  [
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 8 }),
    check('name').not().isEmpty(),
    check('surname').not().isEmpty(),
  ],
  usersController.signup
);

module.exports = router;
