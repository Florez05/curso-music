'use strict'         // C R E A R   E L   T O K E N

var jwt = require('jwt-simple');   //importamos jwt
var moment = require('moment');
var secret = 'clave_secreta_curso';

exports.createToken = function(user){ //el usuario que le pasemos por aca, va a coger todos los datos y los va a guardar en una cpdificacion de un token, un hash, la peticion http vamos transportando la informacion del usuario que esta logeueado, de esa manera se comprueba si el usuario esta logueado o no.
    var payload = { //crear un obecto json 
        sub: user._id,//se usa para guardar el id del objecto del usuario
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(), //fecha de creacion del token, saca la fecha en unix en formato dmstan
        exp: moment().add(30, 'days').unix //expiration, fecha de expiracion, para comparar una y otra fecha, se comprueba si las fechas son correctas 
    };
    //devolver el token modificado
    return jwt.encode(payload, secret);

};