export class User{ //se puedo importar en otra clase
    constructor(
        public _id: string, //inicializa una propiedad y le asigna un valor
        public name: string,
        public surname: string,
        public email: string,
        public password: string,
        public role: string,
        public image: string      
    ){}
}