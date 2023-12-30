import { Product } from "./Product";
import { UserCheckout } from "./UserCheckout";

export class OrderDetail {
    productId !: number;
    quantity !: number;
}

export class OrderDetailResponse {
    orderId !: number;
    user !: UserCheckout;
    payMethod !: string;
    status !: string;
    message!: string;
    totalPrice !: string;
    orderDetail !: OrderDetailInfo[]
}

export class OrderDetailInfo {
    productId !: number;
    quantity !: number;
    product !: Product;
}