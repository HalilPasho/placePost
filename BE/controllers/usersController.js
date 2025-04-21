const httpError = require('../models/httpError');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Halil',
    surname: 'test',
    email: 'halil@test.com',
    password: '1234',
  },
];

const getUsers = (req, res, next) => {
  res.status(200).json({ users: DUMMY_USERS });
};

const signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new httpError('Invalid inputs for signup', 422));
  }
  const { name, surname, email, password } = req.body;
  const foundUser = DUMMY_USERS.find((user) => user.email === email);
  if (foundUser) {
    throw new httpError('Email already in use', 422);
  }

  const createUser = {
    id: uuidv4(),
    name,
    surname,
    email,
    password,
  };
  DUMMY_USERS.push(createUser);

  res.status(201).json({ user: createUser });
};

const login = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new httpError('Invalid inputs for login', 422));
  }
  const { email, password } = req.body;
  const foundUser = DUMMY_USERS.find((user) => user.email === email);
  if (!foundUser || foundUser.password !== password) {
    throw new httpError('Invalid credentials', 401);
  }

  res.status(201).json({ message: 'Logged in!' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
