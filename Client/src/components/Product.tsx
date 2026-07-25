import type { IProduct } from "../model/IProduct"

interface Props {
    product: IProduct
}

export default function Product({product}: Props) {
  return (
    <>
      {product.isActive ? (
        <div>
          <h3>{product.name}</h3>
          <div> {product.price} ₺</div>
        </div>
      ) : <p>Ürün Satışta Değil</p>}
    </>
  )
}