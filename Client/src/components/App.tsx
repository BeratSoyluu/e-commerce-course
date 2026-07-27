import Header from "./Header";
import { Container, CssBaseline } from "@mui/material";
import { Outlet } from "react-router";


function App() {

  /*
   ? [...products, {...}] — buradaki ... spread operatörü. "Mevcut products dizisinin tüm elemanlarını tek tek al, yeni bir dizinin içine dök, sonuna da şu yeni nesneyi ekle" demek.
  */ 

  /*function addProduct(){
    setProducts([...products, {id: Date.now(), 
      name: "product 4", 
      price: 4000, 
      isActive: true, 
    }])
  }*/

  return (
    <>
    <CssBaseline/>
      <Header/>
      <Container>
        <Outlet />
      </Container>
    </>
  )
}

export default App
