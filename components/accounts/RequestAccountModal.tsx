'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
} from '@mui/material';
import { COLORS } from '@/constants/colors';
import { Currency, accountService } from '@/services/account/account-service';
import { toast } from 'react-toastify';

interface RequestAccountModalProps {
  open: boolean;
  availableCurrencies: Currency[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function RequestAccountModal({
  open,
  availableCurrencies,
  onClose,
  onSuccess,
}: RequestAccountModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(false);

  const getAccessToken = () => {
    const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
    return match ? match[2] : null;
  };

  const handleClose = () => {
    setSelectedCurrency(null);
    onClose();
  };

  const handleRequest = async () => {
    if (!selectedCurrency) {
      toast.error('Selecciona una moneda');
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      toast.error('No estás autenticado');
      return;
    }

    setLoading(true);
    try {
      await accountService.requestAccount(selectedCurrency, accessToken);
      toast.success('Solicitud enviada correctamente. El administrador revisará tu solicitud.');
      handleClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Error al solicitar cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: COLORS.background.card,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${COLORS.border.card}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          color: COLORS.text.light,
          fontWeight: 'bold',
          borderBottom: `1px solid ${COLORS.border.card}`,
        }}
      >
        Solicitar Nueva Cuenta
      </DialogTitle>
      <DialogContent sx={{ mt: 3 }}>
        <Typography sx={{ color: COLORS.text.light, mb: 3 }}>
          Selecciona la moneda para tu nueva cuenta:
        </Typography>

        <RadioGroup
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
        >
          {availableCurrencies.map((currency) => (
            <FormControlLabel
              key={currency}
              value={currency}
              control={
                <Radio
                  sx={{
                    color: COLORS.text.light,
                    '&.Mui-checked': {
                      color: COLORS.primary.main,
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography sx={{ color: COLORS.text.light, fontWeight: 600 }}>
                    {currency === Currency.USD ? 'Dólares (USD)' : 'Soles (PEN)'}
                  </Typography>
                  <Typography sx={{ color: COLORS.text.light, opacity: 0.7, fontSize: '0.875rem' }}>
                    {currency === Currency.USD
                      ? 'Cuenta en moneda estadounidense'
                      : 'Cuenta en moneda nacional'}
                  </Typography>
                </Box>
              }
              sx={{
                backgroundColor: COLORS.background.decorative,
                borderRadius: 2,
                p: 2,
                mb: 2,
                border: `1px solid ${COLORS.border.card}`,
                '&:hover': {
                  backgroundColor: COLORS.background.card,
                },
              }}
            />
          ))}
        </RadioGroup>

        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: COLORS.background.decorative,
            borderRadius: 2,
            border: `1px solid ${COLORS.border.card}`,
          }}
        >
          <Typography sx={{ color: COLORS.text.light, fontSize: '0.875rem', opacity: 0.8 }}>
            ℹ️ Tu solicitud será revisada por un administrador. Recibirás una notificación cuando tu cuenta sea activada.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ borderTop: `1px solid ${COLORS.border.card}`, px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: COLORS.text.light,
            '&:hover': {
              backgroundColor: COLORS.background.decorative,
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleRequest}
          disabled={loading || !selectedCurrency}
          variant="contained"
          sx={{
            backgroundColor: COLORS.state.success,
            color: COLORS.text.light,
            fontWeight: 600,
            '&:hover': {
              backgroundColor: COLORS.state.successHover,
            },
            '&:disabled': {
              opacity: 0.5,
            },
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: COLORS.text.light }} /> : 'Solicitar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
