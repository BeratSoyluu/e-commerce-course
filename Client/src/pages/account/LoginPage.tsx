import { Avatar, Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate, type Location } from "react-router";
import requests from "../../api/requests";
import { useAccountContext } from "../../context/useAccountContext";
import { useCartContext } from "../../context/useCartContext";

interface LoginForm {
    email: string;
    password: string;
}

export default function LoginPage() {
    const { user, login } = useAccountContext();
    const { setCart } = useCartContext();
    const navigate = useNavigate();
    const location = useLocation();
    //? AuthGuard'dan geldiyse dönülecek adres burada
    const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/catalog";

    //? react-hook-form input'ları kontrolsüz (uncontrolled) tutar: her tuşta bileşen yeniden render olmaz.
    //? mode "onTouched": hata mesajı kullanıcı alandan çıkınca görünür, yazarken rahatsız etmez.
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({ mode: "onTouched" });

    async function onSubmit(data: LoginForm) {
        try {
            const loggedIn = await requests.Account.login(data);
            login(loggedIn);
            //? Backend login sırasında anonim sepeti hesaba taşıdı; güncel sepeti tekrar çekiyoruz.
            setCart(await requests.Cart.get());
            navigate(from, { replace: true });
        } catch (error) {
            console.log(error); //? Hata mesajını interceptor toast ile gösteriyor
        }
    }

    if(user) return <Navigate to={from} replace />;

    return (
        <Container maxWidth="xs">
            <Paper sx={{ p: 4, mt: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Avatar sx={{ mb: 1, bgcolor: "secondary.main" }}><LockOutlined /></Avatar>
                <Typography variant="h5" gutterBottom>Giriş Yap</Typography>

                {/* //! helperText boşken " " veriyoruz: hata mesajının yeri baştan ayrılır. Yoksa alandan çıkınca beliren mesaj
                    //! butonu aşağı kaydırır ve "Giriş Yap"a basan kullanıcının tıklaması boşa düşer. */}
                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: "100%" }}>
                    <TextField
                        label="E-posta" fullWidth margin="normal" autoFocus autoComplete="email"
                        {...register("email", {
                            required: "E-posta zorunlu.",
                            pattern: { value: /^\S+@\S+\.\S+$/, message: "Geçerli bir e-posta girin." }
                        })}
                        error={!!errors.email} helperText={errors.email?.message ?? " "} />
                    <TextField
                        label="Şifre" type="password" fullWidth margin="normal" autoComplete="current-password"
                        {...register("password", { required: "Şifre zorunlu." })}
                        error={!!errors.password} helperText={errors.password?.message ?? " "} />

                    <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} loading={isSubmitting}>Giriş Yap</Button>
                </Box>

                <Typography variant="body2" sx={{ mt: 2 }}>
                    Hesabınız yok mu? <Link to="/register">Kayıt olun</Link>
                </Typography>
            </Paper>
        </Container>
    );
}
