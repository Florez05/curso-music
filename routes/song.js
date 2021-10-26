'use strict'

var express = require('express');//poder accer a las rutas y crear nuevas
var SongController = require('../controllers/song');
var api = express.Router(); //nos permite hacer funciones get, put, posh
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty'); //permite la subida de ficheros
var md_upload = multipart({uploadDir: './uploads/songs'});

api.get('/song/:id', md_auth.ensureAuth, SongController.getSong);
api.post('/save', md_auth.ensureAuth, SongController.saveSong);
api.get('/songs/:album?', md_auth.ensureAuth, SongController.getSongs);
api.put('/song/:id', md_auth.ensureAuth, SongController.updateSong);
api.delete('/song/:id', md_auth.ensureAuth, SongController.deleteSong);
api.post('/upload-file-song/:id', [md_auth.ensureAuth, md_upload], SongController.uploadFile);
api.get('/get-song-file/:songFile', SongController.getSongFile);

module.exports = api;