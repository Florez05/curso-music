import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders} from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { GLOBAL } from './global';
import { letProto } from 'rxjs-compat/operator/let';

@Injectable()
export class UserService {
    public url: string;

    constructor(private _http: HttpClient) {
        this.url = GLOBAL.url;
    }

    signup(user_to_login: any, gethash = null){
        /* return 'Hola mundo'; */
        if (gethash != null) {
            user_to_login.gethash = gethash;
        }
        let json = JSON.stringify(user_to_login);
        let params = json;

        let headers = new HttpHeaders({'Content-Type':'application/json'});

        return this._http.post( this.url+'login', params, {headers: headers})
                          .pipe(map((res: any) => res.json ));
    }
}