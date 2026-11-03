import { Grid, TextField } from "@mui/material";
import { useFormContext } from "react-hook-form";
import type { CheckoutForm } from "./CheckoutPage";

//? useFormContext: form CheckoutPage'de tek bir useForm ile oluşturuldu, adımlar aynı form state'ini paylaşıyor.
//? Kullanıcı geri dönünce girdiği bilgiler kaybolmuyor.
export default function AddressForm() {
    const { register, formState: { errors } } = useFormContext<CheckoutForm>();

    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Ad" fullWidth autoComplete="given-name"
                    {...register("firstName", { required: "Ad zorunlu." })}
                    error={!!errors.firstName} helperText={errors.firstName?.message ?? " "} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Soyad" fullWidth autoComplete="family-name"
                    {...register("lastName", { required: "Soyad zorunlu." })}
                    error={!!errors.lastName} helperText={errors.lastName?.message ?? " "} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Telefon" fullWidth autoComplete="tel" placeholder="05XXXXXXXXX"
                    {...register("phone", {
                        required: "Telefon zorunlu.",
                        //! Backend'deki CreateOrderDTO ile aynı kural
                        pattern: { value: /^0?5\d{9}$/, message: "Telefon 05XXXXXXXXX biçiminde olmalı." }
                    })}
                    error={!!errors.phone} helperText={errors.phone?.message ?? " "} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Şehir" fullWidth autoComplete="address-level1"
                    {...register("city", { required: "Şehir zorunlu." })}
                    error={!!errors.city} helperText={errors.city?.message ?? " "} />
            </Grid>
            <Grid size={12}>
                <TextField label="Adres" fullWidth multiline minRows={2} autoComplete="street-address"
                    {...register("addressLine", {
                        required: "Adres zorunlu.",
                        minLength: { value: 10, message: "Adres en az 10 karakter olmalı." }
                    })}
                    error={!!errors.addressLine} helperText={errors.addressLine?.message ?? " "} />
            </Grid>
        </Grid>
    );
}
