'use client';

import { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, IconButton, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { COLORS } from '@/constants/colors';
import { Account } from '@/services/account/account-service';
import { transactionService } from '@/services/transaction/transaction-service';
import { toast } from 'react-toastify';

interface TransferModalProps {
  open: boolean;
  account: Account | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransferModal({ open, account, onClose, onSuccess }: TransferModalProps) {
  const [destinationAccountNumber, setDestinationAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setDestinationAccountNumber('');
    setAmount('');
    setDescription('');
    onClose();
  };

  const handleTransfer = async () => {
    if (!account) return;

    if (!account.isActive) {
      toast.error('No puedes enviar fondos desde una cuenta bloqueada. Solicita un desbloqueo.');
      return;
    }

    if (!destinationAccountNumber.trim()) {
      toast.error('Ingresa el número de cuenta destino');
      return;
    }

    if (destinationAccountNumber.length !== 16) {
      toast.error('El número de cuenta debe tener 16 dígitos');
      return;
    }

    if (destinationAccountNumber === account.accountNumber) {
      toast.error('No puedes transferir a la misma cuenta de origen');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Ingresa un monto válido mayor a 0');
      return;
    }

    if (amountNum > parseFloat(account.balance)) {
      toast.error('Saldo insuficiente');
      return;
    }

    setLoading(true);

    try {
      await transactionService.transfer({
        fromAccountId: account.id,
        toAccountNumber: destinationAccountNumber,
        amount: amountNum,
        description: description || undefined,
      });

      toast.success('¡Transferencia realizada correctamente!');
      handleClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Error al realizar la transferencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ backgroundColor: COLORS.background.card, color: COLORS.text.dark, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Realizar Transferencia
        <IconButton onClick={handleClose} size="small" sx={{ color: COLORS.text.dark }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: COLORS.background.card, pt: 3 }}>
        {/* Test Account Numbers */}
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            ¿Necesitas un número de cuenta?
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
              Prueba con: 0159374243994117
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ContentCopyIcon sx={{ fontSize: '0.875rem' }} />}
              onClick={() => {
                navigator.clipboard.writeText('0159374243994117');
                toast.success('Número de cuenta copiado');
              }}
              sx={{
                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                py: 0.5,
                px: 1,
                textTransform: 'none',
              }}
            >
              Copiar
            </Button>
          </Box>
        </Alert>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography sx={{ color: COLORS.text.dark, mb: 1, fontSize: '0.875rem' }}>
              Cuenta Origen
            </Typography>
            <Typography sx={{ color: COLORS.text.dark, fontWeight: 600, fontFamily: 'monospace' }}>
              {account?.accountNumber}
            </Typography>
            <Typography sx={{ color: COLORS.state.success, fontSize: '1.2rem', fontWeight: 600, mt: 0.5 }}>
              Saldo: {account?.currency === 'USD' ? '$' : 'S/.'} {parseFloat(account?.balance || '0').toFixed(2)}
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Número de Cuenta Destino"
            value={destinationAccountNumber}
            onChange={(e) => setDestinationAccountNumber(e.target.value)}
            placeholder="1234567890123456"
            inputProps={{ maxLength: 16 }}
            helperText="Ingresa el número de cuenta de 16 dígitos"
          />
          <TextField
            fullWidth
            label="Monto"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
          <TextField
            fullWidth
            label="Descripción (Opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Motivo de la transferencia"
            multiline
            rows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: COLORS.background.card, p: 3 }}>
        <Button onClick={handleClose} sx={{ color: COLORS.text.light }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleTransfer}
          disabled={loading}
          sx={{
            backgroundColor: COLORS.state.success,
            color: COLORS.text.light,
            minWidth: 120,
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: COLORS.text.light }} /> : 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
