'use strict'

var express = require('express');//poder accer a las rutas y crear nuevas
var AlbumController = require('../controllers/album');
var api = express.Router(); //nos permite hacer funciones get, put, posh
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty'); //permite la subida de ficheros
var md_upload = multipart({uploadDir: './uploads/albums'});

api.get('/album/:id', md_auth.ensureAuth, AlbumController.getAlbum);
api.post('/album', md_auth.ensureAuth, AlbumController.saveAlbum);
api.get('/albums/:artist?', md_auth.ensureAuth, AlbumController.getAlbums);
api.put('/album/:id', md_auth.ensureAuth, AlbumController.updateAlbum);
api.delete('/album/:id', md_auth.ensureAuth, AlbumController.deleteAlbum);
api.post('/upload-image-album/:id', [md_auth.ensureAuth, md_upload], AlbumController.uploadImage);
api.get('/get-image-album/:imageFile', AlbumController.getImageFile);

module.exports = api;