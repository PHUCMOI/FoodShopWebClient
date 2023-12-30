import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { PieChart } from "../models/Chart";
import { environment } from "src/environments/environment";
import { Dashboard } from "../models/Dashboard";

@Injectable({
    providedIn: 'root'
  })

export class DashboardService {
    url: string = 'Dashboard'

    constructor(private http: HttpClient) {

    }

    getPieChartData() {
        return this.http.get<PieChart[]>(`${environment.apiUrl}${this.url}/piechart`)
    }

    getBarChartCategoryData() {
        return this.http.get<PieChart[]>(`${environment.apiUrl}${this.url}/barchartcategory`)
    }

    getDashboardData() {
        return this.http.get<Dashboard>(`${environment.apiUrl}${this.url}`)
    }
}
