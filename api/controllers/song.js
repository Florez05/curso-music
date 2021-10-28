'use strict'
var path = require('path'); //se utiliza para el tema de ficheros
var fs = require('fs');

var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist'); //importar 
var Album = require('../models/album');
var Song = require('../models/song');

//PROBAR
function getSong(req, res) {
    var songId = req.params.id;

    Song.findById(songId).populate({path:'album'}).exec((err, song) => {
        if (err) {
            res.status(500).send({message:'ERROR en la peticion'});
        } else {
            if (!song) {
                res.status(404).send({message:'ERROR la cancion no existe'});
            } else {
                res.status(200).send({song});
            }
        }
    })

    //res.status(200).send({message:'Controlador Cancion'});   
}

//GUARDAR CANCION
function saveSong(req, res) {
    var song = new Song();

    var params = req.body;
    song.number = params.number;
    song.name = params.name;
    song.duration = params.duration;
    song.file = null;
    song.album = params.album;

    song.save((err, songStored) => {
        if (err) {
            res.status(500).send({message:'ERROR en el servidor'});
        } else {
            if (!songStored) {
                res.status(404).send({message:'NO se guarda la cancion'});
            } else {
                res.status(200).send({song: songStored});
            }
        }
    });   
}

//LISTAR CANCIONES
function getSongs(req, res) {
    var albumId = req.params.id;

    if (!albumId) { //si no llega el albumID 
        var find = Song.find({}).sort('number');
    } else { //si llega el parametro(albumID) 
        var find = Song.find({album: albumId}).sort('number');
    }

    find.populate({
        path: 'album',
        populate: {
            path: 'artist',
            model: 'Artist'
        }
    }).exec(function (err, songs) {
        if (err) {
            res.status(500).send({message:'ERROR en la peticion'});
        } else {
            if (!songs) {
                res.status(404).send({message:'NO hay canciones'});
            } else {
                res.status(200).send({songs});
            }
        }
    });
}   

//ACTUALIZAR CANCION
function updateSong(req, res) {
    var songId = req.params.id;
    var update = req.body;

    Song.findByIdAndUpdate(songId, update, (err, songUpdated) => {
        if (err) {
            res.status(500).send({message:'ERROR en la peticion'});
        } else {
            if (!songUpdated) {
                res.status(404).send({message:'La cancion no se ha actualizado'});
            } else {
                res.status(200).send({update});
            }
        }
    });
}

//ELIMINAR CANCION
function deleteSong(req, res) {
    var songId = req.params.id;
    
    Song.findOneAndRemove(songId, (err, songRemoved) => {
        if (err) {
            res.status(500).send({message:'ERROR en el servidor'});
        } else {
            if (!songRemoved) {
                res.status(404).send({message:'NO se ha borrado la cancion'});
            } else {
                res.status(200).send({song: songRemoved});
            }        
        }
    });
}

//SUBIR IMAGEN DE CANCION
function uploadFile(req, res){
    var songId = req.params.id; //recoge el id de la url
    var file_name = 'No se subio la cancion...'; 

    if(req.files){
        var file_path = req.files.file.path; //si se subio el fichero
        var file_split = file_path.split('\/'); //recortar el string (file_path) y conseguir unicamente el nombre de la imagen
        var file_name = file_split[2]; //recoger el nombre que estara en la posicion 2 
        
        var ext_split = file_name.split('\.'); //sacar la extencion de la imagen
        var file_ext = ext_split[1]; //recoger la extencion

        if(file_ext == 'mp3' || file_ext == 'ogg'){//comprobar si el fichero tiene la extencion correcta
            Song.findByIdAndUpdate(songId, {file: file_name}, (err, songUpdated) => {
                if(!songUpdated){//si no hay el error, comprobar si el usuario no devuelve los datos
                    res.status(404).send({message: 'No se ha podido actualizar la cancion del album'});
                }else{// si todo esta bien
                    res.status(200).send({song: songUpdated}); //devuelve el usuario que ha actualizado, no con los datos nuevos, con los datos que tenia antes
                }
            });           
        }else{
            res.status(200).send({message: 'Extencion del archivo incorrecta'}); 
        }
        //console.log(file_name);
    }else{
        res.status(200).send({message: 'No has subido ninguna cancion'});
    }
}
//CONSEGUIR LA CANCION DEL USUARIO
function getSongFile(req, res){
    var imageFile = req.params.songFile;//el nombre del fichero que se va a sacar de la bd
    var path_file = './uploads/songs/'+imageFile;
    fs.exists(path_file, function(exists){ //comprobar si existe un fichero en el servidor
        if(exists){ //comprobamos si la funcion de talbac es correcto, si da true existe
            res.sendFile(path.resolve(path_file));//nos envia un fichero
        }else{
            res.status(200).send({message: 'No existe la cancion...'});
        }
    }); 
}

module.exports = {
    getSong,
    saveSong,
    getSongs,
    updateSong,
    deleteSong,
    uploadFile,
    getSongFile
}