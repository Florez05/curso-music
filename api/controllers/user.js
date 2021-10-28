'use strict'
var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');

function pruebas(req, res) {
    res.status(200).send({
        message: 'probando una accion del controlador de usuarios del api rest con node y mongo'
    });
}

//REGISTRAR EL USUARIO
function saveUser(req, res) {
    var user = new User();

    var params = req.body;

    console.log(params);

    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;
    user.role = 'ROLE_ADMIN';
    user.image = 'null';

    if (params.password) {
        //encriptar contraseña y guardar datos
        bcrypt.hash(params.password, null, null, function (err, hash) {
            user.password = hash;
            if (user.name != null && user.surname != null && user.email != null) { //lo que me guardara en la base de datos
                //guardar el usuario
                user.save((err, userStored) => {
                    if (err) {
                        res.status(500).send({ message: 'Error al guardar el usuario' });
                    } else {
                        if (!userStored) {
                            res.status(404).send({ message: 'No se ha registrado el usuario' });
                        } else {
                            res.status(200).send({ user: userStored });
                        }
                    }
                });
            } else {
                res.status(200).send({ message: 'Rellena todos los campos' });
            }
        });
    } else {
        res.status(200).send({ message: 'Introduzca una contraseña' });
    }
}

//LOGUEAR EL USUARIO
function loginUser(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        //si existe el error, nos devuelve una respiesta 500
        if (err) {
            res.status(500).send({ message: 'error en la peticion' });
        } else {
            if (!user) { //comprobamos si el usuario existe o no existe
                res.status(404).send({ message: 'El usuario no existe' });
            } else {
                bcrypt.compare(password, user.password, function (err, check) {
                    if (check) { //si el check es correcto, devuelve los datos del usuario logueado
                        if (params.gethash) { //propiedad gethash, tener un servicio de JWT para crear los token
                            //devolver un token de jwt 
                            res.status(200).send({
                                token: jwt.createToken(user)
                            });
                        } else {// si el hash viene vacio
                            res.status(200).send({user});
                        }
                    } else { //y si no, diciendo que la contraseña es incorrecta, que el usuario no ha logrado loguearse
                        res.status(404).send({ message: 'El usuario NO ha logrado loguearse' });
                    }
                });

            }
        }
    });

} 

//ACTUALIZAR LOS DATOS DEL USUARIO
function updateUser(req, res){
    var userId = req.params.id; //el userId se saca de la url
    var update = req.body; //vamos a recoger todos los datos que nos lleguen por post, para actualizar

    User.findByIdAndUpdate(userId, update, (err, userUpdated) => {
        if(err){ //si hay un error
            res.status(500).send({ message: 'Error al actualizar el usuario'});
        }else{
            if(!userUpdated){//si no hay el error, comprobar si el usuario no devuelve los datos
                res.status(404).send({message: 'No se ha podido actualizar el usuario'});
            }else{// si todo esta bien
                res.status(200).send({user: userUpdated}); //devuelve el usuario que ha actualizado, no con los datos nuevos, con los datos que tenia antes
            }
        }
    });
}
// SUBIR LA IMAGEN DEL USUARIO
function uploadImage(req, res){
    var userId = req.params.id; //recoge el id de la url
    var file_name = 'No se subio la imagen...'; 

    if(req.files){
        var file_path = req.files.image.path; //si se subio el fichero
        var file_split = file_path.split('\/'); //recortar el string (file_path) y conseguir unicamente el nombre de la imagen
        var file_name = file_split[2]; //recoger el nombre que estara en la posicion 2 
        
        var ext_split = file_name.split('\.'); //sacar la extencion de la imagen
        var file_ext = ext_split[1]; //recoger la extencion

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif'){//comprobar si el fichero tiene la extencion correcta
            User.findByIdAndUpdate(userId, {image: file_name}, (err, userUpdated) => {
                if(!userUpdated){//si no hay el error, comprobar si el usuario no devuelve los datos
                    res.status(404).send({message: 'No se ha podido actualizar el usuario'});
                }else{// si todo esta bien
                    res.status(200).send({image: file_name, user: userUpdated}); //devuelve el usuario que ha actualizado, no con los datos nuevos, con los datos que tenia antes
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
    var path_file = './uploads/users/'+imageFile;
    fs.exists(path_file, function(exists){ //comprobar si existe un fichero en el servidor
        if(exists){ //comprobamos si la funcion de talbac es correcto, si da true existe
            res.sendFile(path.resolve(path_file));//nos envia un fichero
        }else{
            res.status(200).send({message: 'No existe la imagen...'});
        }
    }); 
}

module.exports = {
    pruebas,
    saveUser,
    loginUser,
    updateUser,
    uploadImage,
    getImageFile 
};