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

//? Backend'deki CreateOrderDTO'nun karşılığı: sadece adres gönderiliyor, fiyatlar sunucuda hesaplanıyor.
export interface CreateOrder {
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    addressLine: string;
}
