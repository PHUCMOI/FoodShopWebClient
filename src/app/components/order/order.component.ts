import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AddEvent, CancelEvent, EditEvent, GridComponent, RemoveEvent, SaveEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { ToastrService } from 'ngx-toastr';
import { Order } from 'src/app/models/Order';
import { UserCheckout } from 'src/app/models/UserCheckout';
import { OrderDetailResponse } from 'src/app/models/orderDetail';
import { LoginService } from 'src/app/services/login.service';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  isAdmin !: any;
  public girdOrder: Order[] = [];

  //Update Popup
  public formGroup!: FormGroup;
  public grandTotal !: number;
  public orderDetail !: OrderDetailResponse;
  showUpdatePopUp = false;
  updateOrder!: FormGroup;

  // Delete Popup
  showDeletePopup = false;
  deleteProduct !: FormGroup;
  isSelectedOrder = 0;
  constructor(private orderService: OrderService,
    private formBuilder: FormBuilder, private toaster: ToastrService,
    private login: LoginService) {
    this.updateOrder = this.formBuilder.group({
      userName: '',
      address: '',
      payMethod: '',
      status: '',
      message: '',
      totalPrice: '',
      productList: this.formBuilder.array([])
    })
    this.deleteProduct = this.formBuilder.group({});
  };

  ngOnInit(): void {
    this.orderService.getAllOrder().subscribe({
      next: data => {
        this.girdOrder = data;
        this.login.isLoged.next(true);
        let token = this.login.getinfo();
        if (token.role === "Admin") {
          this.isAdmin = true;
          this.login.isAdmin.next(true);
        }
      },
      error: error => {
        console.log(error)
      }
    })
    this.orderService.read();
  }


  public editHandler(args: EditEvent): void {
    // define all editable fields validators and default values
    this.showUpdatePopUp = true;
    this.orderService.getAllOrderDetail(args.dataItem.orderId).subscribe({
      next: data => {
        console.log(data)
        this.orderDetail = data;
        this.grandTotal = Number(data.totalPrice);
        this.updateOrder.patchValue({
          userName: this.orderDetail.user.userName,
          address: this.orderDetail.user.address,
          payMethod: this.orderDetail.payMethod,
          status: this.orderDetail.status,
          message: this.orderDetail.message,
          totalPrice: this.grandTotal,
          productList: this.orderDetail.orderDetail

        });
        while (this.productlist.length !== 0) {
          this.productlist.removeAt(0);
        }

        for (const product of this.orderDetail.orderDetail) {
          this.productlist.push(
            this.formBuilder.group({
              productId: product.product.productId,
              productName: product.product.productName,
              quantity: product.quantity,
              price: product.product.price,
            })
          );
        }
      }
    })

  }

  get productlist() {
    return this.updateOrder.controls['productList'] as FormArray
  }

  onUpdateOrder() {
    if (this.updateOrder.valid) {
      const formData = this.updateOrder.value;
      const order: OrderDetailResponse = new OrderDetailResponse();
      order.orderId = this.orderDetail.orderId;
      order.user = new UserCheckout();
      order.user.userId = this.orderDetail.user.userId;
      order.user.userName = formData.userName;
      order.user.address = formData.address;
      order.payMethod = formData.payMethod;
      order.status = formData.status;
      order.message = formData.message;
      order.totalPrice = this.grandTotal.toString();
      order.orderDetail = this.productlist.value;
      order.user.phoneNumber = this.orderDetail.user.phoneNumber

      this.orderService.updateOrder(order).subscribe({
        next: data => {
          if (data) {
            this.orderService.getAllOrder().subscribe({
              next: data => {
                this.girdOrder = data;
                this.showUpdatePopUp = false
                this.toaster.success("successs");
              }
            })
          }
        }
      })
    }
  }


  closePopup() {
    this.showUpdatePopUp = false;
    this.showDeletePopup = false;
  }

  onIncreaseQuantity(productID: number) {
    const quantityControl = this.productlist.at(productID).get('quantity');
    if (quantityControl) {
      const currentQuantity = quantityControl.value;
      quantityControl.setValue(currentQuantity + 1);
      this.grandTotal = this.orderService.getTotalPrice(this.orderDetail, Number(currentQuantity + 1));
    }
  }

  onDecreaseQuantity(index: number) {
    const quantityControl = this.productlist.at(index).get('quantity');
    if (quantityControl) {
      const currentQuantity = quantityControl.value;
      if (currentQuantity > 1) {
        quantityControl.setValue(currentQuantity - 1);
        this.grandTotal = this.orderService.getTotalPrice(this.orderDetail, Number(currentQuantity - 1));
      }
    }
  }


  public removeHandler(args: RemoveEvent): void {
    this.showDeletePopup = true;
    this.isSelectedOrder = args.dataItem.orderId;
  }

  onSubmitDelete() {
    this.orderService.removeOrder(this.isSelectedOrder).subscribe({
      next: data => {
        if (data) {
          this.orderService.getAllOrder().subscribe({
            next: data => {
              this.girdOrder = data;
              this.closePopup()
            }
          })
        }
      }
    })
  }
}
