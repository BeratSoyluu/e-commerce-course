import { Box, Button, Paper, Step, StepLabel, Stepper, Typography } from "@mui/material";
import { CheckCircleOutlined } from "@mui/icons-material";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Link } from "react-router";
import AddressForm from "./AddressForm";
import PaymentForm from "./PaymentForm";
import Review from "./Review";
import requests from "../../api/requests";
import { useCartContext } from "../../context/useCartContext";
import type { CreateOrder } from "../../model/IOrder";

export type CheckoutForm = CreateOrder;

const steps = ["Adres", "Ödeme", "Özet"];

//? Her adımda sadece o adımın alanları doğrulanır; kullanıcı ödeme adımına geçerken özet alanlarıyla ilgili hata görmez.
const stepFields: (keyof CheckoutForm)[][] = [
    ["firstName", "lastName", "phone", "city", "addressLine"],
    [],
    [],
];

export default function CheckoutPage() {
    const { cart, setCart } = useCartContext();
    const [activeStep, setActiveStep] = useState(0);
    const [orderId, setOrderId] = useState<number | null>(null);
    //? Tek form tüm adımları kapsıyor (FormProvider ile alt bileşenlere dağıtılıyor)
    const methods = useForm<CheckoutForm>({ mode: "onTouched" });
    const { handleSubmit, trigger, formState: { isSubmitting } } = methods;

    async function handleNext() {
        //? trigger(alanlar): sadece verilen alanları doğrular, geçerliyse true döner
        const valid = await trigger(stepFields[activeStep]);
        if(valid) setActiveStep(step => step + 1);
    }

    //! Formda tek submit butonu son adımdaki "Siparişi Onayla". Önceki adımlarda submit butonu olmadığı ve birden fazla
    //! input bulunduğu için tarayıcı Enter'la formu göndermez; yanlışlıkla sipariş verilemez.
    async function onSubmit(data: CheckoutForm) {
        try {
            const order = await requests.Orders.create(data);
            setOrderId(order.id);
            //? Backend sepeti sildi; header'daki sayaç da sıfırlansın
            setCart(null);
            setActiveStep(steps.length);
        } catch (error) {
            console.log(error); //? Stok yetersiz vb. mesajları interceptor toast ile gösteriyor
        }
    }

    if(orderId) {
        return (
            <Paper sx={{ p: 6, textAlign: "center" }}>
                <CheckCircleOutlined color="success" sx={{ fontSize: 64 }} />
                <Typography variant="h5" gutterBottom>Teşekkürler, siparişiniz alındı!</Typography>
                <Typography sx={{ mb: 3 }}>Sipariş numaranız: <strong>#{orderId}</strong></Typography>
                <Button component={Link} to={`/orders/${orderId}`} variant="contained" sx={{ mr: 2 }}>Siparişi Görüntüle</Button>
                <Button component={Link} to="/catalog" variant="outlined">Alışverişe Devam Et</Button>
            </Paper>
        );
    }

    if(!cart || cart.cartItems.length === 0) {
        return (
            <Paper sx={{ p: 6, textAlign: "center" }}>
                <Typography variant="h5" gutterBottom>Sepetiniz boş</Typography>
                <Button component={Link} to="/catalog" variant="contained">Alışverişe Başla</Button>
            </Paper>
        );
    }

    const isLastStep = activeStep === steps.length - 1;

    return (
        <Paper sx={{ p: 4 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
            </Stepper>

            <FormProvider {...methods}>
                <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
                    {/* //? Adımlar gizlenmiyor, hiç render edilmiyor; değerler react-hook-form'da tutulduğu için kaybolmuyor (shouldUnregister=false varsayılan). */}
                    {activeStep === 0 && <AddressForm />}
                    {activeStep === 1 && <PaymentForm />}
                    {activeStep === 2 && <Review cartItems={cart.cartItems} />}

                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                        <Button disabled={activeStep === 0} onClick={() => setActiveStep(step => step - 1)}>Geri</Button>
                        {/* //! Farklı key şart: key olmazsa React aynı <button> elemanını yeniden kullanıp sadece type'ını "submit" yapar.
                            //! Bu, İleri'ye basılan tıklama bitmeden olduğu için tarayıcı formu gönderir ve kullanıcı özeti görmeden
                            //! sipariş verilir. Key ile eski buton kaldırılıp yenisi eklenir; tıklanan eleman formdan kopmuş olur. */}
                        {isLastStep
                            ? <Button key="submit" type="submit" variant="contained" loading={isSubmitting}>Siparişi Onayla</Button>
                            //! type="button": formun içinde olduğu için varsayılan "submit" olurdu ve İleri'ye basınca sipariş verilirdi.
                            : <Button key="next" type="button" variant="contained" onClick={handleNext}>İleri</Button>}
                    </Box>
                </Box>
            </FormProvider>
        </Paper>
    );
}
