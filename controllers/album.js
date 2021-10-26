'use strict'
var path = require('path'); //se utiliza para el tema de ficheros
var fs = require('fs');

var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist'); //importar 
var Album = require('../models/album');
var Song = require('../models/song');

//SACAR ALBUM
function getAlbum(req, res) {
    var albumId = req.params.id;//recoger un parametro que nos llegara por la url

    //CONSULTA EN LA BASE DE DATOS 
    Album.findById(albumId).populate({path: 'artist'}).exec((err, album) => { //populate({path: 'artist'}); => se consigue todos los datos del artista que ha creado un album
        if (err) {
            res.status(500).send({message:'ERROR en la peticion'});
        } else {
            if (!album) {
                res.status(404).send({message:'ERROR el album no existe'});
            } else {
                res.status(200).send({album});
            }            
        }
    });
    //res.status(200).send({message: 'Metodo getAlbum de controlador album.js'});
}

//GUARDAR ALBUM
function saveAlbum(req, res) {
    var album = new Album(); //creamos el objeto del album dentro de una varible

    var params = req.body; //recogemos los parametros que lleguen por el body de la peticion
    album.title = params.title;
    album.description = params.description;
    album.year = params.year;
    album.image = 'null';
    album.artist = params.artist;

    album.save((err, albumStored) => {
        if (err) {
            res.status(500).send({message: 'Error al guardar el album'});
        } else {
            if (!albumStored) {
                res.status(404).send({message: 'No se ha guardado el album'});
            } else {
                res.status(200).send({album: albumStored});              
            }           
        }
    });
}

//LISTAR ALBUMS 
function getAlbums(req, res) {
    var artistId = req.params.artist; //recogemos el id del artista para mostrar todos los albunes del artista 
    
    if (!artistId) { //si no viene el artistID
        //sacar toso los albums de la base de datos
        var find = Album.find({}).sort('title');
    } else { //si nos llega bien el artistID por la url
        //sacar los albums de un artista en concreto de la base de datos
        var find = Album.find({artist: artistId}).sort('year');
    }

    find.populate({path: 'artist'}).exec((err, albums) => {
        if (err) {
            res.status(500).send({message:'ERROR en la peticion'});
        } else {
            if (!albums) {
                res.status(404).send({message:'NO hay albums'});
            } else {
                res.status(200).send({albums});
            }
        }
    })
}

//ACTUALIZAR ALBUM
function updateAlbum(req, res) {
    var albumId = req.params.id;
    var update = req.body;

    Album.findByIdAndUpdate(albumId, update, (err, albumUpdated) => {
        if (err) {
            res.status(500).send({message:'ERROR en el servidor'});
        } else {
            if (!albumUpdated) {
                res.status(404).send({message:'NO se ha actualizado el album'});
            } else {
                res.status(200).send ({album: albumUpdated});
            }
        }
    })
}

//ELIMINAR ALBUM
function deleteAlbum(req, res) {
    var albumId = req.params.id;

    Album.findByIdAndRemove(albumId, (err, albumRemoved) => { //buscar todos los albums que en el campo artista tengan el id y los elimina 
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
                            res.status(200).send({album: albumRemoved});
                        }
                    }
                });                           
            }
        }
    });   
}

//SUBIR IMAGEN Y MOSTRAR
function uploadImage(req, res){
    var albumId = req.params.id; //recoge el id de la url
    var file_name = 'No se subio la imagen...'; 

    if(req.files){
        var file_path = req.files.image.path; //si se subio el fichero
        var file_split = file_path.split('\/'); //recortar el string (file_path) y conseguir unicamente el nombre de la imagen
        var file_name = file_split[2]; //recoger el nombre que estara en la posicion 2 
        
        var ext_split = file_name.split('\.'); //sacar la extencion de la imagen
        var file_ext = ext_split[1]; //recoger la extencion

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){//comprobar si el fichero tiene la extencion correcta
            Album.findByIdAndUpdate(albumId, {image: file_name}, (err, albumUpdated) => {
                if(!albumUpdated){//si no hay el error, comprobar si el usuario no devuelve los datos
                    res.status(404).send({message: 'No se ha podido actualizar la imagen del album'});
                }else{// si todo esta bien
                    res.status(200).send({album: albumUpdated}); //devuelve el usuario que ha actualizado, no con los datos nuevos, con los datos que tenia antes
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
    var path_file = './uploads/albums/'+imageFile;
    fs.exists(path_file, function(exists){ //comprobar si existe un fichero en el servidor
        if(exists){ //comprobamos si la funcion de talbac es correcto, si da true existe
            res.sendFile(path.resolve(path_file));//nos envia un fichero
        }else{
            res.status(200).send({message: 'No existe la imagen...'});
        }
    }); 
}

module.exports = {
    getAlbum,
    saveAlbum,
    getAlbums,
    updateAlbum,
    deleteAlbum,
    uploadImage,
    getImageFile
};