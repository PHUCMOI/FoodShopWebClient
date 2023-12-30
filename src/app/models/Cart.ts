import { Product } from "./Product";

export class CartItem {
    userId!: number;
    userName!:string;
    productID!: number;
    quantity!: number;
}

export class Cart {
    product!: Product[]
    cart!: CartItem[] 
}