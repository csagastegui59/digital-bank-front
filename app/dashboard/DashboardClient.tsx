'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Box, Container, Typography, Button, Card } from '@mui/material';
import { COLORS } from '@/constants/colors';
import { authService } from '@/services/auth/auth-service';
import { Account } from '@/services/account/account-service';
import AccountsDisplay from '@/components/accounts/AccountsDisplay';

// Helper para obtener token de cookies
const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
  return match ? match[2] : null;
};

// Helper para limpiar cookies
const clearCookies = () => {
  if (typeof window === 'undefined') return;
  document.cookie = 'access_token=; path=/; max-age=0';
  document.cookie = 'refresh_token=; path=/; max-age=0';
  document.cookie = 'user=; path=/; max-age=0';
};

interface DashboardClientProps {
  user: {
    id: string;
    email: string;
    role: string;
    firstname: string;
    lastname: string;
    isActive: boolean;
  };
  accounts: Account[];
}

export default function DashboardClient({ user, accounts }: DashboardClientProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const accessToken = getAccessToken();
    
    if (accessToken) {
      try {
        await authService.logout(accessToken);
        toast.success('Sesión cerrada correctamente');
      } catch (error) {
        toast.warning('Sesión cerrada localmente');
      }
    }

    clearCookies();
    
    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${COLORS.background.gradient.start} 0%, ${COLORS.background.gradient.end} 100%)`,
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: COLORS.text.light,
                fontWeight: 'bold',
              }}
            >
              ¡Hola, {user.firstname}!
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: COLORS.text.light,
                opacity: 0.8,
                mt: 0.5,
              }}
            >
              Bienvenido a tu Digital Bank
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={handleLogout}
            sx={{
              color: COLORS.text.light,
              borderColor: COLORS.text.light,
              '&:hover': {
                borderColor: COLORS.button.primary.background,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Cerrar Sesión
          </Button>
        </Box>

        {/* User Info Card */}
        <Card
          elevation={24}
          sx={{
            backgroundColor: COLORS.background.card,
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            p: 4,
            border: `1px solid ${COLORS.border.card}`,
            mb: 4,
          }}
        >
          <Typography variant="h5" sx={{ color: COLORS.text.light, mb: 3, fontWeight: 'bold' }}>
            Información Personal
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography sx={{ color: COLORS.text.light, opacity: 0.7, fontSize: '0.875rem' }}>
                Email
              </Typography>
              <Typography sx={{ color: COLORS.text.light, fontSize: '1.125rem', fontWeight: 500 }}>
                {user.email}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ color: COLORS.text.light, opacity: 0.7, fontSize: '0.875rem' }}>
                Rol
              </Typography>
              <Typography sx={{ color: COLORS.text.light, fontSize: '1.125rem', fontWeight: 500 }}>
                {user.role}
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* Accounts Card */}
        <Card
          elevation={24}
          sx={{
            backgroundColor: COLORS.background.card,
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            p: 4,
            border: `1px solid ${COLORS.border.card}`,
          }}
        >
          <Typography variant="h5" sx={{ color: COLORS.text.light, mb: 3, fontWeight: 'bold' }}>
            Mis Cuentas
          </Typography>
          
          {accounts.length === 0 ? (
            <Typography sx={{ color: COLORS.text.light, opacity: 0.7 }}>
              No tienes cuentas registradas
            </Typography>
          ) : (
            <AccountsDisplay accounts={accounts} />
          )}
        </Card>
      </Container>
    </Box>
  );
}
