import { AccountCircle, ShoppingCart } from "@mui/icons-material";
import { AppBar, Badge, Box, Button, IconButton, Menu, MenuItem, Stack, Toolbar, Typography } from "@mui/material";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useCartContext } from "../context/useCartContext";
import { useAccountContext } from "../context/useAccountContext";
import requests from "../api/requests";

const links = [
  {title:"Home",to:"/"},
  {title:"Catalog",to:"/catalog"},
  {title:"About",to:"/about"},
  {title:"Contact",to:"/contact"},
  //? import.meta.env.DEV "npm run dev"de true, build'de false olur. Build sırasında false olduğu için bu link production paketine hiç girmez.
  ...(import.meta.env.DEV ? [{title:"Error",to:"/error"}] : []),
]

const navStyles = {
  color: "white",
  TextDecoration:"none",
  "&:hover": {
    color:"text.primary"
  },
  "&.active":{
    color: "warning.main"
  }
}

export default function Header() {
  const { cart, setCart } = useCartContext();
  const { user, logout } = useAccountContext();
  const navigate = useNavigate();
  //? Menü, açıldığı butona (anchor) göre konumlanır; null ise kapalı.
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const itemCount = cart?.cartItems.reduce((total,item) => total + item.quantity, 0)

  function handleLogout() {
    setMenuAnchor(null);
    logout();
    //? Header'da kullanıcının sepeti kalmasın; yeni anonim sepet çekilir (backend yeni cookie verir).
    requests.Cart.get().then(cart => setCart(cart)).catch(() => setCart(null));
    navigate("/catalog");
  }

  return (
    <AppBar position="static" sx={{mb:4}}>
        <Toolbar sx={{display:"flex",justifyContent:"space-between"}}>
          <Box sx={{display:"flex", alignItems:"center"}}>
            <Typography variant="h6">E-Commerce</Typography>
            <Stack direction="row">
              {links.map(link =>
              <Button key={link.to} component={NavLink} to={link.to} sx={navStyles}> {link.title}</Button>
              )}
            </Stack>
          </Box>

          <Box sx={{display:"flex", alignItems:"center"}}>
              <IconButton component={Link} to="/cart" size="large" edge="start" color="inherit" aria-label="Sepet">
                <Badge badgeContent={itemCount} color="secondary">
                  <ShoppingCart/>
                </Badge>
              </IconButton>

              {user ? (
                <>
                  <Button color="inherit" startIcon={<AccountCircle />} onClick={e => setMenuAnchor(e.currentTarget)}>
                    {user.name}
                  </Button>
                  <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
                    <MenuItem component={Link} to="/orders" onClick={() => setMenuAnchor(null)}>Siparişlerim</MenuItem>
                    <MenuItem onClick={handleLogout}>Çıkış</MenuItem>
                  </Menu>
                </>
              ) : (
                <Stack direction="row">
                  <Button component={NavLink} to="/login" sx={navStyles}>Giriş</Button>
                  <Button component={NavLink} to="/register" sx={navStyles}>Kayıt</Button>
                </Stack>
              )}
          </Box>

        </Toolbar>
    </AppBar>
  )
}
