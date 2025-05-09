const httpError = require('../models/httpError');
const getAddressFromCoords = require('../location');
const { validationResult } = require('express-validator');
const Places = require('../models/place');
const Users = require('../models/user');
const mongoose = require('mongoose');

const findPlacesById = async (req, res, next) => {
  const placeId = req.params.pid;
  let foundPlace;
  try {
    foundPlace = await Places.findById(placeId);
  } catch (err) {
    return next(new httpError('Please provide a place ID', 400));
  }

  if (!foundPlace) {
    return next(new httpError('Place not found', 404));
  }

  res.json({ place: foundPlace.toObject({ getters: true }) });
};

const findPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let foundPlaces;

  try {
    foundPlaces = await Places.find({ creator: userId });
  } catch (err) {
    return next(new httpError('Please provide a user ID', 400));
  }

  if (foundPlaces.length === 0) {
    return next(new httpError('Places not found for this user', 404));
  }

  res.json({ places: foundPlaces.map((p) => p.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new httpError('Invalid inputs', 422));
  }
  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getAddressFromCoords(address);
  } catch (err) {
    return next(err);
  }
  const newPlace = new Places({
    description,
    title,
    location: coordinates,
    creator,
    address,
    image:
      'https://www.sphinx-solution.com/blog/wp-content/uploads/2023/07/examples-of-web-applications-2.webp',
  });

  let user;

  try {
    user = await Users.findById(creator);
  } catch (err) {
    return next(
      new httpError('Could not find user, and creating place failed.', 404)
    );
  }
  if (!user) {
    return next(new httpError('Could not find user for providing ID.', 404));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await newPlace.save({ session });
    user.places.push(newPlace);
    await user.save({ session });
    await session.commitTransaction();
  } catch (err) {
    return next(new httpError('Could not create new place', 500));
  }

  res.status(201).json({ place: newPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new httpError('Invalid inputs for updating', 422));
  }
  const { description, title } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Places.findById(placeId);
  } catch (err) {
    return next(new httpError('Could not find place to update', 404));
  }

  place.description = description;
  place.title = title;

  try {
    await place.save();
  } catch (err) {
    return next(new httpError('Could not update place', 500));
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const deletedPlaceId = req.params.pid;
  let place;
  try {
    place = await Places.findById(deletedPlaceId).populate('creator');
  } catch (err) {
    return next(new httpError('Could not find place to delete', 404));
  }

  if (!place) {
    return next(new httpError('Could not find place to delete', 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new httpError('Could not delete place', 500));
  }

  res.status(200).json({ message: 'Place deleted' });
};

exports.findPlacesById = findPlacesById;
exports.findPlacesByUserId = findPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
