import { Product } from "./Product";

export class Order {
    orderId !: number;
    userId !: number;
    username !: string;
    address !: string;
    totalPrice !: number;
    payMethod !: string;
    status !: string;
    message !: string;
}

