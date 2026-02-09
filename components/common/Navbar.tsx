"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { authService } from "@/services/auth/auth-service";
import { COLORS } from "@/constants/colors";

export default function Navbar() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const getUserFromCookies = () => {
      const match = document.cookie.match(new RegExp('(^| )user=([^;]+)'));
      if (match) {
        try {
          return JSON.parse(decodeURIComponent(match[2]));
        } catch {
          return null;
        }
      }
      return null;
    };

    const user = getUserFromCookies();
    setRole(user?.role ?? null);
  }, []);

  const getAccessToken = () => {
    const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
    return match ? match[2] : null;
  };

  const handleLogout = async () => {
    try {
      const token = getAccessToken();
      if (token) {
        await authService.logout(token);
      }
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      document.cookie = 'access_token=; path=/; max-age=0';
      document.cookie = 'refresh_token=; path=/; max-age=0';
      document.cookie = 'user=; path=/; max-age=0';
      router.push("/");
    }
  };

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const menuItems = [
    { label: "Inicio", href: "/dashboard" },
    ...(role === "ADMIN" ? [{ label: "Gestión", href: "/admin" }] : []),
  ];

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          top: 0,
          backgroundColor: COLORS.primary.main,
          boxShadow: "none",
          zIndex: 1100,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2 }}>
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  sx={{
                    color: COLORS.text.light,
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: "1rem",
                  }}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </Box>
          <Box sx={{ display: { xs: "flex", sm: "none" } }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Button
              onClick={handleLogout}
              sx={{
                backgroundColor: COLORS.button.primary.background,
                color: COLORS.button.primary.text,
                fontWeight: 600,
                textTransform: "none",
                px: 2,
                py: 1,
                borderRadius: "6px",
                "&:hover": {
                  backgroundColor: COLORS.button.primary.hover,
                },
              }}
            >
              Cerrar sesión
            </Button>
          </Box>
          <Box sx={{ display: { xs: "flex", sm: "none" }, flexGrow: 1 }} />
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            width: 250,
            backgroundColor: COLORS.primary.dark,
            height: "100%",
            pt: 2,
          }}
          role="presentation"
        >
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.href} disablePadding>
                <Link href={item.href} passHref legacyBehavior>
                  <ListItemButton
                    onClick={toggleDrawer(false)}
                    sx={{
                      color: COLORS.text.light,
                    }}
                  >
                    <ListItemText
                      primary={item.label}
                      sx={{
                        "& .MuiTypography-root": {
                          fontWeight: 600,
                        },
                      }}
                    />
                  </ListItemButton>
                </Link>
              </ListItem>
            ))}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  toggleDrawer(false)();
                  handleLogout();
                }}
                sx={{
                  color: COLORS.text.light,
                  mt: 2,
                  mx: 2,
                  backgroundColor: COLORS.button.primary.background,
                  borderRadius: "6px",
                  "&:hover": {
                    backgroundColor: COLORS.button.primary.hover,
                  },
                }}
              >
                <ListItemText
                  primary="Cerrar sesión"
                  sx={{
                    "& .MuiTypography-root": {
                      fontWeight: 600,
                      color: COLORS.button.primary.text,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
