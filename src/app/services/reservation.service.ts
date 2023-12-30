import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {Login} from 'src/app/models/Login';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Register } from '../models/Register';
import { GetTimeList, Restaurant, TimeList } from '../models/Restaurant';
import { RestaurantMap } from '../models/RestaurantMap';
import { ReservationData } from '../models/modelRequest/ReservationData';
import { Reservation } from '../models/Reservation';

@Injectable({
    providedIn: 'root' 
  })

export class ReservationService {
    url : string = 'Reservation';
    private baseUrl: string = environment.apiUrl;
    constructor(private http: HttpClient, private router: Router) { }

    getTimeList(getTimeList : GetTimeList) {
        return this.http.post<TimeList[]>(`${environment.apiUrl}${this.url}/GetTimeList`, getTimeList);
    }

    makeReservation(reservation : Reservation) {
        return this.http.post<boolean>(`${environment.apiUrl}${this.url}/MakeReservation`, reservation);
    }
}