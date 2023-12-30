import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { Product } from '../models/Product';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private url = "Product"

  public allProductList: Product[] = [];
  public productData:  EventEmitter<Product[]> = new  EventEmitter();
  
  constructor(private http: HttpClient) { }

  public getProductList(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}${this.url}`);
  }

  public getSearchProductList(value: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}${this.url}/Search?value=${value}`)
  }

  public getFilterProductByPrice(minPrice: number, maxPrice: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}${this.url}/Search?minPrice=${minPrice}&maxPrice${maxPrice}`);
  }

  public getFilterProduct(value: string | null, minPrice: number | null, maxPrice: number | null): Observable<Product[]> {
    if (minPrice !== null && maxPrice !== null && value !== null) {
      // Filter by all three parameters
      return this.http.get<Product[]>(`${environment.apiUrl}${this.url}/Search?value=${value}&minPrice=${minPrice}&maxPrice=${maxPrice}`);
    } else if (minPrice !== null && maxPrice !== null) {
      // Filter by price range only
      return this.getFilterProductByPrice(minPrice, maxPrice);
    } else if (value !== null) {
      // Filter by value only
      return this.getSearchProductList(value);
    } else {
      return this.getProductList();
    }
  }
  

  public getProductByID(productId: number) {
    return this.http.get<Product>(`${environment.apiUrl}${this.url}/Details/${productId}`)
  }

  public addProduct(product: Product) {
    return this.http.post<boolean>(`${environment.apiUrl}${this.url}/Create`, product);
  }

  public removeProduct(productID: number) {
    return this.http.post<boolean>(`${environment.apiUrl}${this.url}/Delete`, productID);
  }

  public updateProduct(product: Product) {
    return this.http.post<boolean>(`${environment.apiUrl}${this.url}/Update`, product);
  }

  public getProductsByCategoryName(categoryName : string) {
    return this.http.get<Product[]>(`${environment.apiUrl}${this.url}/categoryName/${categoryName}`)
  }
}