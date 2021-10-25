//definir un metodo para una clase
'use strict'

var jwt = require('jwt-simple');   //importamos jwt
var moment = require('moment');
var secret = 'clave_secreta_curso';

exports.ensureAuth = function(req, res, next){//ensureAuth => nos permite comprobar si los datos del token que nos va a llegar  son correctectos o no 
    if(!req.headers.authorization){//comprobar si el header exista
        return res.status(403).send({message: 'La peticion no tiene la cabecera de autenticacion'});
    } //en el caso de que si exista authorization, es que si que vamos a tener la cabezera

    //llega el token y se guarda en una variable que se llama token
    var token = req.headers.authorization.replace(/['"]+/g, ''); //eliminacion todas las comillas que hay dentro del token

    try{
        var payload = jwt.decode(token,secret);
        if(payload.e){ //Si payload si la fecha de expiracion es menor a la fecha actual
            return res.status(401).send({message: 'Token ha expirado'}); // y por lo tanto tendriamos que volver a autenticar
        }
    }catch(ex){
        //console.log(ex);
        return res.status(403).send({message: 'Token no valido'});
    }

    req.user = payload;

    next();
};