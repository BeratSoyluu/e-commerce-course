import { useEffect, useState } from "react";
import { ProductGridSkeleton } from "../../components/Skeletons";
import type { IProduct } from "../../model/IProduct";
import ProductList from "./ProductList";
import { Box, Grid, Pagination, Typography } from "@mui/material";
import requests from "../../api/requests";
import type { ProductParams } from "../../model/IProductParams";
import type { PaginatedResponse } from "../../model/IPagination";
import ProductFilters from "./ProductFilters";

const initialParams: ProductParams = { searchTerm: "", orderBy: "name", brands: [], pageNumber: 1, pageSize: 8 };

//? State'i backend'in beklediği query string'e çeviriyoruz: brands dizisi "Apple,Xiaomi" olur.
function toQuery(params: ProductParams) {
    const query = new URLSearchParams();
    query.append("pageNumber", params.pageNumber.toString());
    query.append("pageSize", params.pageSize.toString());
    query.append("orderBy", params.orderBy);
    if(params.searchTerm) query.append("searchTerm", params.searchTerm);
    if(params.brands.length > 0) query.append("brands", params.brands.join(","));
    return query;
}

export default function CatalogPage(){

  const [params, setParams] = useState(initialParams);
  const [brands, setBrands] = useState<string[]>([]);
  //? Sonucu hangi parametrelerle aldığımızı da saklıyoruz. Ayrı bir "loading" state'ine gerek kalmıyor:
  //? sonuç güncel parametrelere ait değilse yükleniyor demektir.
  const [result, setResult] = useState<{ params: ProductParams; data: PaginatedResponse<IProduct> | null } | null>(null);
  const loading = result?.params !== params;

  useEffect(() => {
    requests.Catalog.filters()
      .then(filters => setBrands(filters.brands))
      .catch(error => console.log(error));
  }, []);

  useEffect(()=>{
    //! Kullanıcı hızlı filtre değiştirirse eski istek yenisinden sonra dönebilir. "ignore" ile sadece son isteğin cevabı yazılır.
    let ignore = false;
    requests.Catalog.list(toQuery(params))
      .then(data => { if(!ignore) setResult({ params, data }); })
      .catch(error => {
        console.log(error);
        if(!ignore) setResult({ params, data: null });
      });
    return () => { ignore = true; };
  }, [params]);

  function handleFilterChange(changes: Partial<ProductParams>) {
    //? Filtre değişince sayfa 1'e dönüyoruz; 3. sayfadayken filtre sonucu 1 sayfaya düşerse boş sayfa görünmesin.
    setParams(prev => ({ ...prev, ...changes, pageNumber: 1 }));
  }

  const data = result?.data;

  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, md: 3 }}>
        <ProductFilters params={params} brands={brands} onChange={handleFilterChange} />
      </Grid>

      <Grid size={{ xs: 12, md: 9 }}>
        {loading && <ProductGridSkeleton />}

        {!loading && data && data.items.length === 0 &&
          <Typography variant="h6" sx={{ mt: 2 }}>Sonuç bulunamadı</Typography>}

        {!loading && data && data.items.length > 0 && (
          <>
            <ProductList products={data.items} />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Toplam {data.metaData.totalCount} ürün
              </Typography>
              {data.metaData.totalPages > 1 &&
                <Pagination
                  color="secondary"
                  count={data.metaData.totalPages}
                  page={data.metaData.currentPage}
                  onChange={(_, page) => setParams(prev => ({ ...prev, pageNumber: page }))} />}
            </Box>
          </>
        )}
      </Grid>
    </Grid>
  )
}
