import { Box, Button, Chip, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import requests from "../../api/requests";
import type { IProduct } from "../../model/IProduct";
import { formatPrice, getImageUrl } from "../../utils/helpers";
import ProductFormDialog from "./ProductFormDialog";

export default function AdminProducts() {
    const [products, setProducts] = useState<IProduct[] | null>(null);
    //? undefined = form kapalı, null = yeni ürün, IProduct = düzenlenen ürün
    const [editing, setEditing] = useState<IProduct | null | undefined>(undefined);

    const loadProducts = useCallback(() => {
        requests.Admin.products()
            .then(data => setProducts(data))
            .catch(error => console.log(error));
    }, []);

    useEffect(() => { loadProducts(); }, [loadProducts]);

    async function handleDelete(product: IProduct) {
        //? Soft delete: ürün silinmez, satıştan kaldırılır; düzenle ekranından tekrar "Satışta" yapılabilir.
        if(!window.confirm(`"${product.name}" satıştan kaldırılsın mı?`)) return;
        try {
            await requests.Admin.deleteProduct(product.id);
            toast.success("Ürün satıştan kaldırıldı.");
            loadProducts();
        } catch (error) {
            console.log(error);
        }
    }

    function handleSaved() {
        toast.success(editing ? "Ürün güncellendi." : "Ürün eklendi.");
        setEditing(undefined);
        loadProducts();
    }

    if(!products) return <CircularProgress />;

    return (
        <>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <Button variant="contained" startIcon={<Add />} onClick={() => setEditing(null)}>Yeni Ürün</Button>
            </Box>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell></TableCell>
                            <TableCell>Ürün</TableCell>
                            <TableCell>Marka</TableCell>
                            <TableCell align="right">Fiyat</TableCell>
                            <TableCell align="right">Stok</TableCell>
                            <TableCell>Durum</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map(product => (
                            <TableRow key={product.id}>
                                <TableCell>{product.id}</TableCell>
                                <TableCell><img src={getImageUrl(product.imageUrl)} style={{ height: 40 }} /></TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.brand}</TableCell>
                                <TableCell align="right">{formatPrice(product.price)}</TableCell>
                                <TableCell align="right">{product.stock}</TableCell>
                                <TableCell>
                                    <Chip size="small" label={product.isActive ? "Satışta" : "Pasif"} color={product.isActive ? "success" : "default"} />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Düzenle">
                                        <IconButton aria-label={`${product.name} düzenle`} onClick={() => setEditing(product)}><Edit /></IconButton>
                                    </Tooltip>
                                    <Tooltip title="Satıştan kaldır">
                                        <span>
                                            <IconButton aria-label={`${product.name} sil`} color="error" disabled={!product.isActive} onClick={() => handleDelete(product)}>
                                                <Delete />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* //? key: başka bir ürüne geçince form yeni varsayılan değerlerle sıfırdan oluşsun */}
            {editing !== undefined &&
                <ProductFormDialog key={editing?.id ?? "new"} product={editing} onClose={() => setEditing(undefined)} onSaved={handleSaved} />}
        </>
    );
}
