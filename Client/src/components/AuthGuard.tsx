import { Navigate, Outlet, useLocation } from "react-router";
import { useAccountContext } from "../context/useAccountContext";

//? Korumalı route'ları sarar: giriş yoksa /login'e gönderir, gelinen adresi state'te taşır.
//? Login başarılı olunca kullanıcı kaldığı sayfaya (ör. /checkout) döner.
export default function AuthGuard() {
    const { user } = useAccountContext();
    const location = useLocation();

    if(!user) return <Navigate to="/login" state={{ from: location }} replace />;

    return <Outlet />;
}
