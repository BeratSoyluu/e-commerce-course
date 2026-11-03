export type OrderStatus = "Pending" | "Approved" | "PaymentFailed" | "Completed";

export interface OrderItem {
    productId: number;
    productName: string;
    productImage?: string;
    price: number;
    quantity: number;
}

export interface Order {
    id: number;
    customerId: string;
    orderDate: string; //? ISO metin (UTC, sonu "Z"); formatDate ile yerel saate çevrilir
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    addressLine: string;
    orderStatus: OrderStatus;
    subTotal: number;
    deliveryFee: number;
    total: number;
    orderItems: OrderItem[];
}

export interface Address {
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    addressLine: string;
}

export interface Card {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
}

//? Backend'deki CreateOrderDTO'nun karşılığı: adres + kart gönderiliyor, fiyatlar sunucuda hesaplanıyor.
export interface CreateOrder extends Address {
    card: Card;
}
