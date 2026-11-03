import { MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { TableSkeleton } from "../../components/Skeletons";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import requests from "../../api/requests";
import type { Order, OrderStatus } from "../../model/IOrder";
import { formatDate, formatPrice, orderStatusLabels } from "../../utils/helpers";

const statuses = Object.keys(orderStatusLabels) as OrderStatus[];

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[] | null>(null);

    useEffect(() => {
        requests.Admin.orders()
            .then(data => setOrders(data))
            .catch(error => console.log(error));
    }, []);

    async function handleStatusChange(order: Order, status: OrderStatus) {
        try {
            const updated = await requests.Admin.updateOrderStatus(order.id, status);
            //? Tüm listeyi tekrar çekmek yerine sadece değişen siparişi güncel haliyle değiştiriyoruz (immutable map)
            setOrders(prev => prev?.map(o => o.id === updated.id ? updated : o) ?? null);
            toast.success(`#${order.id} siparişi "${orderStatusLabels[status].label}" yapıldı.`);
        } catch (error) {
            console.log(error); //? Ör. ödemesi başarısız siparişte backend 400 dönüyor, interceptor toast'lıyor
        }
    }

    if(!orders) return <TableSkeleton columns={6} />;

    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Sipariş</TableCell>
                        <TableCell>Tarih</TableCell>
                        <TableCell>Müşteri</TableCell>
                        <TableCell>Teslimat</TableCell>
                        <TableCell align="right">Toplam</TableCell>
                        <TableCell>Durum</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders.map(order => (
                        <TableRow key={order.id}>
                            <TableCell>#{order.id}</TableCell>
                            <TableCell>{formatDate(order.orderDate)}</TableCell>
                            <TableCell>{order.customerId}</TableCell>
                            <TableCell>{order.firstName} {order.lastName}, {order.city}</TableCell>
                            <TableCell align="right">{formatPrice(order.total)}</TableCell>
                            <TableCell>
                                <Select size="small" value={order.orderStatus} aria-label={`#${order.id} durumu`}
                                    //! Ödemesi alınamamış sipariş değiştirilemez (backend de reddediyor)
                                    disabled={order.orderStatus === "PaymentFailed"}
                                    onChange={e => handleStatusChange(order, e.target.value as OrderStatus)}>
                                    {statuses.map(s => <MenuItem key={s} value={s}>{orderStatusLabels[s].label}</MenuItem>)}
                                </Select>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
