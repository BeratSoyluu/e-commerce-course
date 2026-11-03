import { AccountCircle, Menu as MenuIcon, ShoppingCart } from "@mui/icons-material";
import { AppBar, Badge, Box, Button, Drawer, IconButton, List, ListItemButton, ListItemText, Menu, MenuItem, Stack, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
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
  const theme = useTheme();
  //? md (900px) altında linkler yan yana sığmıyor; hamburger menüye geçiyoruz.
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  //? Menü, açıldığı butona (anchor) göre konumlanır; null ise kapalı.
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const itemCount = cart?.cartItems.reduce((total,item) => total + item.quantity, 0)

  //? Sadece Admin rolünde görünür. Gizlemek güvenlik değildir; API zaten Admin olmayana 403 döner.
  const navLinks = user?.roles.includes("Admin") ? [...links, {title:"Admin",to:"/admin"}] : links;

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
            {isMobile &&
              <IconButton color="inherit" edge="start" aria-label="Menüyü aç" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>}
            <Typography variant="h6" component={Link} to="/" sx={{ color: "inherit", textDecoration: "none", mr: 2 }}>E-Commerce</Typography>
            {!isMobile &&
              <Stack direction="row">
                {navLinks.map(link =>
                <Button key={link.to} component={NavLink} to={link.to} sx={navStyles}> {link.title}</Button>
                )}
              </Stack>}
          </Box>

          <Box sx={{display:"flex", alignItems:"center"}}>
              <IconButton component={Link} to="/cart" size="large" edge="start" color="inherit" aria-label="Sepet">
                <Badge badgeContent={itemCount} color="secondary">
                  <ShoppingCart/>
                </Badge>
              </IconButton>

              {user ? (
                <>
                  {/* //? Mobilde isim yer kaplamasın, sadece ikon; aria-label ekran okuyucu ve testler için ismi taşıyor */}
                  {isMobile
                    ? <IconButton color="inherit" aria-label={user.name} onClick={e => setMenuAnchor(e.currentTarget)}><AccountCircle /></IconButton>
                    : <Button color="inherit" startIcon={<AccountCircle />} onClick={e => setMenuAnchor(e.currentTarget)}>{user.name}</Button>}
                  <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
                    <MenuItem component={Link} to="/orders" onClick={() => setMenuAnchor(null)}>Siparişlerim</MenuItem>
                    <MenuItem onClick={handleLogout}>Çıkış</MenuItem>
                  </Menu>
                </>
              ) : !isMobile && (
                <Stack direction="row">
                  <Button component={NavLink} to="/login" sx={navStyles}>Giriş</Button>
                  <Button component={NavLink} to="/register" sx={navStyles}>Kayıt</Button>
                </Stack>
              )}
          </Box>

        </Toolbar>

        {/* //? Mobil menü: soldan açılan çekmece. Bir linke tıklayınca kapanıyor. */}
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <List sx={{ width: 240 }} onClick={() => setDrawerOpen(false)}>
            {navLinks.map(link =>
              <ListItemButton key={link.to} component={NavLink} to={link.to}><ListItemText primary={link.title} /></ListItemButton>
            )}
            {!user && <>
              <ListItemButton component={NavLink} to="/login"><ListItemText primary="Giriş" /></ListItemButton>
              <ListItemButton component={NavLink} to="/register"><ListItemText primary="Kayıt" /></ListItemButton>
            </>}
          </List>
        </Drawer>
    </AppBar>
  )
}
