import { Button, Card, CardActions, CardContent, CardMedia, Typography } from "@mui/material"
import type { IProduct } from "../../model/IProduct"
import { AddShoppingCart } from "@mui/icons-material"
import SearchIcon from '@mui/icons-material/Search';
import { Link } from "react-router";
import { useState } from "react";
import requests from "../../api/requests";
import { useCartContext } from "../../context/useCartContext";
import { formatPrice, getImageUrl } from "../../utils/helpers";

interface Props {
    product: IProduct
}

export default function Product({product}: Props) {

  const[loading,setLoading] = useState(false);
  const { setCart } = useCartContext();

  function HandleAddItem(productId: number){
    setLoading(true);
    requests.Cart.addItem(productId)
    .then(cart => setCart(cart))
    .catch(error=>console.log(error))
    .finally(() => setLoading(false));
  }

  return (
    /*<>
      {product.isActive ? (
        <div>
          <h3>{product.name}</h3>
          <div> {product.price} ₺</div>
        </div>
      ) : <p>Ürün Satışta Değil</p>}
    </>*/ //? Ürünün aktif olup olmadığına bakıyor.
    <>
    <Card>
        <CardMedia sx={{ height:160, backgroundSize: "contain" }} image={getImageUrl(product.imageUrl)} />
        <CardContent>
          <Typography gutterBottom variant="h6" component="h2" color="text.secondary">
            {product.name}
          </Typography>
          <Typography variant="body2" color="secondary">
            {formatPrice(product.price)}
          </Typography>
          <CardActions>
            {/*<Button variant="outlined" size="small" startIcon={<AddShoppingCart />} color="success" >
                Add to cart
              </Button>*/}

            <Button variant="outlined" size="small" loadingPosition="start" loading={loading} startIcon={<AddShoppingCart />} onClick={()=>HandleAddItem(product.id)}>
            SEPETE EKLE 
             </Button>

            <Button component={Link} to={`/catalog/${product.id}`} variant="outlined" size = "small" startIcon={<SearchIcon/>} color="primary">incele</Button>

          </CardActions>
        </CardContent>

    </Card>
    </>
  )
}