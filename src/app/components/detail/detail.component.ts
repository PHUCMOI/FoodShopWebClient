import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CartItem } from 'src/app/models/Cart';
import { Product } from 'src/app/models/Product';
import { CartService } from 'src/app/services/cart.service';
import { LoginService } from 'src/app/services/login.service';
import { ProductService } from 'src/app/services/product.service';
import { CategoryService } from '../../services/category.service';
import { Category } from 'src/app/models/Category';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css'],
})
export class DetailComponent implements OnInit {
  id !: string | null;
  product !: Product;
  quantity: number = 1;
  @Input() productByCategory: any;

  isAdmin: any;
  imgUrlInput: any;
  isSelectedProductId !: number;

  categories: Category[] = [];
  constructor(private route: ActivatedRoute,
    private productService: ProductService,
    private login: LoginService,
    private cartService: CartService,
    private categoryService: CategoryService,
    private router: Router,
    private toast: ToastrService) {
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.productService.getProductByID(Number(this.id)).subscribe({
      next: data => {
        this.product = data;
        let token = this.login.getinfo();
        if (token.role === "Admin") {
          this.isAdmin = true;
          this.categoryService.getCategoryList().subscribe({
            next : data => {
              this.categories = data;
            }
          })
        }
        this.login.isLoged.next(true);

        // call data category
        this.productService.getProductsByCategoryName(this.product.productCategory).subscribe({
          next : data => {
            this.productByCategory = data;
          }
        })
      },
      error: error => {
        console.error(error);
      }
    })
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Use ActivatedRoute to access route parameters
        const routeParams = this.route.snapshot.params;
        this.productService.getProductByID(routeParams['id']).subscribe({
          next: data => {
            this.product = data;
          }
        })
      }
    });
  }

  onIncreaseQuantity() {
    this.quantity++;
  }

  onDecreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  onAddToCart(productID: number) {
    this.cartService.checkIsExist(productID, this.quantity);
    this.toast.success("Item added to cart")
  }

  onBuyNow(productID: number) {
    this.cartService.checkIsExist(productID, this.quantity);
    this.router.navigate(['checkout'])
  }

  onUpdateProduct(product: Product) {
    const formData: Product = {
      productId: product.productId,
      productName: product.productName,
      productCategory: product.productCategory,
      description: product.description,
      price: product.price,
      imgUrl: this.imgUrlInput
    }

    console.log(formData)
    this.productService.updateProduct(formData).subscribe({
      next: data => {
        if (data)
          this.productService.getProductByID(formData.productId).subscribe({
            next: data => {
              this.product = data;
            }
          });
      }
    })

  }

  onImageChange(event: Event) {
    if (event.target instanceof HTMLInputElement) {
      const files: FileList | null = event.target.files;
      if (files && files.length > 0) {
        this.imgUrlInput = files[0].name;
      }
    }
  }
}