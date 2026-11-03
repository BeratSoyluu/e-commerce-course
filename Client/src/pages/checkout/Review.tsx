import { Box, Grid, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";
import type { CheckoutForm } from "./CheckoutPage";
import type { CartItem } from "../../model/ICart";
import { formatPrice } from "../../utils/helpers";
import CartSummary from "../cart/CartSummary";

interface Props {
    cartItems: CartItem[];
}

export default function Review({ cartItems }: Props) {
    //? getValues: önceki adımlarda girilen değerleri okur; burada sadece göstermek için, render tetiklemez.
    const { getValues } = useFormContext<CheckoutForm>();
    const address = getValues();

    return (
        <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" gutterBottom>Ürünler</Typography>
                <List disablePadding>
                    {cartItems.map(item => (
                        <ListItem key={item.productId} disableGutters>
                            <ListItemText primary={item.name} secondary={`${item.quantity} adet`} />
                            <Typography>{formatPrice(item.price * item.quantity)}</Typography>
                        </ListItem>
                    ))}
                </List>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" gutterBottom>Teslimat Adresi</Typography>
                <Typography>{address.firstName} {address.lastName}</Typography>
                <Typography>{address.phone}</Typography>
                <Typography>{address.addressLine}</Typography>
                <Typography gutterBottom>{address.city}</Typography>
                <Box sx={{ mt: 2 }}>
                    <CartSummary cartItems={cartItems} showDelivery />
                </Box>
            </Grid>
        </Grid>
    );
}
