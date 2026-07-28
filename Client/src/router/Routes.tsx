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

export const router = createBrowserRouter([
    {
        path:"/",
        element: <App />,
        children: [
            {path:"",element:<HomePage />},
            {path:"about",element:<AboutPage />},
            {path:"contact",element:<ContactPage />},
            {path:"catalog",element:<CatalogPage />},
            {path:"error",element:<ErrorPage />},
            {path:"server-error",element:<ServerErrorPage />},
            {path:"catalog/:id",element:<ProductDetailsPage />},
            {path:"*",element:<NotFound />},
        ]
    }
])