import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router'
import { router } from './router/Routes.tsx'
import { CartContextProvider } from './context/CartContextProvider.tsx'
import { AccountContextProvider } from './context/AccountContextProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartContextProvider>
      <AccountContextProvider>
        <RouterProvider router={router} />
      </AccountContextProvider>
    </CartContextProvider>
  </StrictMode>,
)
