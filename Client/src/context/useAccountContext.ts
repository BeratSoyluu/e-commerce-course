import { useContext } from "react";
import { AccountContext } from "./AccountContext";

export function useAccountContext(){
    const context = useContext(AccountContext);

    //! Provider dışında kullanılırsa hemen hata veriyoruz; yoksa sessizce undefined dönüp başka yerde patlardı.
    if(context === undefined){
        throw new Error("no provider")
    }
    return context;
}
