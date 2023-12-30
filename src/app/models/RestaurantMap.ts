import { NumberLiteralType } from "typescript";

export class RestaurantMap {
    userId !: number;
    restaurantId !: number;
    cols!: number;
    rows !: number;
    positionX !: number;
    positionY !: number;
    isAvailable !: boolean;
    tableId !: number;
}

export class DeleteTable {
    userId !: number;
    restaurantId !: number;
    tableId !: number;
}