import { createContext, useContext, useState, type PropsWithChildren } from "react";
import type { Cart } from "../model/ICart";

interface CartContextValue{
    cart: Cart | null;
    setCart: (cart: Cart) => void;
    deleteItem: (productId: number, quantity: number) => void;

}

export const CartContext= createContext<CartContextValue | undefined>(undefined);

export function useCartContext(){
    const context = useContext(CartContext);

    if(context === undefined){
        throw new Error("nı provider")
    }
    return context;
}

export function CartContextProvider({children} : PropsWithChildren) {
    const [cart, setCart] = useState<Cart | null>(null);

    function deleteItem(productId: number, quantity: number){

    }

    return (
        <CartContext.Provider value={{cart,setCart, deleteItem}}>
            {children}
        </CartContext.Provider>
    );

}

