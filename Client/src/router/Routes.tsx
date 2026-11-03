import { createBrowserRouter } from "react-router"
import App from "../components/App"
import HomePage from "../pages/HomePage"
import AboutPage from "../pages/AboutPage"
import ContactPage from "../pages/ContactPage"
import CatalogPage from "../pages/Catalog/CatalogPage"
import ProductDetailsPage from "../pages/Catalog/ProductDetails"
import ErrorPage from "../pages/ErrorPage"
import ServerErrorPage from "../pages/ServerErrorPage"
import NotFound from "../pages/NotFound"
import ShoppingCartPage from "../pages/cart/ShoppingCartPage"
import LoginPage from "../pages/account/LoginPage"
import RegisterPage from "../pages/account/RegisterPage"
import AuthGuard from "../components/AuthGuard"
import OrdersPage from "../pages/orders/OrdersPage"
import OrderDetailsPage from "../pages/orders/OrderDetailsPage"
import CheckoutPage from "../pages/checkout/CheckoutPage"

export const router = createBrowserRouter([
    {
        path:"/",
        element: <App />,
        children: [
            //? Path'siz route: kendi adresi yok, sadece altındaki sayfaları AuthGuard ile sarar.
            {element: <AuthGuard />, children: [
                {path:"checkout",element:<CheckoutPage />},
                {path:"orders",element:<OrdersPage />},
                {path:"orders/:id",element:<OrderDetailsPage />},
            ]},
            {path:"",element:<HomePage />},
            {path:"about",element:<AboutPage />},
            {path:"contact",element:<ContactPage />},
            {path:"catalog",element:<CatalogPage />},
            {path:"cart",element:<ShoppingCartPage />},
            {path:"login",element:<LoginPage />},
            {path:"register",element:<RegisterPage />},
            {path:"error",element:<ErrorPage />},
            {path:"server-error",element:<ServerErrorPage />},
            {path:"catalog/:id",element:<ProductDetailsPage />},
            {path:"*",element:<NotFound />},
        ]
    }
])
