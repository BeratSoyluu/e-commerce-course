import { useCallback, useEffect, useState, type PropsWithChildren } from "react";
import type { User } from "../model/IUser";
import { AccountContext } from "./AccountContext";
import { clearStoredUser, getStoredUser, storeUser, UNAUTHORIZED_EVENT } from "../utils/userStorage";

export function AccountContextProvider({children} : PropsWithChildren) {
    //? Lazy başlangıç: localStorage sadece ilk render'da okunur, her render'da değil.
    //? Sayfa yenilense de kullanıcı hemen "giriş yapmış" görünür; App açılışta token'ı getUser ile doğrular.
    const [user, setUser] = useState<User | null>(() => getStoredUser());

    //? useCallback: fonksiyonlar her render'da yeniden oluşmasın. App'teki useEffect bunlara bağımlı,
    //? referans değişseydi effect her render'da tekrar çalışırdı.
    const login = useCallback((user: User) => {
        storeUser(user);
        setUser(user);
    }, []);

    const logout = useCallback(() => {
        clearStoredUser();
        setUser(null);
    }, []);

    //? Interceptor 401 alınca bu olayı yayınlıyor; state'i burada temizliyoruz.
    useEffect(() => {
        window.addEventListener(UNAUTHORIZED_EVENT, logout);
        return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
    }, [logout]);

    return (
        <AccountContext.Provider value={{ user, login, logout }}>
            {children}
        </AccountContext.Provider>
    );
}
