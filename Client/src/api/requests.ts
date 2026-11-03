import axios, { AxiosError, type AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { router } from "../router/Routes";
import { API_URL } from "../utils/helpers";
import type { IProduct } from "../model/IProduct";
import type { MetaData, PaginatedResponse } from "../model/IPagination";
//? Aşağıdaki "const Cart" ile isim çakışmasın diye tipi ICart adıyla alıyoruz.
import type { Cart as ICart } from "../model/ICart";
import type { User } from "../model/IUser";
import type { CreateOrder, Order } from "../model/IOrder";
import { clearStoredUser, getStoredUser, UNAUTHORIZED_EVENT } from "../utils/userStorage";

//? Adres resimlerle aynı .env değişkeninden geliyor; port değişirse tek bir yeri güncellemek yeterli.
axios.defaults.baseURL=`${API_URL}/api/`;
axios.defaults.withCredentials = true;

//? Her isteğe, giriş yapılmışsa JWT eklenir. Backend [Authorize] olan endpoint'lerde bu header'a bakar.
axios.interceptors.request.use(config => {
    const token = getStoredUser()?.token;
    if(token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

axios.interceptors.response.use(response => {
    return response;
}, (error: AxiosError) =>{
    //! API kapalıysa ya da ağ kesikse sunucudan hiç cevap gelmez, error.response undefined olur.
    //! Kontrol etmeden destructure edersek interceptor'un kendisi hata fırlatır.
    if(!error.response){
        //? Sabit toastId: aynı anda birden fazla istek düşerse (StrictMode'da effect iki kez çalışır) tek toast görünür.
        toast.error("Sunucuya ulaşılamıyor", { toastId: "network-error" });
        return Promise.reject(error);
    }

    const {data, status} = error.response as AxiosResponse;
    switch(status){
        case 400:
            if (data.errors) {
                const validationErrors: string[] = [];
                for (const key in data.errors) {
                    validationErrors.push(...data.errors[key]);
                }
                validationErrors.forEach(message => toast.error(message));
            } else {
                toast.error(data.title);
            }
            break;
        case 401:
            if(getStoredUser()) {
                //? Token vardı ama sunucu kabul etmedi (süresi dolmuş/geçersiz): çıkış yap, login'e gönder.
                //? React state'ine buradan ulaşamadığımız için olay yayınlıyoruz; AccountContextProvider dinliyor.
                clearStoredUser();
                window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
                toast.error("Oturumunuzun süresi doldu, lütfen tekrar giriş yapın.", { toastId: "session-expired" });
                router.navigate("/login", { state: { from: router.state.location } });
            } else {
                //? Token yoksa (ör. login'de yanlış şifre) sadece sunucunun mesajını göster
                toast.error(data?.title ?? "Bu işlem için giriş yapmalısınız.");
            }
            break;
        case 403:
            //? Giriş yapılmış ama rol yetmiyor (ör. Customer, admin endpoint'ine istek attı)
            toast.error("Bu işlem için yetkiniz yok.");
            break;
        case 404:
            toast.error(data.title);
            break;
        case 500:
            router.navigate("/server-error", {state:{error:data}});
            break;
        default:
            break;
    }
    return Promise.reject(error.response);
})

//? <T> ile her çağrı ne döndüğünü söylüyor: get<IProduct[]>(...) -> Promise<IProduct[]>.
//? Önceden dönüş "any" idi; yanlış alan adı (ör. cart.items) yazınca TypeScript hiçbir şey demiyordu.
//? body için "{}" yerine "object": "{}" null hariç her şeyi (0, "" gibi) kabul eder, "object" sadece nesneleri.
const queries ={
    get:<T>(url:string) => axios.get<T>(url).then((response:AxiosResponse<T>) => response.data),
    post:<T>(url:string, body:object) => axios.post<T>(url,body).then((response:AxiosResponse<T>) => response.data),
    put:<T>(url:string, body:object) => axios.put<T>(url,body).then((response:AxiosResponse<T>) => response.data),
    delete:<T>(url:string) => axios.delete<T>(url).then((response:AxiosResponse<T>) => response.data),
    //? Sayfalı listeler: gövde düz dizi, sayfa bilgisi "Pagination" header'ında (axios header adlarını küçük harfe çevirir).
    getPaged:<T>(url:string, params: URLSearchParams) => axios.get<T[]>(url, { params })
        .then((response:AxiosResponse<T[]>): PaginatedResponse<T> => ({
            items: response.data,
            metaData: JSON.parse(response.headers["pagination"]) as MetaData
        })),
}

const Errors ={
    get400Error : () => queries.get("/error/bad-request"),
    get401Error : () => queries.get("/error/unauthorized"),
    get404Error : () => queries.get("/error/not-found"),
    get500Error : () => queries.get("/error/server-error"),
    getValidationError : () => queries.get("/error/validation-error"),
}

const Catalog={
    list: (params: URLSearchParams) => queries.getPaged<IProduct>("products", params),
    details: (id:number) => queries.get<IProduct>(`products/${id}`),
    filters: () => queries.get<{ brands: string[] }>("products/filters")
}

const Cart = {
    get: () => queries.get<ICart>("cart"),
    addItem: (productId: number, quantity = 1) => queries.post<ICart>(`cart?productId=${productId}&quantity=${quantity}`,{}),
    //? Backend artık silmeden sonra da güncel CartDTO dönüyor.
    deleteItem: (productId: number, quantity = 1) =>queries.delete<ICart>(`cart?productId=${productId}&quantity=${quantity}`)
}

const Orders = {
    list: () => queries.get<Order[]>("orders"),
    details: (id: number) => queries.get<Order>(`orders/${id}`),
    create: (body: CreateOrder) => queries.post<Order>("orders", body),
}

//? Admin endpoint'leri: backend [Authorize(Roles="Admin")] ile korunuyor; Admin olmayan token'la 403 döner.
//? Ürün formu FormData olarak gidiyor: axios FormData görünce Content-Type'ı multipart/form-data (boundary ile) yapar.
const Admin = {
    products: () => queries.get<IProduct[]>("admin/products"),
    createProduct: (form: FormData) => queries.post<IProduct>("admin/products", form),
    updateProduct: (id: number, form: FormData) => queries.put<IProduct>(`admin/products/${id}`, form),
    deleteProduct: (id: number) => queries.delete<void>(`admin/products/${id}`),
    orders: () => queries.get<Order[]>("admin/orders"),
    updateOrderStatus: (id: number, status: string) => queries.put<Order>(`admin/orders/${id}/status`, { status }),
}

const Contact = {
    send: (body: { name: string; email: string; subject: string; message: string }) =>
        queries.post<{ message: string }>("contact", body),
}

const Account = {
    login: (body: { email: string; password: string }) => queries.post<User>("account/login", body),
    register: (body: { name: string; email: string; password: string }) => queries.post<void>("account/register", body),
    getUser: () => queries.get<User>("account/getUser"),
}

const requests = {
    Catalog, Errors, Cart, Account, Orders, Admin, Contact
}

export default requests