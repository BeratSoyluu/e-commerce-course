import { createContext } from "react";
import type { Cart } from "../model/ICart";

//? Context nesnesi ve tipi ayrı (.ts) dosyada. Bileşen içermediği için fast-refresh kuralını ilgilendirmiyor.
export interface CartContextValue{
    cart: Cart | null;
    setCart: (cart: Cart | null) => void; //? null: çıkışta veya sipariş sonrası sepeti sıfırlamak için
    deleteItem: (productId: number, quantity: number) => void;

}

export const CartContext= createContext<CartContextValue | undefined>(undefined);
