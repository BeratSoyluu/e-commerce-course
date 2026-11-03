import { useState, type PropsWithChildren } from "react";
import type { Cart } from "../model/ICart";
import { CartContext } from "./CartContext";

//! Vite'ın fast-refresh'i (kaydedince state kaybetmeden yenileme) sadece bileşen export eden dosyalarda çalışır.
//! Bu yüzden context nesnesi CartContext.ts'te, hook useCartContext.ts'te; bu dosya sadece Provider bileşenini export ediyor.
export function CartContextProvider({children} : PropsWithChildren) {
    const [cart, setCart] = useState<Cart | null>(null);

    function deleteItem(productId: number, quantity: number){
        //? setCart'a fonksiyon veriyoruz: React en güncel state'i "prev" olarak verir, art arda çağrılarda eski değer kullanılmaz.
        setCart(prev => {
            if(!prev) return prev;

            //! push/splice yok: mevcut diziyi değiştirmek yerine yeni dizi üretiyoruz.
            //! Referans değişmezse React state'in değiştiğini anlamaz ve ekranı yeniden çizmez.
            const cartItems = prev.cartItems
                .map(item => item.productId === productId
                    ? { ...item, quantity: item.quantity - quantity } //? sadece ilgili ürünün kopyasında adet azalır
                    : item)
                .filter(item => item.quantity > 0); //? 0 veya altına düşen ürün listeden çıkar

            return { ...prev, cartItems };
        });
    }

    return (
        <CartContext.Provider value={{cart,setCart, deleteItem}}>
            {children}
        </CartContext.Provider>
    );

}
