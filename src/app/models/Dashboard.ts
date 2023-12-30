export class Dashboard {
    topProductSellers !: TopProduct[];
    topCustomer !: TopUser[];
    totalIncome !: string;
}

export class TopProduct {
    productId !: number;
    productName!: string;
    quantity!: number;
}

export class TopUser {
    userId !: number;
    userName !: string;
    totalOrderAmount !: number;
}