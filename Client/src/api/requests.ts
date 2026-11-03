import axios, { AxiosError, type AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { router } from "../router/Routes";
import { API_URL } from "../utils/helpers";
import type { IProduct } from "../model/IProduct";
//? Aşağıdaki "const Cart" ile isim çakışmasın diye tipi ICart adıyla alıyoruz.
import type { Cart as ICart } from "../model/ICart";

//? Adres resimlerle aynı .env değişkeninden geliyor; port değişirse tek bir yeri güncellemek yeterli.
axios.defaults.baseURL=`${API_URL}/api/`;
axios.defaults.withCredentials = true;

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
            toast.error(data.title);
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
}

const Errors ={
    get400Error : () => queries.get("/error/bad-request"),
    get401Error : () => queries.get("/error/unauthorized"),
    get404Error : () => queries.get("/error/not-found"),
    get500Error : () => queries.get("/error/server-error"),
    getValidationError : () => queries.get("/error/validation-error"),
}

const Catalog={
    list: () => queries.get<IProduct[]>("products"),
    details: (id:number) => queries.get<IProduct>(`products/${id}`)
}

const Cart = {
    get: () => queries.get<ICart>("cart"),
    addItem: (productId: number, quantity = 1) => queries.post<ICart>(`cart?productId=${productId}&quantity=${quantity}`,{}),
    //? Backend artık silmeden sonra da güncel CartDTO dönüyor.
    deleteItem: (productId: number, quantity = 1) =>queries.delete<ICart>(`cart?productId=${productId}&quantity=${quantity}`)
}

const requests = {
    Catalog, Errors, Cart
}

export default requests