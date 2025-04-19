const httpError = require('../models/httpError');
const { v4: uuidv4 } = require('uuid');

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

const findPlacesById = (req, res, next) => {
  const placeId = req.params.pid;
  const foundPlace = DUMMY_PLACES.find((p) => p.id === placeId);
  if (!foundPlace) {
    return next(new httpError('Place not found', 404));
  }

  res.json({ place: foundPlace });
};

const findPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const foundPlaces = DUMMY_PLACES.filter((p) => p.creator === userId);

  if (foundPlaces.length === 0) {
    return next(new httpError('Places not found', 404));
  }

  res.json({ places: foundPlaces });
};

const createPlace = (req, res, next) => {
  const { description, title, coordinates, creator, address } = req.body;
  const newPlace = {
    description,
    id: uuidv4(),
    title,
    location: coordinates,
    creator,
    address,
  };
  DUMMY_PLACES.push(newPlace);
  console.log('AAA', DUMMY_PLACES);

  res.status(201).json({ place: newPlace });
};

exports.findPlacesById = findPlacesById;
exports.findPlacesByUserId = findPlacesByUserId;
exports.createPlace = createPlace;
