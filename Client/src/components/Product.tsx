import { Button, Card, CardActions, CardContent, CardMedia, Typography } from "@mui/material"
import type { IProduct } from "../model/IProduct"
import { AddShoppingCart } from "@mui/icons-material"
import SearchIcon from '@mui/icons-material/Search';

interface Props {
    product: IProduct
}

export default function Product({product}: Props) {
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
        <CardMedia sx={{ height:160, backgroundSize: "contain" }} image={`http://localhost:5274/images/${product.imageUrl}`} />
        <CardContent>
          <Typography gutterBottom variant="h6" component="h2" color="text.secondery">
            {product.name}
          </Typography>
          <Typography variant="body2" color="secondary">
            {(product.price / 10).toFixed(2)} ₺
          </Typography>
          <CardActions>
            <Button variant="outlined" size="small" startIcon={<AddShoppingCart />} color="success">Add to cart</Button>
            <Button variant="outlined" size = "small" startIcon={<SearchIcon/>} color="primary">VIEW</Button>

          </CardActions>
        </CardContent>

    </Card>
    </>
  )
}