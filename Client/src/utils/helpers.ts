//? Sondaki "/" karakterlerini siliyoruz ki .env'de "http://localhost:5274/" yazılsa bile "//api" gibi çift slash oluşmasın.
export const API_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, "");

export function getImageUrl(fileName?: string) {
    return `${API_URL}/images/${fileName}`;
}

//? KDV oranı yüzde olarak (20 = %20). Ondalık (0.2) yerine tam sayı tutuyoruz ki ekranda "%20" yazarken kayan nokta hatası çıkmasın.
export const KDV_RATE = 20;

//? Formatter'ı bir kez oluşturup tekrar kullanıyoruz. Her render'da new Intl.NumberFormat çağırmak gereksiz maliyet.
const priceFormatter = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatPrice(value: number) {
    return `${priceFormatter.format(value)} ₺`;
}
