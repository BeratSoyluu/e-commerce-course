import { Alert, Grid, TextField } from "@mui/material";
import { useFormContext } from "react-hook-form";
import type { CheckoutForm } from "./CheckoutPage";
import { isValidCardNumber } from "../../utils/helpers";

export default function PaymentForm() {
    const { register, getValues, formState: { errors } } = useFormContext<CheckoutForm>();

    //? Son kullanma tarihi ay + yıl birlikte kontrol edilir: 12/2025 Kasım 2026'da geçmiştir.
    function isNotExpired(year: string) {
        const month = Number(getValues("expireMonth"));
        const now = new Date();
        const current = now.getFullYear() * 12 + now.getMonth() + 1;
        return Number(year) * 12 + month >= current || "Kartın süresi dolmuş.";
    }

    return (
        <>
            {/* //! Kart bilgileri state'e, localStorage'a ya da loglara yazılmıyor; sadece sipariş isteğiyle iyzico'ya gider. */}
            <Alert severity="info" sx={{ mb: 3 }}>Kart bilgileriniz saklanmaz, ödeme iyzico üzerinden alınır.</Alert>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Kart Üzerindeki İsim" fullWidth autoComplete="cc-name"
                        {...register("cardHolderName", { required: "Kart üzerindeki isim zorunlu." })}
                        error={!!errors.cardHolderName} helperText={errors.cardHolderName?.message ?? " "} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Kart Numarası" fullWidth autoComplete="cc-number"
                        slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 19 } }}
                        {...register("cardNumber", {
                            required: "Kart numarası zorunlu.",
                            validate: value => isValidCardNumber(value) || "Geçerli bir kart numarası girin."
                        })}
                        error={!!errors.cardNumber} helperText={errors.cardNumber?.message ?? " "} />
                </Grid>
                <Grid size={{ xs: 4 }}>
                    <TextField label="Ay (AA)" fullWidth autoComplete="cc-exp-month" placeholder="12"
                        slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 2 } }}
                        {...register("expireMonth", {
                            required: "Ay zorunlu.",
                            pattern: { value: /^(0[1-9]|1[0-2])$/, message: "01-12 arası." }
                        })}
                        error={!!errors.expireMonth} helperText={errors.expireMonth?.message ?? " "} />
                </Grid>
                <Grid size={{ xs: 4 }}>
                    <TextField label="Yıl (YYYY)" fullWidth autoComplete="cc-exp-year" placeholder="2030"
                        slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 4 } }}
                        {...register("expireYear", {
                            required: "Yıl zorunlu.",
                            pattern: { value: /^20\d{2}$/, message: "4 haneli yıl." },
                            validate: isNotExpired
                        })}
                        error={!!errors.expireYear} helperText={errors.expireYear?.message ?? " "} />
                </Grid>
                <Grid size={{ xs: 4 }}>
                    <TextField label="CVC" fullWidth type="password" autoComplete="cc-csc"
                        slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 4 } }}
                        {...register("cvc", {
                            required: "CVC zorunlu.",
                            pattern: { value: /^\d{3,4}$/, message: "3-4 hane." }
                        })}
                        error={!!errors.cvc} helperText={errors.cvc?.message ?? " "} />
                </Grid>
            </Grid>
        </>
    );
}
