import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';
import { LoginService } from 'src/app/services/login.service';
import { Cart, CartItem } from 'src/app/models/Cart';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/Product';
import { NavbarService } from 'src/app/services/navbar.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  isAdmin !: any;
  public cartData: Cart = {
    product: [],
    cart: []
  };
  public grandTotal !: number;

  public cartCount !: number;

  constructor(private cartService: CartService, 
    private login: LoginService, 
    private productService: ProductService,
    private navbarService: NavbarService) { }

  async ngOnInit() {
    let token = this.login.getinfo();
    (await this.cartService.getCartProducts(token.nameid)).subscribe({
      next: (data) => {
        this.cartData = data;
        this.grandTotal = this.cartService.getTotalPrice(this.cartData);
        let token = this.login.getinfo();
        if (token.role === "Admin") {
          this.isAdmin = true;
          this.login.isAdmin.next(true);
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
    this.cartService.cartData.subscribe(x => {
      this.cartData = x;
    })

  }

  removeItem(item: CartItem) {
    this.cartService.removeItem(item);
  }
}

