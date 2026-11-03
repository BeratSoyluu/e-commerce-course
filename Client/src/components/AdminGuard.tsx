import { Navigate, Outlet, useLocation } from "react-router";
import { useAccountContext } from "../context/useAccountContext";

//! Bu guard sadece kullanıcı deneyimi içindir: menüyü ve sayfayı gizler. Asıl güvenlik backend'deki
//! [Authorize(Roles = "Admin")]; localStorage'daki roller elle değiştirilse bile API 403 döner.
export default function AdminGuard() {
    const { user } = useAccountContext();
    const location = useLocation();

    if(!user) return <Navigate to="/login" state={{ from: location }} replace />;
    if(!user.roles.includes("Admin")) return <Navigate to="/" replace />;

    return <Outlet />;
}
