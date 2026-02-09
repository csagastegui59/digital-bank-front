'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { COLORS } from '@/constants/colors';
import { Account } from '@/services/account/account-service';
import { transactionService, Transaction } from '@/services/transaction/transaction-service';
import { toast } from 'react-toastify';

interface TransactionsHistoryModalProps {
  open: boolean;
  account: Account | null;
  userId: string;
  onClose: () => void;
}

export default function TransactionsHistoryModal({
  open,
  account,
  userId,
  onClose,
}: TransactionsHistoryModalProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && account) {
      loadTransactions();
    }
  }, [open, account]);

  const loadTransactions = async () => {
    if (!account) return;

    setLoading(true);
    try {
      const allTransactions = await transactionService.getUserTransactions(userId);

      const accountTransactions = allTransactions.filter(
        (t) => t.accountId === account.id || t.destinationAccountId === account.id
      );

      setTransactions(accountTransactions);
    } catch (error: any) {
      toast.error('Error al cargar transacciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionType = (transaction: Transaction) => {
    if (transaction.accountId === account?.id) {
      return 'Enviado';
    } else {
      return 'Recibido';
    }
  };

  const getAmountColor = (transaction: Transaction) => {
    if (transaction.accountId === account?.id) {
      return COLORS.state.error;
    } else {
      return COLORS.state.success;
    }
  };

  const getAmountPrefix = (transaction: Transaction) => {
    if (transaction.accountId === account?.id) {
      return '-';
    } else {
      return '+';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
        Historial de Transacciones
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {account && (
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ color: COLORS.text.light, opacity: 0.7, fontSize: '0.875rem' }}>
              Cuenta: {account.accountNumber}
            </Typography>
            <Typography sx={{ color: COLORS.text.light, fontSize: '1rem', fontWeight: 600 }}>
              {account.currency === 'USD' ? '$' : 'S/.'} {parseFloat(account.balance).toFixed(2)}
            </Typography>
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: COLORS.primary.main }} />
          </Box>
        ) : transactions.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography sx={{ color: COLORS.text.light, opacity: 0.7 }}>
              No hay transacciones para esta cuenta
            </Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: COLORS.background.card,
              maxHeight: 400,
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: COLORS.text.light, fontWeight: 'bold', backgroundColor: COLORS.primary.dark }}>
                    Fecha
                  </TableCell>
                  <TableCell sx={{ color: COLORS.text.light, fontWeight: 'bold', backgroundColor: COLORS.primary.dark }}>
                    Tipo
                  </TableCell>
                  <TableCell sx={{ color: COLORS.text.light, fontWeight: 'bold', backgroundColor: COLORS.primary.dark }}>
                    Descripción
                  </TableCell>
                  <TableCell align="right" sx={{ color: COLORS.text.light, fontWeight: 'bold', backgroundColor: COLORS.primary.dark }}>
                    Monto
                  </TableCell>

                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell sx={{ color: COLORS.text.light, fontSize: '0.875rem' }}>
                      {formatDate(transaction.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getTransactionType(transaction)}
                        size="small"
                        sx={{
                          backgroundColor: getAmountColor(transaction),
                          color: COLORS.text.light,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: COLORS.text.light, fontSize: '0.875rem' }}>
                      {transaction.description || '-'}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: getAmountColor(transaction),
                        fontWeight: 700,
                        fontSize: '1rem',
                      }}
                    >
                      {getAmountPrefix(transaction)}
                      {account?.currency === 'USD' ? '$' : 'S/.'} {parseFloat(transaction.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions sx={{ borderTop: `1px solid ${COLORS.border.card}`, px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            color: COLORS.text.light,
            borderColor: COLORS.text.light,
            '&:hover': {
              backgroundColor: COLORS.background.decorative,
            },
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
