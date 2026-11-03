import { useEffect, useState } from "react";
import Header from "./Header";
import { CircularProgress, Container, CssBaseline } from "@mui/material";
import { Outlet } from "react-router";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import requests from "../api/requests";
import { useCartContext } from "../context/useCartContext";
import { useAccountContext } from "../context/useAccountContext";
import { getStoredUser } from "../utils/userStorage";


function App() {
  const { setCart } = useCartContext();
  const { login, logout } = useAccountContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      //? localStorage'daki token'a körü körüne güvenmiyoruz: süresi dolmuş ya da sunucuda silinmiş olabilir.
      //? getUser 200 dönerse yenilenmiş token'la kullanıcıyı güncelliyoruz.
      //! Önce kullanıcı, sonra sepet: sepet isteği token'la gitmeli ki kullanıcının sepeti gelsin.
      if(getStoredUser()) {
        try {
          login(await requests.Account.getUser());
        } catch {
          logout(); //? 401'de interceptor zaten temizliyor; ağ hatası gibi diğer durumlar için de garantiye alıyoruz
        }
      }
      setCart(await requests.Cart.get()); // gelen sepet verisini alır ve uygulamanızın sepet durumunu bu veriyle günceller.
    }

    init()
      .catch(error => console.log(error))
      .finally(()=> setLoading(false));
    //? setCart (useState setter) ve login/logout (useCallback) sabit referanslı; effect yine sadece bir kez çalışır.
  }, [setCart, login, logout])

  //! ToastContainer yükleme sırasında da render ediliyor. Açılıştaki istekler (ör. süresi dolmuş token, API kapalı)
  //! toast'ı container yokken tetikliyordu; StrictMode container'ı bağla-çöz-bağla yaptığı için kuyruktaki toast kayboluyordu.
  return (
    <>
    <ToastContainer position="bottom-right" hideProgressBar theme="colored" />
    <CssBaseline/>
    {loading ? <CircularProgress /> : (
      <>
        <Header/>
        <Container>
          <Outlet />
        </Container>
      </>
    )}
    </>
  )
}

export default App
