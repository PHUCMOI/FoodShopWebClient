import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {Login} from 'src/app/models/Login';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Register } from '../models/Register';
import { GetTimeList, Restaurant, TimeList } from '../models/Restaurant';
import { DeleteTable, RestaurantMap } from '../models/RestaurantMap';
import { ReservationData } from '../models/modelRequest/ReservationData';

@Injectable({
    providedIn: 'root' 
  })

export class RestaurantService {
    url : string = 'Restaurants';
    private baseUrl: string = environment.apiUrl;
    constructor(private http: HttpClient, private router: Router) { }

    getRestaurantList() {
        return this.http.get<Restaurant[]>(`${environment.apiUrl}${this.url}`);
    }

    updateMaps(restaurantMap : RestaurantMap[]) {
        return this.http.post<boolean>(`${environment.apiUrl}${this.url}/updateMaps`, restaurantMap);
    }

    createMaps(restaurantMap : RestaurantMap[]) {
        return this.http.post<boolean>(`${environment.apiUrl}${this.url}/createMaps`, restaurantMap);
    }

    getRestaurantMap(reservationData : ReservationData) {
        return this.http.post<RestaurantMap[]>(`${environment.apiUrl}${this.url}/GetMaps`, reservationData);
    }

    addNewTable(restaurantMap : RestaurantMap) {
        return this.http.post<boolean>(`${environment.apiUrl}${this.url}/AddNewTable`, restaurantMap);
    }

    removeTable(deleteTable : DeleteTable) {
        return this.http.post<boolean>(`${environment.apiUrl}${this.url}/DeleteTable`, deleteTable);
    }
}   