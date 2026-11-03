import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";

export default function AdminPage() {
    const [tab, setTab] = useState(0);

    return (
        <>
            <Typography variant="h4" gutterBottom>Yönetim Paneli</Typography>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs value={tab} onChange={(_, value: number) => setTab(value)}>
                    <Tab label="Ürünler" />
                    <Tab label="Siparişler" />
                </Tabs>
            </Box>
            {/* //? Sekme değişince diğeri unmount olur; tekrar açılınca güncel veri çekilir */}
            {tab === 0 ? <AdminProducts /> : <AdminOrders />}
        </>
    );
}
