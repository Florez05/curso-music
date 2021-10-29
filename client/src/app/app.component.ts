import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user.service';
import { User } from './models/user';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [UserService]
})

export class AppComponent implements OnInit {
    public title = 'SPOTIFYY';
    public user: User;
    public identity: any;
    public token: any;
    public errorMessageDiv = false;
    public errorMessage = "";

    constructor(
        private _userService: UserService
    ) {
        this.user = new User('', '', '', '', '', 'ROLE_ADMIN', '');
    }

    ngOnInit() {
        /* var texto = this._userService.signup();
        console.log(texto); */
    }

    public onSubmit() {
        console.log(this.user);
        //conseguir los datos del usuario identificado
        this._userService.signup(this.user).subscribe(
            response => {
                let identity = response;
                this.identity = identity;

                if (this.identity._id) {
                    alert("el usuario no esta correctamente logueado");
                }else{
                    //crear elemento en el localStorage para tener al usuario sesion

                    //conseguir el token para enviarselo a cada peticion hhtp
                    this._userService.signup(this.user, true).subscribe( (response) => {
                            let token = response.token;
                            this.token = token;
                            console.log("rta"+JSON.stringify(response));
                            
                            if (this.token.length <= 0) {
                                alert("el token no se ha generado");
                            }else{
                                //crear elemento en el localStorage para tener el token disponible
                                console.log(token);
                                console.log(identity);                               
                            }
                            //console.log(response);          
                        }, 
                        error => {
                            this.errorMessage = <any> error.error.message;
                            console.log(error.error.message);
                            
                            this.errorMessageDiv = true;
                            if (this.errorMessage != null) {              
                                this.errorMessage = error.error.message;
                                this.errorMessageDiv = true;
                                console.log(error);              
                            }
                        }
                    ); 
                }
                //console.log(response);          
            }, 
            error => {
                this.errorMessage = <any> error.error.message;
                console.log(error.error.message);
                
                this.errorMessageDiv = true;
                if (this.errorMessage != null) {              
                    this.errorMessage = error.error.message;
                    this.errorMessageDiv = true;
                    console.log(error);              
                }
            }
        ); 
    }
}
