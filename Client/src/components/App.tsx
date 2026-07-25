import { useEffect, useState } from "react";
import type { IProduct } from "../model/IProduct";
import Header from "./Header";
import ProductList from "./ProductList";


function App() {

  const [products, setProducts] = useState<IProduct[]>([]);

  useEffect(()=>{
    fetch("http://localhost:5274/api/products")
    .then(response => response.json())
    .then(data=>setProducts(data));
  }, []);

  /*
   [...products, {...}] — buradaki ... spread operatörü. "Mevcut products dizisinin tüm elemanlarını tek tek al, yeni bir dizinin içine dök, sonuna da şu yeni nesneyi ekle" demek.
  */ 

  function addProduct(){
    setProducts([...products, {id: Date.now(), 
      name: "product 4", 
      price: 4000, 
      isActive: true, 
    }])
  }

  return (
    <>
      <Header products={products}/>
      <ProductList products={products} addProduct={addProduct} />
    </>
  )
}

export default App
