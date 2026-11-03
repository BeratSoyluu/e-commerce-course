//? Sondaki "/" karakterlerini siliyoruz ki .env'de "http://localhost:5274/" yazılsa bile "//api" gibi çift slash oluşmasın.
export const API_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, "");

export function getImageUrl(fileName?: string) {
    return `${API_URL}/images/${fileName}`;
}

//? KDV oranı yüzde olarak (20 = %20). Ondalık (0.2) yerine tam sayı tutuyoruz ki ekranda "%20" yazarken kayan nokta hatası çıkmasın.
export const KDV_RATE = 20;

//! Kargo kuralı backend'deki Order.CalculateDeliveryFee ile aynı olmalı. Burası sadece gösterim içindir,
//! siparişteki gerçek kargo ücretini sunucu hesaplar.
export const FREE_DELIVERY_THRESHOLD = 5000;
export const DELIVERY_FEE = 150;

export function calculateDeliveryFee(subTotal: number) {
    return subTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

//? Luhn algoritması: kart numarasının son hanesi kontrol hanesidir. Yanlış yazılan numarayı sunucuya gitmeden yakalar.
//! Bu sadece yazım hatası kontrolü; kartın geçerli/limitli olduğunu sadece ödeme sağlayıcısı bilir.
export function isValidCardNumber(value: string) {
    const digits = value.replace(/\s/g, "");
    if(!/^\d{15,16}$/.test(digits)) return false;

    let sum = 0;
    for(let i = 0; i < digits.length; i++) {
        let digit = Number(digits[digits.length - 1 - i]);
        if(i % 2 === 1) {
            digit *= 2;
            if(digit > 9) digit -= 9;
        }
        sum += digit;
    }
    return sum % 10 === 0;
}

const dateFormatter = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" });

export function formatDate(value: string) {
    return dateFormatter.format(new Date(value));
}

export const orderStatusLabels: Record<string, { label: string; color: "default" | "success" | "error" | "info" }> = {
    Pending: { label: "Beklemede", color: "default" },
    Approved: { label: "Onaylandı", color: "info" },
    PaymentFailed: { label: "Ödeme başarısız", color: "error" },
    Completed: { label: "Tamamlandı", color: "success" },
};

//? Formatter'ı bir kez oluşturup tekrar kullanıyoruz. Her render'da new Intl.NumberFormat çağırmak gereksiz maliyet.
const priceFormatter = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatPrice(value: number) {
    return `${priceFormatter.format(value)} ₺`;
}
