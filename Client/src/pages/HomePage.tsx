import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import { LocalShipping, Lock, Watch } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import requests from "../api/requests";
import type { IProduct } from "../model/IProduct";
import Product from "./Catalog/Product";
import { ProductGridSkeleton } from "../components/Skeletons";
import { formatPrice, FREE_DELIVERY_THRESHOLD } from "../utils/helpers";

const features = [
    { icon: <LocalShipping fontSize="large" color="secondary" />, title: "Ücretsiz Kargo", text: `${formatPrice(FREE_DELIVERY_THRESHOLD)} ve üzeri siparişlerde kargo bizden.` },
    { icon: <Lock fontSize="large" color="secondary" />, title: "Güvenli Ödeme", text: "Ödemeler iyzico altyapısıyla alınır, kart bilgileriniz saklanmaz." },
    { icon: <Watch fontSize="large" color="secondary" />, title: "Seçkin Modeller", text: "Apple ve Xiaomi'nin popüler akıllı saat modelleri tek yerde." },
];

export default function HomePage(){
    const [products, setProducts] = useState<IProduct[] | null>(null);

    useEffect(() => {
        //? Katalog endpoint'ini tekrar kullanıyoruz: "newest" sıralamasıyla ilk 4 ürün = en yeni 4 ürün
        const params = new URLSearchParams({ orderBy: "newest", pageSize: "4", pageNumber: "1" });
        requests.Catalog.list(params)
            .then(data => setProducts(data.items))
            .catch(error => {
                console.log(error);
                setProducts([]);
            });
    }, []);

    return(
        <>
            {/* //? Hero: sayfanın en üstündeki büyük tanıtım alanı */}
            <Paper sx={{
                p: { xs: 4, md: 8 }, mb: 6, color: "white", textAlign: "center",
                background: theme => `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.main})`
            }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
                    Akıllı saatte doğru adres
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                    Sağlığını takip et, bildirimlerini kaçırma, tarzını tamamla.
                </Typography>
                <Button component={Link} to="/catalog" variant="contained" color="secondary" size="large">Kataloğa Göz At</Button>
            </Paper>

            <Typography variant="h4" component="h2" gutterBottom>Yeni Ürünler</Typography>
            {!products
                ? <ProductGridSkeleton count={4} size={{ xs: 12, sm: 6, md: 3 }} />
                : (
                    <Grid container spacing={2}>
                        {products.map(p => (
                            <Grid key={p.id} size={{ xs: 12, sm: 6, md: 3 }}>
                                <Product product={p} />
                            </Grid>
                        ))}
                    </Grid>
                )}

            <Grid container spacing={3} sx={{ mt: 6, mb: 4 }}>
                {features.map(f => (
                    <Grid key={f.title} size={{ xs: 12, md: 4 }}>
                        <Box sx={{ textAlign: "center", px: 2 }}>
                            {f.icon}
                            <Typography variant="h6" gutterBottom>{f.title}</Typography>
                            <Typography color="text.secondary">{f.text}</Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </>
    );
}
