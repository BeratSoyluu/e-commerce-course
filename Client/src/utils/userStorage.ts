import type { User } from "../model/IUser";

const USER_KEY = "user";

//? Interceptor React dışında çalıştığı için token'ı context'ten değil localStorage'dan okuyor.
//? Tarayıcı localStorage'a erişimi engelleyebilir (gizli mod, kapalı site verisi) ya da veri bozuk olabilir; o yüzden try/catch.
//! localStorage'daki token'ı sayfadaki her script okuyabilir (XSS). Bu yüzden React'in otomatik escape'ine güveniyoruz,
//! dangerouslySetInnerHTML kullanmıyoruz.
export function getStoredUser(): User | null {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) as User : null;
    } catch {
        return null;
    }
}

export function storeUser(user: User) {
    try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch { /* depolama kapalıysa oturum sadece bu sekmede yaşar */ }
}

export function clearStoredUser() {
    try { localStorage.removeItem(USER_KEY); } catch { /* yoksay */ }
}

//? Interceptor 401 aldığında React state'ine doğrudan ulaşamaz; bu olayı yayınlar, AccountContextProvider dinler.
export const UNAUTHORIZED_EVENT = "auth:unauthorized";
