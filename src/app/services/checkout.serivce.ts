import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Checkout } from '../models/Checkout';
import { Cart } from '../models/Cart';
import { environment } from 'src/environments/environment';
import { PaypalCheckout } from '../models/PaypalCheckout';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private url = "Order"

  constructor(private http: HttpClient) { }

    checkout(checkoutData : Checkout, cart : Cart) {
        checkoutData.orderDetail = cart.cart.map(item => {
            return {
                productId: item.productID,
                quantity: item.quantity
            }
        })
        const url = `${environment.apiUrl}${this.url}/Create`;
        return this.http.post<boolean>(url, checkoutData);
    }

    palPalCheckout(checkoutData : Checkout, cart : Cart) {
      checkoutData.orderDetail = cart.cart.map(item => {
        return {
            productId: item.productID,
            quantity: item.quantity
        }
    })
    const url = `${environment.apiUrl}${this.url}/paypal`;
    return this.http.post<PaypalCheckout>(url, checkoutData);
    }

    payPalSuccessCheckout() {
      const url = `${environment.apiUrl}${this.url}/PaymentSuccess`;
    }
    
}