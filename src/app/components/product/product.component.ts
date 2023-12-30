import { Component } from '@angular/core';
import '@angular/localize/init';
import { Product } from 'src/app/models/Product';
import { LoginService } from 'src/app/services/login.service';
import { ProductService } from 'src/app/services/product.service';
import { NgToastService } from 'ng-angular-popup';
import { FormBuilder, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TreeView } from 'src/app/models/TreeView';
import { TreeViewService } from 'src/app/services/treeView.service';
import { CartService } from 'src/app/services/cart.service';
import { Cart, CartItem } from 'src/app/models/Cart';
import { Route, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Category } from 'src/app/models/Category';
import { CategoryService } from 'src/app/services/category.service';
import { NavbarService } from 'src/app/services/navbar.service';
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent {
  gridData: Product[] = [];
  isAdmin: any;

  showAddPopup = false;
  showDeletePopup = false;
  deleteProduct: FormGroup;
  addProduct: FormGroup;

  imgUrlInput: any;
  isSelectedProductId !: number;
  categories: Category[] = [];

  addCategory: FormGroup;
  showCategoryPopUp = false;

  treeviewVisible: boolean = false;

  constructor(private login: LoginService,
    private productService: ProductService,
    private ngToast: NgToastService,
    private treeView: TreeViewService,
    private cartService: CartService,
    private route: Router,
    private toaster: ToastrService,
    private formBuilder: FormBuilder,
    private categoryService: CategoryService,
    private navbarService: NavbarService) {
    this.deleteProduct = this.formBuilder.group({});
    this.addProduct = this.formBuilder.group({
      productName: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', Validators.required],
      imgUrlInput: ['']
    });
    this.addCategory = this.formBuilder.group({
      categoryName: ['', Validators.required]
    })
  }

  ngOnInit() {
    this.productService.getProductList().subscribe({
      next: data => {
        this.gridData = data;
        this.productService.allProductList = data;
        this.login.isLoged.next(true);
      },
      error: error => {
        console.error('Error fetching products:', error);
      },
      complete: () => {
        let token = this.login.getinfo();
        if (token.role === "Admin") {
          this.isAdmin = true;
          this.login.isAdmin.next(true);       
          this.cartService.getCartProducts(token.nameid).subscribe({
            next : data => {
              this.cartService.cartCount.next(data.product.length)
            }
          })   
        }
      }
    });
    this.searchProducts();
    this.productService.productData.subscribe(res => this.gridData = res)
  }

  searchProducts() {
    this.navbarService.productData.subscribe(res => this.gridData = res);
  }

  onFilterChange(eventData: { minPrice: number | undefined, maxPrice: number | undefined }) {
    if (eventData.minPrice !== undefined && eventData.maxPrice !== undefined) {
      console.log("price")
      this.productService.getFilterProductByPrice(eventData.minPrice, eventData.maxPrice).subscribe({
        next: data => {
          this.gridData = data;
        },
        error: error => {
          console.error(error);
        }
      });
    }
  }

  // Check double click
  async onAddToCart(productID: number) {
    this.cartService.checkIsExist(productID, 1);
    this.toaster.success('Add item to cart success');
    let token = this.login.getinfo();
  }

  async onBuyNow(productID: number) {
    const res = await this.cartService.checkIsExist(productID, 1);
    if (res !== null) {
      this.route.navigate([`checkout`]);
    }
  }

  onUpdate(productID: number) {
    this.route.navigate(['/detail', productID]);
  }

  onDelete(productID: number) {
    this.isSelectedProductId = productID;
    this.showDeletePopup = true;
  }

  onSubmitDelete() {
    this.productService.removeProduct(this.isSelectedProductId).subscribe({
      next: data => {
        if (data) {
          this.productService.getProductList().subscribe({
            next: data => {
              this.gridData = data
            }
          })
          this.showDeletePopup = false;
        }
      }
    });
  }

  closePopup() {
    this.showAddPopup = false;
    this.showDeletePopup = false;
    this.showCategoryPopUp = false;
  }

  onSubmitAdd() {
    if (this.addProduct.valid) {
      const formData: Product = {
        productId: 0,
        productName: this.addProduct.get('productName')?.value,
        productCategory: this.addProduct.get('category')?.value,
        description: this.addProduct.get('description')?.value,
        price: this.addProduct.get('price')?.value,
        imgUrl: this.imgUrlInput,
      };

      this.productService.addProduct(formData).subscribe({
        next: data => {
          if (data)
            this.productService.getProductList().subscribe({
              next: data => {
                this.gridData = data
              }
            })
          this.showAddPopup = false;
        }
      });
    }
  }

  onShowAddPopup() {
    this.showAddPopup = true;
    this.categoryService.getCategoryList().subscribe({
      next: data => {
        this.categories = data;
      }
    })
  }

  onFileSelected(event: Event) {
    if (event.target instanceof HTMLInputElement) {
      const files: FileList | null = event.target.files;
      if (files && files.length > 0) {
        this.imgUrlInput = files[0].name;
      }
    }
  }

  onShowCategoryPopUp() {
    this.showCategoryPopUp = true;
  }

  onAddCategory() {
    if (this.addCategory.valid) {
      const formData: Category = {
        categoryName: this.addCategory.get('categoryName')?.value
      }

      this.categoryService.addCategory(formData).subscribe(res => this.showCategoryPopUp = false)
    }
  }

  
toggleTreeView() {
  this.treeviewVisible = !this.treeviewVisible;
}
}