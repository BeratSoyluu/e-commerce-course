import { SearchOff } from "@mui/icons-material";
import { Button, Container, Divider, Typography } from "@mui/material";
import { Link } from "react-router";

export default function NotFound() {
    return (
        <Container
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: 8,
            }}
        >
            <SearchOff sx={{ fontSize: 100 }} color="primary" />
            <Typography variant="h3" gutterBottom>
                Aradığınız sayfa bulunamadı
            </Typography>
            <Divider sx={{ my: 2, width: "100%" }} />
            <Button component={Link} to="/" variant="contained">
                Ana sayfaya dön
            </Button>
        </Container>
    );
}
