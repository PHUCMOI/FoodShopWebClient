export class Restaurant {
    restaurantId !: number;
    restaurantName !: string;
}

export class GetTimeList {
    restaurantId !: number;
    reservationDate !: string;
}

export class TimeList {
    time !: string;
    available !: boolean;
}