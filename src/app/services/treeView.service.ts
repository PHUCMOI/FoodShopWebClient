import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { Product } from '../models/Product';
import { ProductService } from './product.service';
import { CategoryService } from './category.service';
import { Category } from '../models/Category';
import { forkJoin, map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TreeViewService {
    products: Product[] = [];
    categories: Category[] = [];
    minPrice !: number;
    maxPrice !: number;
    public filterEvent = new EventEmitter<{ minPrice: number | undefined, maxPrice: number | undefined }>();

    constructor(private http: HttpClient, private productService: ProductService, private categoryService: CategoryService) { }

    public MergeTreeViewData(): Observable<any> {
        return forkJoin(
            this.productService.getProductList(),
            this.categoryService.getCategoryList()
        ).pipe(
            map(([products, categories]) => {
                return categories.map(category => {
                    const categoryNode = {
                        text: category.categoryName, icon: 'fastfood',
                        items: products
                            .filter(product => product.productCategory === category.categoryName)
                            .map(product => ({
                                text: product.productName,
                                icon: 'restaurant'
                            }))
                    };
                    return categoryNode;
                });
            })
        )
    }    
    
}