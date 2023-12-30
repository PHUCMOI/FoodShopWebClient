import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {Login} from 'src/app/models/Login';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Register } from '../models/Register';

@Injectable({
    providedIn: 'root' 
  })

export class RegisterService {
    private baseUrl: string = environment.apiUrl;
    constructor(private http: HttpClient, private router: Router) { }

    register(register: Register){
        return this.http.post<Register>(`${this.baseUrl}Users/Register`, register);
    }
}   