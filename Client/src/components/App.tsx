import { useEffect, useState } from "react";
import Header from "./Header";
import { CircularProgress, Container, CssBaseline } from "@mui/material";
import { Outlet } from "react-router";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import requests from "../api/requests";
import { useCartContext } from "../context/useCartContext";


function App() {
  const { setCart } = useCartContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requests.Cart.get()
      .then(cart=> setCart(cart)) // gelen sepet verisini alır ve uygulamanızın sepet durumunu bu veriyle günceller.
      .catch(error => console.log(error))
      .finally(()=> setLoading(false));
    //? setCart effect içinde kullanıldığı için bağımlılık listesinde olmalı (exhaustive-deps).
    //? useState'ten gelen setter React tarafından sabit tutulur, yani bu effect yine sadece bir kez çalışır.
  }, [setCart])

  if(loading) return <CircularProgress />

  return (
    <>
    <ToastContainer position="bottom-right" hideProgressBar theme="colored" />
    <CssBaseline/>
      <Header/>
      <Container>
        <Outlet />
      </Container>
    </>
  )
}

export default App
