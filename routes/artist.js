'use strict'

var express = require('express');//poder accer a las rutas y crear nuevas
var ArtistController = require('../controllers/artist');
var api = express.Router(); //nos permite hacer funciones get, put, posh
var md_auth = require('../middlewares/authenticated');

api.get('/artist', md_auth.ensureAuth, ArtistController.getArtist);
api.post('/artist', md_auth.ensureAuth, ArtistController.saveArtist);

module.exports = api;