import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, Switch, TextField, Typography } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { IProduct } from "../../model/IProduct";
import requests from "../../api/requests";
import { getImageUrl } from "../../utils/helpers";

interface ProductForm {
    name: string;
    description: string;
    brand: string;
    price: number;
    stock: number;
    isActive: boolean;
    image: FileList | null;
}

interface Props {
    product: IProduct | null; //? null = yeni ürün
    onClose: () => void;
    onSaved: () => void;
}

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProductFormDialog({ product, onClose, onSaved }: Props) {
    const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<ProductForm>({
        mode: "onTouched",
        defaultValues: {
            name: product?.name ?? "",
            description: product?.description ?? "",
            brand: product?.brand ?? "",
            price: product?.price ?? 0,
            stock: product?.stock ?? 0,
            isActive: product?.isActive ?? true,
            image: null,
        }
    });

    //? useWatch: sadece görsel alanı değişince bu bileşen yeniden render olur (watch() tüm formu izlerdi).
    const files = useWatch({ control, name: "image" });
    const file = files?.[0];
    //? Seçilen dosya henüz sunucuda değil; tarayıcı belleğindeki dosya için geçici bir URL üretip önizleme gösteriyoruz.
    const preview = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);
    //! createObjectURL ile üretilen URL elle serbest bırakılmazsa dosya sayfa kapanana kadar bellekte kalır.
    useEffect(() => () => { if(preview) URL.revokeObjectURL(preview); }, [preview]);

    async function onSubmit(data: ProductForm) {
        //? Backend [FromForm] bekliyor; alan adları ProductFormDTO ile aynı.
        const form = new FormData();
        form.append("name", data.name);
        form.append("description", data.description);
        form.append("brand", data.brand);
        //! Fiyat her zaman noktalı gönderilir ("1234.5"); sunucu da invariant kültürle okur (Program.cs).
        form.append("price", String(data.price));
        form.append("stock", String(data.stock));
        form.append("isActive", String(data.isActive));
        if(data.image?.[0]) form.append("image", data.image[0]);

        try {
            if(product) await requests.Admin.updateProduct(product.id, form);
            else await requests.Admin.createProduct(form);
            onSaved();
        } catch (error) {
            console.log(error); //? Hata mesajı interceptor'da toast olarak gösteriliyor
        }
    }

    const currentImage = preview ?? (product?.imageUrl ? getImageUrl(product.imageUrl) : null);

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{product ? "Ürünü Düzenle" : "Yeni Ürün"}</DialogTitle>
            <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <TextField label="Ürün Adı" fullWidth margin="dense"
                                {...register("name", { required: "Ürün adı zorunlu." })}
                                error={!!errors.name} helperText={errors.name?.message ?? " "} />
                            <TextField label="Marka" fullWidth margin="dense" {...register("brand")} helperText=" " />
                            <TextField label="Açıklama" fullWidth margin="dense" multiline minRows={3} {...register("description")} helperText=" " />
                            <Grid container spacing={2}>
                                <Grid size={6}>
                                    <TextField label="Fiyat (₺)" type="number" fullWidth margin="dense"
                                        slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
                                        //? valueAsNumber: input metin döndürür, form değerini sayıya çeviriyoruz
                                        {...register("price", { valueAsNumber: true, min: { value: 0.01, message: "Fiyat 0'dan büyük olmalı." } })}
                                        error={!!errors.price} helperText={errors.price?.message ?? " "} />
                                </Grid>
                                <Grid size={6}>
                                    <TextField label="Stok" type="number" fullWidth margin="dense"
                                        slotProps={{ htmlInput: { min: 0 } }}
                                        {...register("stock", { valueAsNumber: true, min: { value: 0, message: "Stok negatif olamaz." } })}
                                        error={!!errors.stock} helperText={errors.stock?.message ?? " "} />
                                </Grid>
                            </Grid>
                            {/* //? Switch kontrollü bir bileşen; Controller ile react-hook-form'a bağlıyoruz */}
                            <Controller name="isActive" control={control} render={({ field }) => (
                                <FormControlLabel label="Satışta" control={
                                    <Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />
                                } />
                            )} />
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1, height: 200, display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
                                {currentImage
                                    ? <img src={currentImage} alt="Önizleme" style={{ maxHeight: "100%", maxWidth: "100%" }} />
                                    : <Typography color="text.secondary">Görsel yok</Typography>}
                            </Box>
                            <Button component="label" variant="outlined" fullWidth startIcon={<CloudUpload />}>
                                Görsel Seç
                                <input type="file" hidden accept={ALLOWED_TYPES.join(",")} aria-label="Görsel dosyası"
                                    {...register("image", {
                                        //! Yeni üründe görsel zorunlu; düzenlemede seçilmezse eski görsel kalır
                                        validate: {
                                            required: list => !!product || !!list?.[0] || "Ürün görseli zorunlu.",
                                            type: list => !list?.[0] || ALLOWED_TYPES.includes(list[0].type) || "Sadece JPG, PNG veya WEBP.",
                                            size: list => !list?.[0] || list[0].size <= MAX_SIZE || "Görsel en fazla 2 MB olabilir.",
                                        }
                                    })} />
                            </Button>
                            <Typography variant="caption" color={errors.image ? "error" : "text.secondary"}>
                                {errors.image?.message ?? "JPG, PNG veya WEBP, en fazla 2 MB"}
                            </Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Vazgeç</Button>
                    <Button type="submit" variant="contained" loading={isSubmitting}>Kaydet</Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
