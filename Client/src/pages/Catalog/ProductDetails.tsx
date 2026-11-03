import { Button, CircularProgress, Divider, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Typography} from "@mui/material";
import { AddShoppingCart } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { IProduct } from "../../model/IProduct";
import requests from "../../api/requests";
import NotFound from "../NotFound";
import { useCartContext } from "../../context/useCartContext";
import { formatPrice, getImageUrl } from "../../utils/helpers";

export default function ProductDetailsPage(){

    const {id} = useParams<{id:string}>();
    const [product, setProduct] = useState<IProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const { cart, setCart } = useCartContext();
    //? null = kullanıcı adedi henüz değiştirmedi, o zaman sepetteki adedi gösteriyoruz.
    //? Böylece sepet adedini state'e kopyalamak için ayrı bir useEffect yazmamız gerekmiyor.
    const [quantity, setQuantity] = useState<number | null>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(()=>{
        //? "id && ..." yerine açık if: lint kuralı (no-unused-expressions) sonucu kullanılmayan ifadeye izin vermiyor.
        if(!id) return;
        requests.Catalog.details(parseInt(id))
        .then (data =>{
            setProduct(data);
            setQuantity(null); //? başka bir ürüne geçildiyse önceki ürünün seçimi taşınmasın
        })
        .catch(error => console.log(error))
        .finally(() => setLoading(false));
    },[id]);

    if(loading) return <CircularProgress />
    if(!product) return <NotFound />;

    //? Sepet context'ten geliyor; App sepeti yüklemeden sayfayı göstermediği için burada güncel.
    const item = cart?.cartItems.find(i => i.productId === product.id);
    const quantityInCart = item?.quantity ?? 0;
    const stock = product.stock ?? 0;
    //? Ürün sepetteyse 0 seçilebilir (= sepetten çıkar). Sepette değilse en az 1 eklenebilir.
    const minQuantity = item ? 0 : 1;
    const selectedQuantity = quantity ?? (item ? quantityInCart : 1);
    const canBuy = product.isActive && stock > 0;

    function handleQuantityChange(value: string){
        const parsed = parseInt(value);
        if(isNaN(parsed)) return;
        //? Elle yazılan değeri de min-stok aralığına sıkıştırıyoruz; input'taki min/max sadece okları sınırlar.
        setQuantity(Math.min(Math.max(parsed, minQuantity), stock));
    }

    function handleUpdateCart(){
        if(!product) return;
        //? Sunucuya hedef adedi değil, aradaki farkı gönderiyoruz: API "şu kadar ekle / şu kadar çıkar" şeklinde çalışıyor.
        const diff = selectedQuantity - quantityInCart;
        if(diff === 0) return;

        setUpdating(true);
        const request = diff > 0
            ? requests.Cart.addItem(product.id, diff)
            : requests.Cart.deleteItem(product.id, -diff);

        request
            .then(cart => {
                setCart(cart);
                setQuantity(null); //? seçim sıfırlanır, artık sunucudan gelen sepet adedi gösterilir
            })
            .catch(error => console.log(error))
            .finally(() => setUpdating(false));
    }

    return(
        <Grid container spacing={6}>
            <Grid size={{lg:4, md:5, sm:6, xs:12}}>
                <img src={getImageUrl(product.imageUrl)} style={{width:"80%"}} />
            </Grid>
            <Grid size={{lg:8, md:7, sm:6, xs:12}}>
                <Typography variant="h3">{product.name}</Typography>
                <Divider sx={{mb:2}} />
                <Typography variant="h4" color="secondary">{formatPrice(product.price)}</Typography>
                <TableContainer>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>{product.name}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Decription</TableCell>
                                <TableCell>{product.description}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Stock</TableCell>
                                <TableCell>{product.stock}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                <Stack direction="row" spacing={2} sx={{ mt: 3, alignItems: "center" }}>
                    <TextField
                        type="number"
                        label="Adet"
                        value={selectedQuantity}
                        disabled={!canBuy}
                        onChange={e => handleQuantityChange(e.target.value)}
                        slotProps={{ htmlInput: { min: minQuantity, max: stock } }}
                        sx={{ width: 120 }}
                    />
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<AddShoppingCart />}
                        loadingPosition="start"
                        loading={updating}
                        //! Adet sepettekiyle aynıysa gönderilecek bir değişiklik yok, butonu kapatıyoruz.
                        disabled={!canBuy || selectedQuantity === quantityInCart}
                        onClick={handleUpdateCart}>
                        {item ? "Sepeti Güncelle" : "Sepete Ekle"}
                    </Button>
                </Stack>

                {!product.isActive && <Typography color="error" sx={{ mt: 1 }}>Bu ürün şu an satışta değil.</Typography>}
                {product.isActive && stock === 0 && <Typography color="error" sx={{ mt: 1 }}>Stokta yok.</Typography>}
                {item && <Typography color="text.secondary" sx={{ mt: 1 }}>Sepetinizde {quantityInCart} adet var.</Typography>}
            </Grid>
        </Grid>
    );
}
