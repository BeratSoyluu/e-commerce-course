import { useContext } from "react";
import { CartContext } from "./CartContext";

export function useCartContext(){
    const context = useContext(CartContext);

    //! Provider dışında kullanılırsa hemen hata veriyoruz; yoksa sessizce undefined dönüp başka yerde patlardı.
    if(context === undefined){
        throw new Error("no provider")
    }
    return context;
}
