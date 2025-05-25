const httpError = require('../models/httpError');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../models/user');

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await Users.find({}, '-password');
    } catch (err) {
        return next(new httpError('Could not get users', 500));
    }
    res.status(200).json({
        users: users.map((u) => u.toObject({ getters: true })),
    });
};

const signup = async (req, res, next) => {
    try {
        console.log('📥 Signup request body:', req.body);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors);
            return next(new httpError('Invalid inputs for signup', 422));
        }

        const { name, email, password } = req.body;

        let existingUser = await Users.findOne({ email });
        if (existingUser) {
            return next(new httpError('Email already in use.', 422));
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const createUser = new Users({
            name,
            email,
            password: hashedPassword,
            places: [],
        });

        await createUser.save();

        const token = jwt.sign(
            { userId: createUser.id, email: createUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            userId: createUser.id,
            token,
            email: createUser.email,
        });
    } catch (err) {
        console.error('🔥 Unexpected signup error:', err);
        return next(new httpError('Signup failed unexpectedly.', 500));
    }
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
        return next(
            new httpError('Login failed, please try again later.', 500)
        );
    }

    if (!existingUser) {
        return next(new httpError('Invalid credentials', 401));
    }

    let isPasswordValid = false;
    try {
        isPasswordValid = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        return next(
            new httpError('Login failed, please try again later.', 500)
        );
    }

    if (!isPasswordValid) {
        return next(new httpError('Invalid credentials', 401));
    }

    let token;
    try {
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    } catch (err) {
        return next(
            new httpError('Login failed, please try again later.', 500)
        );
    }

    res.status(201).json({
        userId: existingUser.id,
        token,
        email: existingUser.email,
    });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
