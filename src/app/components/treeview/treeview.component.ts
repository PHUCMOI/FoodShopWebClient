import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TreeViewModule } from "@progress/kendo-angular-treeview";
import { TreeView } from 'src/app/models/TreeView';
import { NavbarService } from 'src/app/services/navbar.service';
import { ProductService } from 'src/app/services/product.service';
import { TreeViewService } from 'src/app/services/treeView.service';
import { CheckedState } from "@progress/kendo-angular-treeview";
import { Observable, of } from 'rxjs';
import { Product } from 'src/app/models/Product';

const is = (fileName: string, ext: string) =>
  new RegExp(`.${ext}\$`).test(fileName);


@Component({
  selector: 'app-treeview',
  templateUrl: './treeview.component.html',
  styleUrls: ['./treeview.component.css']
})
export class TreeViewComponent implements OnInit {
  // Tree view
  public expandedKeys!: any[];
  public checkedKeys!: any[];
  public treeViewData: TreeView[] = [];
  public key = "text";

  search !: string;
  // Filter by price
  minPrice: number | undefined;
  maxPrice: number | undefined;
  filteredData: any[] = [];

  productFilter: Product[] = [];
  constructor(private activeRoute: ActivatedRoute,
    private treeView: TreeViewService,
    private productService: ProductService,
    private navbarService: NavbarService) {
    this.checkedKeys = [];
  }

  ngOnInit() {
    this.treeView.MergeTreeViewData().subscribe((data: TreeView[]) => {
      this.treeViewData = data;
    });
  }


  filterByPrice() {
    if (this.minPrice !== undefined && this.maxPrice !== undefined) {
      this.navbarService.query.subscribe(res => this.search = res)
      if (this.navbarService.contentSearch === undefined)
        this.search = '';
      else
        this.search = this.navbarService.contentSearch;

      this.treeView.minPrice = this.minPrice;
      this.treeView.maxPrice = this.maxPrice;
      this.productService.getFilterProduct(this.search, this.minPrice, this.maxPrice).subscribe({
        next: data => {
          //this.onCheckboxChange();
          this.productFilter = this.productFilter.filter((product) => {
            const productPrice = product.price;
            if (this.minPrice && this.maxPrice)
              return productPrice >= this.minPrice && productPrice <= this.maxPrice
            return data;
          })
          this.productService.productData.next(data);
        }
      })
    }
  }

  public children = (dataItem: any): Observable<any[]> => of(dataItem.items);
  public hasChildren = (dataItem: any): boolean => !!dataItem.items;

  public isChecked = (dataItem: any, index: string): CheckedState => {
    if (this.containsItem(dataItem)) {
      console.log(this.checkedKeys)
      return "checked";
    }

    if (this.isIndeterminate(dataItem.items)) {
      return "indeterminate";
    }
    return "none";

  };

  private containsItem(item: any): boolean {
    return this.checkedKeys.indexOf(item[this.key]) > -1;
  }

  private isIndeterminate(items: any[] = []): boolean {
    let idx = 0;
    let item;

    while ((item = items[idx])) {
      if (this.isIndeterminate(item.items) || this.containsItem(item)) {
        return true;
      }

      idx += 1;
    }

    return false;
  }

  onCheckboxChange() {
    if (this.checkedKeys && this.checkedKeys.length > 0) {
      this.productFilter = this.productService.allProductList.filter((product) => {
        return this.checkedKeys.includes(product.productCategory) || this.checkedKeys.includes(product.productName);
      });
      this.filterByPrice()
      this.productService.productData.next(this.productFilter);
    }

    if (this.checkedKeys.length === 0) {
      this.productService.productData.next(this.productService.allProductList);
    }
  }

  public iconClass({ text, items }: any): any {
    return {
      "k-i-file-pdf": is(text, "pdf"),
      "k-i-folder": items !== undefined,
      "k-i-code": is(text, "html"),
      "k-i-image": is(text, "jpg|png"),
      "k-icon": true,
      "k-font-icon": true,
    };
  }
}


