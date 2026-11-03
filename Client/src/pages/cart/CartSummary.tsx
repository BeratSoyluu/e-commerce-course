import { Paper, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material";
import type { CartItem } from "../../model/ICart";
import { calculateDeliveryFee, formatPrice, KDV_RATE } from "../../utils/helpers";

interface Props {
    cartItems: CartItem[];
    //? Checkout özetinde kargo da gösteriliyor; sepet sayfasında adres girilmediği için gösterilmiyor.
    showDelivery?: boolean;
}

export default function CartSummary({ cartItems, showDelivery = false }: Props) {
    //? Toplamlar state'te tutulmuyor, her render'da sepetten hesaplanıyor. Böylece sepet değişince otomatik güncellenir.
    const subTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const deliveryFee = showDelivery ? calculateDeliveryFee(subTotal) : 0;
    const total = subTotal + deliveryFee;
    //! Fiyatlar KDV DAHİL. KDV'yi toplamın üstüne eklemiyoruz, toplamın içinden ayırıyoruz.
    //? %20 için: toplam = net * 120/100 olduğundan, içindeki KDV = toplam * 20 / 120.
    const kdv = total * KDV_RATE / (100 + KDV_RATE);

    return (
        <TableContainer component={Paper} sx={{ maxWidth: 400 }}>
            <Table>
                <TableBody>
                    {showDelivery && (
                        <>
                            <TableRow>
                                <TableCell>Ara Toplam</TableCell>
                                <TableCell align="right">{formatPrice(subTotal)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Kargo</TableCell>
                                <TableCell align="right">{deliveryFee === 0 ? "Ücretsiz" : formatPrice(deliveryFee)}</TableCell>
                            </TableRow>
                        </>
                    )}
                    <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Toplam (KDV dahil)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>{formatPrice(total)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell sx={{ color: "text.secondary" }}>İçindeki KDV (%{KDV_RATE})</TableCell>
                        <TableCell align="right" sx={{ color: "text.secondary" }}>{formatPrice(kdv)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
}
