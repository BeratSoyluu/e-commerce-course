import { Box, Card, CardContent, Grid, Paper, Skeleton, Stack } from "@mui/material";

//? Skeleton, yüklenecek içeriğin şeklini önceden çizer. Dönen bir ikona göre sayfa daha hızlı açılıyormuş gibi algılanır
//? ve veri gelince içerik yerinden zıplamaz (layout shift olmaz).

export function ProductGridSkeleton({ count = 6, size = { xs: 12, sm: 6, lg: 4 } }: { count?: number; size?: object }) {
    return (
        <Grid container spacing={2} aria-busy="true" aria-label="Yükleniyor">
            {Array.from({ length: count }, (_, i) => (
                <Grid key={i} size={size}>
                    <Card>
                        <Skeleton variant="rectangular" height={160} />
                        <CardContent>
                            <Skeleton width="80%" />
                            <Skeleton width="40%" />
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                <Skeleton variant="rounded" width={110} height={30} />
                                <Skeleton variant="rounded" width={80} height={30} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
    return (
        <Paper sx={{ p: 2 }} aria-busy="true" aria-label="Yükleniyor">
            {Array.from({ length: rows }, (_, r) => (
                <Stack key={r} direction="row" spacing={2} sx={{ py: 1 }}>
                    {Array.from({ length: columns }, (_, c) => <Skeleton key={c} sx={{ flex: 1 }} height={28} />)}
                </Stack>
            ))}
        </Paper>
    );
}

export function ProductDetailsSkeleton() {
    return (
        <Grid container spacing={6} aria-busy="true" aria-label="Yükleniyor">
            <Grid size={{ lg: 4, md: 5, sm: 6, xs: 12 }}>
                <Skeleton variant="rectangular" height={300} />
            </Grid>
            <Grid size={{ lg: 8, md: 7, sm: 6, xs: 12 }}>
                <Skeleton variant="text" height={60} width="70%" />
                <Skeleton variant="text" height={50} width="30%" />
                {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} height={50} />)}
            </Grid>
        </Grid>
    );
}

//? Uygulama açılışında (kullanıcı ve sepet doğrulanırken) header + içerik iskeleti
export function AppSkeleton() {
    return (
        <Box aria-busy="true" aria-label="Yükleniyor">
            <Skeleton variant="rectangular" height={64} sx={{ mb: 4 }} />
            <Box sx={{ px: 3 }}>
                <ProductGridSkeleton count={3} />
            </Box>
        </Box>
    );
}
