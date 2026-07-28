import { Alert, AlertTitle, Button, Container, Divider, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router";

export default function ServerErrorPage() {
    const { state } = useLocation();
    const navigate = useNavigate();

    return (
        <Container sx={{ mt: 4 }}>
            {state?.error ? (
                <>
                    <Alert severity="error">
                        <AlertTitle>{state.error.title}</AlertTitle>
                    </Alert>
                    {state.error.detail && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography
                                component="pre"
                                sx={{
                                    whiteSpace: "pre-wrap",
                                    fontFamily: "monospace",
                                    color: "text.secondary",
                                }}
                            >
                                {state.error.detail}
                            </Typography>
                        </>
                    )}
                </>
            ) : (
                <Alert severity="error">
                    <AlertTitle>Sunucu hatası</AlertTitle>
                    Beklenmeyen bir hata oluştu.
                </Alert>
            )}
            <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/")}>
                Ana sayfaya dön
            </Button>
        </Container>
    );
}
