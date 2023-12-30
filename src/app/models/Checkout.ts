import { UserCheckout } from "./UserCheckout";
import { OrderDetail } from "./orderDetail";

export class Checkout {    
    user : UserCheckout = new UserCheckout();
    totalPrice !: string;
    payMethod !: string;
    status !: string;
    message !: string;
    orderDetail : OrderDetail[] = [];
}