import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Login, LoginService } from 'src/app/services/login.service'
import { NgModule } from '@angular/core';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormControl } from '@angular/forms';
import { ProductService } from 'src/app/services/product.service';
import { Router } from '@angular/router';
import { Product } from 'src/app/models/Product';
import { NavbarService } from 'src/app/services/navbar.service';
import { TreeViewService } from 'src/app/services/treeView.service';
import { map, startWith } from 'rxjs';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent {
  @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;
  isLoggedIn: any;
  isAdmin: any;
  inputValue: string = '';
  options: string[] = [];
  myControl: FormControl = new FormControl();

  filteredOptions!: Observable<string[]>;

  cartCount!: number;
  constructor(private login: LoginService,
    private product: ProductService,
    private route: Router,
    private navbarService: NavbarService,
    private treeviewService: TreeViewService,
    private cartService: CartService) { }

  ngOnInit() {
    if (this.login.getToken() != null) {
      this.login.isLoged.subscribe(x => {
        this.isLoggedIn = x;
      });
    }

    this.login.isAdmin.subscribe(x => {
      this.isAdmin = x;
    });

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filter(value || '')),
    );
    this.cartService.cartCount.subscribe(x => this.cartCount = x);
    let token = this.login.getinfo();
    this.cartService.getCartProducts(token.nameid).subscribe({
      next : data => {
        this.cartService.cartCount.next(data.product.length)
      }
    })
    }

  private filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  onLogout() {
    this.login.signOut();
    this.isLoggedIn = false;
    this.isAdmin = false;
  }

  someMethod() {
    this.trigger.openMenu();
  }

  submitSearch(value: string) {
    if (this.treeviewService.maxPrice === undefined) this.treeviewService.maxPrice = 1000000;
    if (this.treeviewService.minPrice === undefined) this.treeviewService.minPrice = 0;
    this.product.getFilterProduct(value, this.treeviewService.minPrice, this.treeviewService.maxPrice).subscribe({
      next: data => {
        this.navbarService.query.next(value);
        this.navbarService.productData.next(data);
      }
    })
  }

  searchProduct(query: KeyboardEvent) {
    if (query) {
      const element = query.target as HTMLInputElement;
      if (this.treeviewService.maxPrice === undefined) this.treeviewService.maxPrice = 1000000;
      if (this.treeviewService.minPrice === undefined) this.treeviewService.minPrice = 0;
      this.product.getFilterProduct(element.value, this.treeviewService.minPrice, this.treeviewService.maxPrice).subscribe({
        next: data => {
          this.navbarService.productData.next(data);
          this.navbarService.query.next(element.value);
          this.options = data.map(product => product.productName)
        }
      })
    }
  }
  onInputChange(newInputValue: any) {
    this.navbarService.contentSearch = newInputValue;
  }

}