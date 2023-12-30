import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Order } from '../models/Order';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { OrderDetailResponse } from '../models/orderDetail';
import { or } from '@progress/kendo-angular-grid/utils';

const CREATE_ACTION = 'create';
const UPDATE_ACTION = 'update';
const REMOVE_ACTION = 'destroy';

@Injectable({
    providedIn: 'root' 
})
export class OrderService extends BehaviorSubject<Order[]> {
    url : string = 'Order';
    private data: Order[] = [];
    constructor(private http: HttpClient, private router: Router) {
        super([]); 
    }
    getAllOrder() {
        return this.http.get<Order[]>(`${environment.apiUrl}${this.url}`);
    }    

    getAllOrderDetail(orderId : number) {
        return this.http.get<OrderDetailResponse>(`${environment.apiUrl}${this.url}/Details/${orderId}`)
    }

    updateOrder(order : OrderDetailResponse) {
        return this.http.post<boolean>(`${environment.apiUrl}${this.url}/Update`, order)
    }

    removeOrder(orderId : number) {
        return this.http.post<boolean>(`${environment.apiUrl}${this.url}/Delete`, orderId)
    }

    getTotalPrice(data : OrderDetailResponse, quantity : number) : number{
        let grandTotal = 0;
        data.orderDetail.forEach(order => {
          const product = data.orderDetail.find(p => p.productId === order.product.productId);
          if (product) {
            grandTotal += product.product.price * quantity;
          }
        });  
        return grandTotal;
      }

    public read(): void {
        if (this.data.length) {
            return super.next(this.data);
        }

        this.fetch()
            .pipe(
                tap(data => {
                    this.data = data;
                })
            )
            .subscribe(data => {
                super.next(data);
            });
    }

    public save(data: Order) {
        return this.http.post<boolean>(`${environment.apiUrl}${this.url}`,data);
    }

    public remove(data: Order[]): void {
        this.reset();

        this.fetch(REMOVE_ACTION, data)
            .subscribe(() => this.read(), () => this.read());
    }
    public resetItem(dataItem: Order): void {
        if (!dataItem) { return; }
      
        // Find the original data item
        const originalDataItem = this.data.find(item => item.orderId === dataItem.orderId);
      
        if (originalDataItem) {
          // Revert changes
          Object.assign(originalDataItem, dataItem);
        }
      
        super.next(this.data);
      }
    
    private reset() {
        this.data = [];
    }

    private fetch(action = '', data?: Order[]): Observable<Order[]> {
        return this.http
            .jsonp(`https://demos.telerik.com/kendo-ui/service/Products/${action}?${this.serializeModels(data)}`, 'callback')
            .pipe(map(res => <Order[]>res));
    }

    private serializeModels(data?: Order[]): string {
        return data ? `&models=${JSON.stringify([data])}` : '';
    }
}   
