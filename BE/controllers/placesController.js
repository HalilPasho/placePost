const httpError = require('../models/httpError');
const getAddressFromCoords = require('../location');
const { validationResult } = require('express-validator');
const Places = require('../models/place');

const DUMMY_PLACES = [
  {
    id: 'p1',
    description: 'test for this one description',
    title: 'empire state building',
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: 'u1',
    address: '20 W east 34th St, New York, NY 10001',
  },
  {
    id: 'p2',
    description: 'Historic clock tower in London',
    title: 'Big Ben',
    location: {
      lat: 51.500729,
      lng: -0.124625,
    },
    creator: 'u2',
    address: 'Westminster, London SW1A 0AA, United Kingdom',
  },
];

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
    image: 'https://via.placeholder.com/150',
  });
  try {
    newPlace.save();
  } catch (err) {
    return next(new httpError('Could not create new place', 500));
  }

  res.status(201).json({ place: newPlace });
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new httpError('Invalid inputs for updating', 422));
  }
  const { description, title } = req.body;
  const placeId = req.params.pid;

  const updatePlaceData = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);

  updatePlaceData.description = description;
  updatePlaceData.title = title;
  DUMMY_PLACES[placeIndex] = updatePlaceData;
  res.status(200).json({ place: updatePlaceData });
};

const deletePlace = (req, res, next) => {
  const deletedPlace = req.params.pid;
  if (!DUMMY_PLACES.find((p) => p.id === deletedPlace))
    return next(new httpError('Could not find place to delete', 404));

  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === deletedPlace);
  DUMMY_PLACES.splice(placeIndex, 1);
  res.status(200).json({ message: 'Place deleted' });
};

exports.findPlacesById = findPlacesById;
exports.findPlacesByUserId = findPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
