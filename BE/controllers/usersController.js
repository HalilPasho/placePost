const httpError = require('../models/httpError');
const { validationResult } = require('express-validator');
const Users = require('../models/user');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await Users.find({}, '-password');
  } catch (err) {
    return next(new httpError('Could not get users', 500));
  }
  res
    .status(200)
    .json({ users: users.map((u) => u.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new httpError('Invalid inputs for signup', 422));
  }
  const { name, email, password } = req.body;

  let existingUser;

  try {
    existingUser = await Users.findOne({ email });
  } catch (err) {
    return next(new httpError('Sign up failed, please try again later.', 500));
  }

  if (existingUser)
    return next(
      new httpError('The provided email address is already in use.', 422)
    );

  const createUser = new Users({
    name,
    email,
    image: req.file.path,
    password,
    places: [],
  });

  try {
    await createUser.save();
  } catch (err) {
    return next(new httpError('Sign up failed, please try again later.', 500));
  }

  res.status(201).json({ user: createUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new httpError('Invalid inputs for login', 422));
  }
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await Users.findOne({ email });
  } catch (err) {
    return next(new httpError('Login failed, please try again later.', 500));
  }

  if (!existingUser || existingUser.password !== password) {
    return next(new httpError('Invalid credentials', 401));
  }
  res.status(201).json({
    message: 'Logged in!',
    user: existingUser.toObject({ getters: true }),
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
