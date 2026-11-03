import { Checkbox, FormControlLabel, FormGroup, Paper, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import type { OrderBy, ProductParams } from "../../model/IProductParams";

const sortOptions: { value: OrderBy; label: string }[] = [
    { value: "name", label: "İsme göre (A-Z)" },
    { value: "price", label: "Fiyat: Düşükten yükseğe" },
    { value: "priceDesc", label: "Fiyat: Yüksekten düşüğe" },
];

interface Props {
    params: ProductParams;
    brands: string[];
    onChange: (changes: Partial<ProductParams>) => void;
}

export default function ProductFilters({ params, brands, onChange }: Props) {
    //? Input'un kendi state'i var: her tuşta ekran anında güncellenir ama API isteği gecikmeli gider.
    const [term, setTerm] = useState(params.searchTerm);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    //? Bileşen kaldırılırsa bekleyen zamanlayıcı iptal edilsin
    useEffect(() => () => clearTimeout(timer.current), []);

    function handleSearch(value: string) {
        setTerm(value);
        //? Debounce: kullanıcı yazmayı 500 ms bırakana kadar istek atılmaz. "watch" yazarken 5 yerine 1 istek gider.
        clearTimeout(timer.current);
        timer.current = setTimeout(() => onChange({ searchTerm: value }), 500);
    }

    function handleBrandToggle(brand: string) {
        //! Diziyi değiştirmeden yeni dizi üretiyoruz (immutable); yoksa React değişikliği görmez.
        const selected = params.brands.includes(brand)
            ? params.brands.filter(b => b !== brand)
            : [...params.brands, brand];
        onChange({ brands: selected });
    }

    return (
        <>
            <Paper sx={{ p: 2, mb: 2 }}>
                <TextField label="Ürün ara" fullWidth value={term} onChange={e => handleSearch(e.target.value)} />
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Sıralama</Typography>
                <RadioGroup value={params.orderBy} onChange={e => onChange({ orderBy: e.target.value as OrderBy })}>
                    {sortOptions.map(o =>
                        <FormControlLabel key={o.value} value={o.value} control={<Radio size="small" />} label={o.label} />
                    )}
                </RadioGroup>
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Marka</Typography>
                <FormGroup>
                    {brands.map(brand =>
                        <FormControlLabel key={brand} label={brand} control={
                            <Checkbox size="small" checked={params.brands.includes(brand)} onChange={() => handleBrandToggle(brand)} />
                        } />
                    )}
                </FormGroup>
            </Paper>
        </>
    );
}
