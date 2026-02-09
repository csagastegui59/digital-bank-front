'use client';

import { useState } from 'react';
import { Box, Container, Typography, Card, Button } from '@mui/material';
import { COLORS } from '@/constants/colors';
import { Account, Currency } from '@/services/account/account-service';
import AccountsDisplay from '@/components/accounts/AccountsDisplay';
import RequestAccountModal from '@/components/accounts/RequestAccountModal';

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
  const [openRequestModal, setOpenRequestModal] = useState(false);

  const getAvailableCurrencies = (): Currency[] => {
    // Obtener todas las monedas que el usuario ya tiene (activas, pendientes o bloqueadas)
    const existingCurrencies = accounts.map(acc => acc.currency);
    
    const allCurrencies = [Currency.USD, Currency.PEN];
    return allCurrencies.filter(currency => !existingCurrencies.includes(currency));
  };

  const availableCurrencies = getAvailableCurrencies();
  const canRequestAccount = user.role === 'CUSTOMER' && availableCurrencies.length > 0;

  const handleRequestSuccess = () => {
    setTimeout(() => {
      window.location.reload();
    }, 1500);
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
        <Box sx={{ mb: 4 }}>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ color: COLORS.text.light, fontWeight: 'bold' }}>
              Mis Cuentas
            </Typography>
            
            {canRequestAccount && (
              <Button
                variant="contained"
                onClick={() => setOpenRequestModal(true)}
                sx={{
                  backgroundColor: COLORS.state.success,
                  color: COLORS.text.light,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: COLORS.state.successHover,
                  },
                }}
              >
                Solicitar Nueva Cuenta
              </Button>
            )}
          </Box>
          
          {accounts.length === 0 ? (
            <Typography sx={{ color: COLORS.text.light, opacity: 0.7 }}>
              No tienes cuentas registradas
            </Typography>
          ) : (
            <AccountsDisplay accounts={accounts} userId={user.id} />
          )}
        </Card>

        <RequestAccountModal
          open={openRequestModal}
          availableCurrencies={availableCurrencies}
          onClose={() => setOpenRequestModal(false)}
          onSuccess={handleRequestSuccess}
        />
      </Container>
    </Box>
  );
}
