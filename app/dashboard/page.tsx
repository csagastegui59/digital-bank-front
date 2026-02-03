'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Box, Container, Typography, Button, Card, CircularProgress } from '@mui/material';
import { COLORS } from '@/constants/colors';
import { authStorage } from '@/utils/auth';
import { authService } from '@/services/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      router.push('/');
      return;
    }

    const userData = authStorage.getUser();
    setUser(userData);
    setLoading(false);
  }, [router]);

  const handleLogout = async () => {
    const accessToken = authStorage.getAccessToken();
    
    if (accessToken) {
      try {
        await authService.logout(accessToken);
        toast.success('Sesión cerrada correctamente');
      } catch (error) {
        toast.warning('Sesión cerrada localmente');
      }
    } else {
      console.warn('No access token found');
    }

    authStorage.clearAuth();
    
    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${COLORS.background.gradient.start} 0%, ${COLORS.background.gradient.end} 100%)`,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
          <Typography
            variant="h4"
            sx={{
              color: COLORS.text.light,
              fontWeight: 'bold',
            }}
          >
            Dashboard
          </Typography>
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
            Información del Usuario
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography sx={{ color: COLORS.text.light, opacity: 0.7, fontSize: '0.875rem' }}>
                Email
              </Typography>
              <Typography sx={{ color: COLORS.text.light, fontSize: '1.125rem', fontWeight: 500 }}>
                {user?.email}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ color: COLORS.text.light, opacity: 0.7, fontSize: '0.875rem' }}>
                Rol
              </Typography>
              <Typography sx={{ color: COLORS.text.light, fontSize: '1.125rem', fontWeight: 500 }}>
                {user?.role}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ color: COLORS.text.light, opacity: 0.7, fontSize: '0.875rem' }}>
                Estado
              </Typography>
              <Typography sx={{ color: user?.isActive ? COLORS.state.success : COLORS.state.error, fontSize: '1.125rem', fontWeight: 500 }}>
                {user?.isActive ? 'Activo' : 'Inactivo'}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ color: COLORS.text.light, opacity: 0.7, fontSize: '0.875rem' }}>
                ID
              </Typography>
              <Typography sx={{ color: COLORS.text.light, fontSize: '0.875rem', fontFamily: 'monospace' }}>
                {user?.id}
              </Typography>
            </Box>
          </Box>
        </Card>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography sx={{ color: COLORS.text.light, opacity: 0.7 }}>
            Más funcionalidades próximamente...
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
