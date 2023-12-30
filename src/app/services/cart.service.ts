import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/Product';
import { Cart, CartItem } from '../models/Cart';
import { environment } from 'src/environments/environment';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  public url = "Cart"
  public cartItemList: Product[] = [];
  public productList = new BehaviorSubject<any>([]);
  public search = new BehaviorSubject<string>("");
  public cartApi: Cart = {
    product: [],
    cart: []
  };
  public cartCount: EventEmitter<any> = new EventEmitter();
  public cartData: EventEmitter<any> = new EventEmitter();
  constructor(private http: HttpClient, private login: LoginService) { }

  // Call API
  getCartProducts(userId: number): Observable<any> {
    return this.http.get<Cart>(`${environment.apiUrl}${this.url}?userId=${userId}`)
  }

  updateCart(cart: CartItem): Observable<boolean> {
    const url = `${environment.apiUrl}${this.url}/UpdateCart`;
    return this.http.post<boolean>(url, cart);
  }

  addtoCart(cart: CartItem) {
    const url = `${environment.apiUrl}${this.url}/AddToCart`;
    return this.http.post<boolean>(url, cart);
  }

  removeCartItem(cart: CartItem) {
    const url = `${environment.apiUrl}${this.url}/DeleteItem`;
    return this.http.post<boolean>(url, cart);
  }

  clearCart(userId: number) {
    const url = `${environment.apiUrl}${this.url}/clearCart`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<boolean>(url, userId, { headers });
  }

  // Bussiness Logic
  getTotalPrice(data: Cart): number {
    let grandTotal = 0;
    data.cart.forEach(cartItem => {
      const product = data.product.find(p => p.productId === cartItem.productID);
      if (product) {
        grandTotal += product.price * cartItem.quantity;
      }
    });
    return grandTotal;
  }

  async checkIsExist(productID: number, quantity: number) {
    let token = this.login.getinfo();
    let cart: CartItem = new CartItem();
    cart.userId = token.nameid;
    cart.userName = token.actort;
    cart.quantity = quantity;
    cart.productID = productID;

    (await this.getCartProducts(token.nameid)).subscribe({
      next: (data) => {
        this.cartApi = data;
        const existingItem = this.cartApi.cart.find(item => item.productID == productID);

        if (existingItem) {
          this.cartApi.cart.find(item => {
            if (item.productID == productID) {
              if (quantity == 1) item.quantity++;
              else {
                item.quantity += quantity;
              }
              this.updateCart(item).subscribe(res => {
                this.getcartData(token.nameid);
                this.updateCartCount()

              });
            }
          });
        } else {
          this.addtoCart(cart).subscribe(res => {
            this.getcartData(token.nameid);
            this.updateCartCount()

          });
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  public getcartData(nameid: number) {
    this.getCartProducts(nameid).subscribe(x => {
      return this.cartData.next(x);
    })
  }

  removeItem(item: CartItem) {
    const token = this.login.getinfo();
    this.removeCartItem(item).subscribe(async () => {
      (await this.getCartProducts(token.nameid)).subscribe(data => {
        this.cartData.next(data);
        this.getTotalPrice(data);
        this.updateCartCount();
      });
    });
  }

  public updateCartCount() {
    const token = this.login.getinfo();
    this.getCartProducts(token.nameid).subscribe({
      next: data => {
        this.cartCount.next(data.product.length);
      }
    });
  }
}