import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { Category } from '../models/Category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private url = "Category"

  constructor(private http: HttpClient) { }

  public getCategoryList() : Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}${this.url}`);
  }

  public addCategory(category : Category) {
    return this.http.post<boolean>(`${environment.apiUrl}${this.url}/Create`, category);
  }
}