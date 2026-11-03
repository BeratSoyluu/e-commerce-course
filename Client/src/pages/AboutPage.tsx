import { Grid, Paper, Typography } from "@mui/material";

const values = [
    { title: "Şeffaf fiyat", text: "Gördüğünüz fiyata KDV dahildir; sepette sürpriz ek ücret çıkmaz." },
    { title: "Güvenli alışveriş", text: "Ödemeler iyzico üzerinden alınır. Kart bilgileriniz bizim sistemimizde saklanmaz." },
    { title: "Kolay takip", text: "Hesabınızdan tüm siparişlerinizi ve durumlarını anlık olarak görebilirsiniz." },
];

export default function AboutPage(){
    return(
        <>
            <Typography variant="h3" component="h1" gutterBottom>Hakkımızda</Typography>
            <Typography variant="body1" sx={{ mb: 2, maxWidth: 800 }}>
                E-Commerce, akıllı saat meraklıları için kurulmuş bir çevrim içi mağazadır. Apple ve Xiaomi başta olmak üzere
                popüler markaların güncel modellerini tek bir yerde topluyor, karşılaştırmayı ve satın almayı kolaylaştırıyoruz.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, maxWidth: 800 }}>
                Amacımız; doğru ürünü hızlıca bulabileceğiniz, ödemenizi güvenle yapabileceğiniz ve siparişinizi kolayca
                takip edebileceğiniz sade bir alışveriş deneyimi sunmak.
            </Typography>

            <Grid container spacing={3}>
                {values.map(v => (
                    <Grid key={v.title} size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3, height: "100%" }}>
                            <Typography variant="h6" gutterBottom>{v.title}</Typography>
                            <Typography color="text.secondary">{v.text}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </>
    );
}
