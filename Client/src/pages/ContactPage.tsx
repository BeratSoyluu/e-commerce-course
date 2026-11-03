import { Box, Button, Grid, Paper, TextField, Typography } from "@mui/material";
import { Email, Schedule } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import requests from "../api/requests";
import { useAccountContext } from "../context/useAccountContext";

interface ContactForm {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export default function ContactPage(){
    const { user } = useAccountContext();
    //? Giriş yapmış kullanıcının adı ve e-postası hazır gelsin
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactForm>({
        mode: "onTouched",
        defaultValues: { name: user?.name ?? "", email: user?.email ?? "", subject: "", message: "" }
    });

    async function onSubmit(data: ContactForm) {
        try {
            const result = await requests.Contact.send(data);
            toast.success(result.message);
            //? Gönderildikten sonra konu ve mesaj temizlenir; ad/e-posta bir sonraki mesaj için kalsın
            reset({ ...data, subject: "", message: "" });
        } catch (error) {
            console.log(error); //? Sunucu doğrulama hataları interceptor'da toast olarak gösteriliyor
        }
    }

    return(
        <>
            <Typography variant="h3" component="h1" gutterBottom>İletişim</Typography>
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Bize ulaşın</Typography>
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                            Sipariş, ürün ya da iade ile ilgili sorularınız için formu doldurun; en kısa sürede dönüş yapalım.
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, mb: 1 }}><Email color="secondary" /> destek@eticaret.test</Box>
                        <Box sx={{ display: "flex", gap: 1 }}><Schedule color="secondary" /> Hafta içi 09:00 - 18:00</Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3 }}>
                        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField label="Ad Soyad" fullWidth autoComplete="name"
                                        {...register("name", { required: "Ad soyad zorunlu." })}
                                        error={!!errors.name} helperText={errors.name?.message ?? " "} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField label="E-posta" fullWidth autoComplete="email"
                                        {...register("email", {
                                            required: "E-posta zorunlu.",
                                            pattern: { value: /^\S+@\S+\.\S+$/, message: "Geçerli bir e-posta girin." }
                                        })}
                                        error={!!errors.email} helperText={errors.email?.message ?? " "} />
                                </Grid>
                                <Grid size={12}>
                                    <TextField label="Konu" fullWidth
                                        {...register("subject", { required: "Konu zorunlu." })}
                                        error={!!errors.subject} helperText={errors.subject?.message ?? " "} />
                                </Grid>
                                <Grid size={12}>
                                    <TextField label="Mesaj" fullWidth multiline minRows={5}
                                        {...register("message", {
                                            required: "Mesaj zorunlu.",
                                            //! Backend'deki CreateContactMessageDTO ile aynı sınırlar
                                            minLength: { value: 10, message: "Mesaj en az 10 karakter olmalı." },
                                            maxLength: { value: 2000, message: "Mesaj en fazla 2000 karakter olabilir." }
                                        })}
                                        error={!!errors.message} helperText={errors.message?.message ?? " "} />
                                </Grid>
                            </Grid>
                            <Button type="submit" variant="contained" loading={isSubmitting}>Gönder</Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
}
