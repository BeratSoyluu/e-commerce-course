import { Button, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { TableSkeleton } from "../../components/Skeletons";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import requests from "../../api/requests";
import type { Order } from "../../model/IOrder";
import { formatDate, formatPrice, orderStatusLabels } from "../../utils/helpers";

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[] | null>(null);

    useEffect(() => {
        requests.Orders.list()
            .then(data => setOrders(data))
            .catch(error => {
                console.log(error);
                setOrders([]);
            });
    }, []);

    if(!orders) return <TableSkeleton />;

    if(orders.length === 0) {
        return (
            <Paper sx={{ p: 6, textAlign: "center" }}>
                <Typography variant="h5" gutterBottom>Henüz siparişiniz yok</Typography>
                <Button component={Link} to="/catalog" variant="contained">Alışverişe Başla</Button>
            </Paper>
        );
    }

    return (
        <>
            <Typography variant="h4" gutterBottom>Siparişlerim</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Sipariş No</TableCell>
                            <TableCell>Tarih</TableCell>
                            <TableCell align="right">Toplam</TableCell>
                            <TableCell>Durum</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map(order => {
                            const status = orderStatusLabels[order.orderStatus];
                            return (
                                <TableRow key={order.id}>
                                    <TableCell>#{order.id}</TableCell>
                                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                                    <TableCell align="right">{formatPrice(order.total)}</TableCell>
                                    <TableCell><Chip size="small" label={status.label} color={status.color} /></TableCell>
                                    <TableCell align="right">
                                        <Button component={Link} to={`/orders/${order.id}`} size="small">Detay</Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}
