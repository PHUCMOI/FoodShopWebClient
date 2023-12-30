// search.service.ts
import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/Product';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  private searchQuerySubject = new BehaviorSubject<string>('');
  public productData:  EventEmitter<Product[]> = new  EventEmitter();
  public query :EventEmitter<any> = new EventEmitter();
  public contentSearch !: string;
}
