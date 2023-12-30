import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {Login} from 'src/app/models/Login';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
    providedIn: 'root' 
  })

export class LoginService {
    private baseUrl: string = environment.apiUrl;
    public isLoged: EventEmitter<any> = new  EventEmitter(false);
    public isAdmin: EventEmitter<any> = new  EventEmitter(false);
    constructor(private http: HttpClient, private router: Router) { }

    login(loginModel: Login){
        return this.http.post<Login>(`${this.baseUrl}Users/Login`, loginModel);
    }

    signOut(){
        localStorage.clear();
        this.router.navigate(['login'])
        this.isLoged.next(false);
    }

    storeToken(token : string){
        localStorage.setItem('token', token);
    }

    getToken(){
        return localStorage.getItem('token');
    }

    isLoggedIn() : boolean{
        return !!localStorage.getItem('token')
    }

    getinfo() {
        let token = this.getToken();          
        if(token != null){
            let jwtData = token.split('.')[1];
            let decodedJwtJsonData = window.atob(jwtData);
            let decodedJwtData = JSON.parse(decodedJwtJsonData);
            return decodedJwtData;            
          }
    }
}   

export { Login };
