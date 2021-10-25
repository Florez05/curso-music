'use strict'
var path = require('path'); //se utiliza para el tema de ficheros
var fs = require('fs');

var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist'); //importar 
var Album = require('../models/album');
var Song = require('../models/song');

function getArtist(req, res) {
    var artistId = req.params.id;//recoger un parametro que nos llegara por la url

    Artist.findById(artistId, (err, artist) => {  //se usa una funcion de calback y puede dar un erro o devolvernos correctamente el artista
        if (err) {
            res.status(500).send({ message: 'Error a la peticion' });
        } else {
            if (!artist) {//si pasa todo bien y no sucede ningun error
                res.status(404).send({ message: 'El Artist no existe' });
            } else {
                res.status(200).send({ artist });
            }
        }
    });
    //res.status(200).send({message: 'Metodo getArtist de controlador artist.js'});
}

//REGISTRAR ARTISTA
function saveArtist(req, res) {
    var artist = new Artist(); //creamos un nuevo artista
    //asignar valores a cada una de sus propiedades, para asignarle los datos que tendra el artista 
    var params = req.body;
    artist.name = params.name; //accignarle valores a las propiedades del objeto del artista 
    artist.description = params.description;
    artist.image = 'null';

    artist.save((err, artistStored) => {//funsion de calva va a recibir un error o el artista ya guardado
        if (err) {
            res.status(500).send({ message: 'Error al guardar el artista' });
        } else {
            if (!artistStored) {// va bien, pero no se guardo correctamente 
                res.status(404).send({ message: 'No se guardo bien el artista' });
            } else { //guardo correctamente
                res.status(200).send({ artist: artistStored });
            }
        }
    });
}
//SACAR EL ARTISTA
function getArtists(req, res) {
    if (req.params.page) {
        var page = req.params.page;
    } else {
        var page = 1;
    }

    var itemsPerPage = 3;

    Artist.find().sort('name').paginate(page, itemsPerPage, function (err, artists, total) {
        if (err) {
            res.status(500).send({ message: 'Error en la peticion' });
        } else {//si no, se comprueba que llegue correctamente el Array    
            if (!artists) {
                res.status(404).send({ message: 'No hay artistas' });
            } else { // si llega CORRECTAMENTE
                return res.status(404).send({
                    total_items: total,
                    artists: artists

                });
            }
        }
    });
}

//ACTUALIZAR ARTISTA
function updateArtist(req, res) {
    var artistId = req.params.id; //llega el id
    var update = req.body; //los datos que le enviemos del cliente

    Artist.findByIdAndUpdate(artistId, update, (err, artistUpdated) => {
        if (err) {
            res.status(500).send({ message: 'Error al guardar el artista' });
        } else {
            if (!artistUpdated) {
                res.status(404).send({ message: 'El artista no ha sido actualizado' });
            } else {
                res.status(200).send({ artist: artistUpdated });
            }
        }
    });
}

//ELIMINAR ARTISTA
function deleteArtist(req, res) {
    var artistId = req.params.id;

    Artist.findByIdAndRemove(artistId, (err, artistRemoved) => {
        if (err) {
            res.status(500).send({ message: 'Error al eliminar el artista' });
        } else {
            if (!artistRemoved) {
                res.status(404).send({ message: 'El artista no ha sido eliminado' });
            } else { //se elimina el artista
                Album.find({ artist: artistRemoved._id }).remove((err, albumRemoved) => { //buscar todos los albums que en el campo artista tengan el id y los elimina 
                    if (err) {
                        res.status(500).send({ message: 'Error al eliminar el album' });
                    } else {
                        if (!albumRemoved) {
                            res.status(404).send({ message: 'El album no ha sido eliminado' });
                        } else {
                            Song.find({ album: albumRemoved._id }).remove((err, songRemoved) => { //buscar todos los albums que en el campo artista tengan el id y los elimina 
                                if (err) {
                                    res.status(500).send({ message: 'Error al eliminar la cancion' });
                                } else {
                                    if (!songRemoved) {
                                        res.status(404).send({ message: 'La cancion no ha sido eliminada' });
                                    } else {
                                        res.status(200).send({artist: artistRemoved});
                                    }
                                }
                            });                           
                        }
                    }
                });
            }
        }
    });

}

module.exports = {
    getArtist,
    saveArtist,
    getArtists,
    updateArtist,
    deleteArtist
};