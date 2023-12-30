import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take, takeUntil } from 'rxjs';
import { Cart } from 'src/app/models/Cart';
import { Checkout } from 'src/app/models/Checkout';
import { Product } from 'src/app/models/Product';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.serivce';
import { LoginService } from 'src/app/services/login.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-order',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  isAdmin !: any;
  id !: string | null;
  public cartData: Cart = {
    product: [],
    cart: []
  }

  checkoutForm !: FormGroup;
  grandTotal !: number;
  checkoutData: Checkout = new Checkout();

  constructor(private route: ActivatedRoute,
    private cartService: CartService,
    private login: LoginService,
    private fb: FormBuilder,
    private checkoutService: CheckoutService,
    private toast: ToastrService,
    private router: Router) {
    this.checkoutForm = this.fb.group({
      fullname: ['', Validators.required],
      address: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
      payment: ['credit-card', Validators.required],
      message: ['', Validators.required]
    });

    this.route.queryParams.subscribe(params => {
      const paymentStatus = params['status']; // Adjust to your API response structure
  
      if (paymentStatus === 'success') {
        // Payment was successful, navigate back to your success page
        this.router.navigate(['/payment/success']);
      } else {
        // Handle unsuccessful payment
        this.router.navigate(['/payment/error']);
      }
    });
  }

  ngOnInit() {
    let token = this.login.getinfo();
    this.cartService.getcartData(token.nameid);
    this.cartService.cartData.subscribe(x => {
      this.cartData = x;
      this.grandTotal = this.cartService.getTotalPrice(this.cartData);
    })

    if (token.role === "Admin") {
      this.isAdmin = true;
      this.login.isAdmin.next(true);
    }
    this.login.isLoged.next(true);
  }

  removeItem(item: any) {
    this.cartService.removeItem(item);
  }

  onIncreaseQuantity(productID: number) {
    this.cartData.cart.find((item) => {
      if (item.productID === productID) {
        item.quantity++;
        this.grandTotal = this.cartService.getTotalPrice(this.cartData);
      }
    })
  }

  onDecreaseQuantity(productID: number) {
    this.cartData.cart.find((item) => {
      if (item.productID === productID) {
        if (item.quantity > 1) {
          item.quantity--;
          this.grandTotal = this.cartService.getTotalPrice(this.cartData);
        }
      }
    })
  }

  onCheckout() {
    if (this.checkoutForm.value != null) {
      let token = this.login.getinfo();
      this.checkoutData.user.userId = token.nameid;
      this.checkoutData.user.userName = token.actort;
      this.checkoutData.user.phoneNumber = this.checkoutForm.value.phoneNumber;
      this.checkoutData.user.address = this.checkoutForm.value.address;
      this.checkoutData.message = this.checkoutForm.value.message;
      this.checkoutData.payMethod = this.checkoutForm.value.payment;
      this.checkoutData.totalPrice = this.grandTotal.toString();
      
      if(this.checkoutData.payMethod === "paypal") {
        this.checkoutService.palPalCheckout(this.checkoutData, this.cartData).subscribe({
          next : data => {
            window.location.href = data.url;
          }
        })
      }
      else {
        this.checkoutService.checkout(this.checkoutData, this.cartData).subscribe({
          next: data => {
            if (data) {
              this.router.navigate(['product'])
              this.cartService.clearCart(token.nameid).subscribe(res => res)
              this.toast.success("Your order created");
              this.cartService.updateCartCount();
            }
          }
        });
      }
    }
  }
}

