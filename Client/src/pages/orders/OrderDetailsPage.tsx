import { Box, Button, Chip, CircularProgress, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import requests from "../../api/requests";
import type { Order } from "../../model/IOrder";
import { formatDate, formatPrice, getImageUrl, KDV_RATE, orderStatusLabels } from "../../utils/helpers";
import NotFound from "../NotFound";

export default function OrderDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!id) return;
        requests.Orders.details(parseInt(id))
            .then(data => setOrder(data))
            .catch(error => console.log(error))
            .finally(() => setLoading(false));
    }, [id]);

    if(loading) return <CircularProgress />;
    if(!order) return <NotFound />;

    const status = orderStatusLabels[order.orderStatus];

    return (
        <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Typography variant="h4">Sipariş #{order.id}</Typography>
                <Chip label={status.label} color={status.color} />
            </Box>
            <Typography color="text.secondary" gutterBottom>{formatDate(order.orderDate)}</Typography>

            <Grid container spacing={4} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell>Ürün</TableCell>
                                    <TableCell align="right">Fiyat</TableCell>
                                    <TableCell align="right">Adet</TableCell>
                                    <TableCell align="right">Toplam</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {order.orderItems.map(item => (
                                    <TableRow key={item.productId}>
                                        <TableCell><img src={getImageUrl(item.productImage)} style={{ height: 50 }} /></TableCell>
                                        <TableCell>{item.productName}</TableCell>
                                        <TableCell align="right">{formatPrice(item.price)}</TableCell>
                                        <TableCell align="right">{item.quantity}</TableCell>
                                        <TableCell align="right">{formatPrice(item.price * item.quantity)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>Teslimat Adresi</Typography>
                        <Typography>{order.firstName} {order.lastName}</Typography>
                        <Typography>{order.phone}</Typography>
                        <Typography>{order.addressLine}</Typography>
                        <Typography>{order.city}</Typography>
                    </Paper>
                    {/* //? Tutarlar sunucudan geliyor (sipariş anındaki değerler); burada yeniden hesaplanmıyor. */}
                    <Paper sx={{ p: 2 }}>
                        <Typography>Ara Toplam: {formatPrice(order.subTotal)}</Typography>
                        <Typography>Kargo: {order.deliveryFee === 0 ? "Ücretsiz" : formatPrice(order.deliveryFee)}</Typography>
                        <Typography sx={{ fontWeight: "bold", mt: 1 }}>Toplam (KDV dahil): {formatPrice(order.total)}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            İçindeki KDV (%{KDV_RATE}): {formatPrice(order.total * KDV_RATE / (100 + KDV_RATE))}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Button component={Link} to="/orders" sx={{ mt: 3 }}>← Siparişlerim</Button>
        </>
    );
}
