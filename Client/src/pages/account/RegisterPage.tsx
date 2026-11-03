import { Avatar, Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import { PersonAddOutlined } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";
import { toast } from "react-toastify";
import requests from "../../api/requests";
import { useAccountContext } from "../../context/useAccountContext";

interface RegisterForm {
    name: string;
    email: string;
    password: string;
}

export default function RegisterPage() {
    const { user } = useAccountContext();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({ mode: "onTouched" });

    async function onSubmit(data: RegisterForm) {
        try {
            await requests.Account.register(data);
            toast.success("Kayıt başarılı, giriş yapabilirsiniz.");
            navigate("/login");
        } catch (error) {
            console.log(error); //? Sunucu doğrulama hataları (ör. e-posta kayıtlı) interceptor'da toast olarak gösteriliyor
        }
    }

    if(user) return <Navigate to="/" replace />;

    return (
        <Container maxWidth="xs">
            <Paper sx={{ p: 4, mt: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Avatar sx={{ mb: 1, bgcolor: "secondary.main" }}><PersonAddOutlined /></Avatar>
                <Typography variant="h5" gutterBottom>Kayıt Ol</Typography>

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: "100%" }}>
                    <TextField
                        label="Ad Soyad" fullWidth margin="normal" autoFocus autoComplete="name"
                        {...register("name", { required: "Ad soyad zorunlu." })}
                        error={!!errors.name} helperText={errors.name?.message ?? " "} />
                    <TextField
                        label="E-posta" fullWidth margin="normal" autoComplete="email"
                        {...register("email", {
                            required: "E-posta zorunlu.",
                            pattern: { value: /^\S+@\S+\.\S+$/, message: "Geçerli bir e-posta girin." }
                        })}
                        error={!!errors.email} helperText={errors.email?.message ?? " "} />
                    <TextField
                        label="Şifre" type="password" fullWidth margin="normal" autoComplete="new-password"
                        //! Kurallar backend'deki Identity ayarlarıyla aynı; frontend kontrolü sadece kolaylık, asıl kontrol sunucuda.
                        {...register("password", {
                            required: "Şifre zorunlu.",
                            minLength: { value: 6, message: "Şifre en az 6 karakter olmalı." },
                            pattern: {
                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                                message: "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermeli."
                            }
                        })}
                        error={!!errors.password} helperText={errors.password?.message ?? " "} />

                    <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} loading={isSubmitting}>Kayıt Ol</Button>
                </Box>

                <Typography variant="body2" sx={{ mt: 2 }}>
                    Zaten hesabınız var mı? <Link to="/login">Giriş yapın</Link>
                </Typography>
            </Paper>
        </Container>
    );
}
