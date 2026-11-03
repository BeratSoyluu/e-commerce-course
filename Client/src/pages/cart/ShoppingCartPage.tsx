import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { AddCircleOutlineOutlined, Delete, RemoveCircleOutlineOutlined, RemoveShoppingCart } from "@mui/icons-material";
import { Link } from "react-router";
import { useCartContext } from "../../context/useCartContext";
import { useState } from "react";
import requests from "../../api/requests";
import { formatPrice, getImageUrl } from "../../utils/helpers";
import CartSummary from "./CartSummary";

export default function ShoppingCartPage()
{
    const { cart, setCart } = useCartContext();
    //? Tek bir boolean yerine "hangi buton yükleniyor" bilgisini de tutuyoruz.
    //? id örnekleri: "add3", "remove3", "delete3" -> aynı satırdaki 3 butonu da birbirinden ayırır.
    const [status, setStatus] = useState({ loading: false, id: "" });

    function handleAddItem(productId: number, id: string){
        setStatus({ loading: true, id });
        requests.Cart.addItem(productId)
            .then(cart => setCart(cart))
            .catch(error => console.log(error))
            .finally(() => setStatus({ loading: false, id: "" }));
    }

    function handleDeleteItem(productId: number, id: string, quantity = 1){
        setStatus({ loading: true, id });
        requests.Cart.deleteItem(productId, quantity)
            //? Sunucu güncel sepeti dönüyor, onu olduğu gibi state'e yazıyoruz (tek doğruluk kaynağı sunucu).
            .then(cart => setCart(cart))
            .catch(error => console.log(error))
            //! finally olmazsa istek hata verdiğinde loading hiç false olmaz ve buton sonsuza kadar döner.
            .finally(() => setStatus({ loading: false, id: "" }));
    }

    //? Backend boş sepette de { cartItems: [] } dönüyor, bu yüzden sadece null kontrolü yetmez.
    if(!cart || cart.cartItems.length === 0) {
        return (
            <Paper sx={{ p: 6, textAlign: "center" }}>
                <RemoveShoppingCart sx={{ fontSize: 64 }} color="disabled" />
                <Typography variant="h5" gutterBottom>Sepetiniz boş</Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Beğendiğiniz ürünleri sepete ekleyerek alışverişe başlayabilirsiniz.
                </Typography>
                <Button component={Link} to="/catalog" variant="contained">Alışverişe Başla</Button>
            </Paper>
        );
    }

    return (
        <>
        <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell align="right">Fiyat</TableCell>
              <TableCell align="right">Adet</TableCell>
              <TableCell align="right">Toplam</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cart.cartItems.map((item) => (
              <TableRow
                key={item.productId}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                 <TableCell component="th" scope="row">
                  <img src={getImageUrl(item.imageUrl)} style={{height: 60}}/>
                </TableCell>
                <TableCell component="th" scope="row">
                  {item.name}
                </TableCell>
                <TableCell align="right">{formatPrice(item.price)}</TableCell>
                <TableCell align="right">
                    {/* //? MUI v9'da Button'un kendi loading prop'u var, @mui/lab'a gerek kalmadı. */}
                    <Button
                        loading={status.loading && status.id === "add" + item.productId}
                        onClick={() => handleAddItem(item.productId, "add" + item.productId)}>
                        <AddCircleOutlineOutlined />
                    </Button>

                    {item.quantity}

                    <Button
                        loading={status.loading && status.id === "remove" + item.productId}
                        onClick={() => handleDeleteItem(item.productId, "remove" + item.productId)}>
                        <RemoveCircleOutlineOutlined />
                    </Button>
                    </TableCell>
                <TableCell align="right">{formatPrice(item.price * item.quantity)}</TableCell>
                <TableCell align="right">
                    <Button
                        color="error"
                        loading={status.loading && status.id === "delete" + item.productId}
                        onClick={() => handleDeleteItem(item.productId, "delete" + item.productId, item.quantity)}>
                        <Delete />
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", mt: 2, gap: 2 }}>
        <CartSummary cartItems={cart.cartItems} />
        {/* //? Giriş yapılmamışsa /checkout'taki AuthGuard login'e gönderir, girişten sonra buraya geri döner. */}
        <Button component={Link} to="/checkout" variant="contained" size="large">Siparişi Tamamla</Button>
      </Box>
      </>
    );
}
