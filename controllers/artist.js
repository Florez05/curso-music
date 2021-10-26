'use strict'
var path = require('path'); //se utiliza para el tema de ficheros
var fs = require('fs');

var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist'); //importar 
var Album = require('../models/album');
var Song = require('../models/song');

//SACAR ARTIST
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
//LISTAR EL ARTISTA
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
                res.status(200).send({ update });
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

//SUBIR IMAGEN Y MOSTRAR
function uploadImage(req, res){
    var artistId = req.params.id; //recoge el id de la url
    var file_name = 'No se subio la imagen...'; 

    if(req.files){
        var file_path = req.files.image.path; //si se subio el fichero
        var file_split = file_path.split('\/'); //recortar el string (file_path) y conseguir unicamente el nombre de la imagen
        var file_name = file_split[2]; //recoger el nombre que estara en la posicion 2 
        
        var ext_split = file_name.split('\.'); //sacar la extencion de la imagen
        var file_ext = ext_split[1]; //recoger la extencion

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){//comprobar si el fichero tiene la extencion correcta
            Artist.findByIdAndUpdate(artistId, {image: file_name}, (err, artistUpdated) => {
                if(!artistUpdated){//si no hay el error, comprobar si el usuario no devuelve los datos
                    res.status(404).send({message: 'No se ha podido actualizar el usuario'});
                }else{// si todo esta bien
                    res.status(200).send({artist: artistUpdated}); //devuelve el usuario que ha actualizado, no con los datos nuevos, con los datos que tenia antes
                }
            });           
        }else{
            res.status(200).send({message: 'Extencion del archivo incorrecta'}); 
        }
        //console.log(file_name);
    }else{
        res.status(200).send({message: 'No has subido ninguna imagen'});
    }
}
//CONSEGUIR LA IMAGEN DEL USUARIO
function getImageFile(req, res){
    var imageFile = req.params.imageFile;//el nombre del fichero que se va a sacar de la bd
    var path_file = './uploads/artists/'+imageFile;
    fs.exists(path_file, function(exists){ //comprobar si existe un fichero en el servidor
        if(exists){ //comprobamos si la funcion de talbac es correcto, si da true existe
            res.sendFile(path.resolve(path_file));//nos envia un fichero
        }else{
            res.status(200).send({message: 'No existe la imagen...'});
        }
    }); 
}

module.exports = {
    getArtist,
    saveArtist,
    getArtists,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile
};