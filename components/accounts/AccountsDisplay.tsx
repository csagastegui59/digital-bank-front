'use client';

import { useEffect, useState } from 'react';
import { Box, Card, Grid, Typography, Button } from '@mui/material';
import { COLORS } from '@/constants/colors';
import { Account } from '@/services/account/account-service';
import { toast } from 'react-toastify';
import TransferModal from './TransferModal';
import { accountBlockService } from '@/services/account/account-block-service';
import ConfirmDialog from '../common/ConfirmDialog';

interface AccountsDisplayProps {
    accounts: Account[];
    onBalanceUpdate?: () => void;
}

export default function AccountsDisplay({ accounts, onBalanceUpdate }: AccountsDisplayProps) {
    const [openTransferModal, setOpenTransferModal] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [isRequestingUnblock, setIsRequestingUnblock] = useState(false);

    const handleOpenTransfer = (account: Account) => {
        setSelectedAccount(account);
        setOpenTransferModal(true);
    };

    const handleCloseTransfer = () => {
        setOpenTransferModal(false);
        setSelectedAccount(null);
    };

    const handleTransferSuccess = () => {
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    const getAccessToken = () => {
        if (typeof window === 'undefined') return null;
        const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
        return match ? match[2] : null;
    };

    const handleBlockAccount = (account: Account) => {
        console.log('Intentando bloquear cuenta:', account);
        setSelectedAccount(account);
        setOpenConfirmDialog(true);
    };

    const handleConfirmBlock = async () => {
        const accessToken = getAccessToken();
        if (!accessToken) {
            toast.error('No estás autenticado');
            setOpenConfirmDialog(false);
            return;
        }

        if (!selectedAccount) return;

        try {
            await accountBlockService.blockAccount(selectedAccount.id, accessToken);
            toast.success('Cuenta bloqueada correctamente');
            setOpenConfirmDialog(false);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error: any) {
            toast.error(error.message || 'Error al bloquear la cuenta');
            setOpenConfirmDialog(false);
        }
    };

    const handleCancelBlock = () => {
        setOpenConfirmDialog(false);
        setSelectedAccount(null);
    };

    const handleRequestUnblock = async (account: Account) => {
        if (isRequestingUnblock) return; // Prevenir múltiples clics
        
        const accessToken = getAccessToken();
        if (!accessToken) {
            toast.error('No estás autenticado');
            return;
        }

        setIsRequestingUnblock(true);
        try {
            await accountBlockService.requestUnblock(account.id, accessToken);
            toast.success('Solicitud de desbloqueo enviada correctamente. El administrador revisará tu solicitud.');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error: any) {
            toast.error(error.message || 'Error al solicitar desbloqueo');
            setIsRequestingUnblock(false);
        }
    };

    return (
        <>
            <Grid container spacing={3}>
                {accounts.map((account) => (
                    <Grid key={account.id} component={'div'}>
                        <Card
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 2,
                                p: 3,
                                border: `1px solid ${COLORS.border.card}`,
                            }}
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography sx={{ color: COLORS.text.light, opacity: 0.7, fontSize: '0.75rem' }}>
                                        Número de Cuenta
                                    </Typography>
                                    <Typography sx={{ color: COLORS.text.light, fontSize: '1rem', fontWeight: 600, fontFamily: 'monospace' }}>
                                        {account.accountNumber}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 4 }}>
                                    <Box>
                                        <Typography sx={{ color: COLORS.text.light, opacity: 0.7, fontSize: '0.75rem' }}>
                                            Tipo
                                        </Typography>
                                        <Typography sx={{ color: COLORS.text.light, fontSize: '0.875rem', fontWeight: 500 }}>
                                            {account.type}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography sx={{ color: COLORS.text.light, opacity: 0.7, fontSize: '0.75rem' }}>
                                            Moneda
                                        </Typography>
                                        <Typography sx={{ color: COLORS.text.light, fontSize: '0.875rem', fontWeight: 500 }}>
                                            {account.currency}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography sx={{ color: COLORS.text.light, opacity: 0.7, fontSize: '0.75rem' }}>
                                        Saldo
                                    </Typography>
                                    <Typography sx={{ color: COLORS.state.success, fontSize: '1.5rem', fontWeight: 700 }}>
                                        {account.currency === 'USD' ? '$' : 'S/.'} {parseFloat(account.balance).toFixed(2)}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography sx={{ color: account.isActive ? COLORS.state.success : COLORS.state.error, fontSize: '0.875rem', fontWeight: 500 }}>
                                        {account.isActive ? '● Activa' : account.isUnlockRequest ? '● Desbloqueo Solicitado' : '● Inactiva'}
                                    </Typography>
                                </Box>

                                {/* Action Buttons */}
                                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        disabled={!account.isActive}
                                        onClick={() => handleOpenTransfer(account)}
                                        sx={{
                                            backgroundColor: COLORS.state.success,
                                            color: COLORS.text.light,
                                            fontWeight: 600,
                                            '&:hover': {
                                                backgroundColor: COLORS.state.successHover,
                                            },
                                            '&:disabled': {
                                                backgroundColor: COLORS.button.primary.background,
                                                opacity: 0.5,
                                            },
                                        }}
                                    >
                                        Transferir
                                    </Button>

                                    {account.isActive ? (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => handleBlockAccount(account)}
                                            sx={{
                                                backgroundColor: COLORS.state.error,
                                                color: COLORS.text.light,
                                                fontWeight: 600,
                                                '&:hover': {
                                                    backgroundColor: COLORS.state.errorHover,
                                                },
                                            }}
                                        >
                                            Bloquear
                                        </Button>
                                    ) : account.isUnlockRequest ? (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            disabled
                                            sx={{
                                                backgroundColor: COLORS.button.primary.background,
                                                color: COLORS.text.light,
                                                fontWeight: 600,
                                                opacity: 0.7,
                                            }}
                                        >
                                            Desbloqueo Pendiente
                                        </Button>
                                    ) : (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => handleRequestUnblock(account)}
                                            disabled={isRequestingUnblock}
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
                                            {isRequestingUnblock ? 'Procesando...' : 'Solicitar Desbloqueo'}
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <ConfirmDialog
                open={openConfirmDialog}
                title="Confirmar Bloqueo"
                message={`¿Estás seguro de que deseas bloquear la cuenta ${selectedAccount?.accountNumber}? \n\nEsta acción no se puede deshacer.`}
                onConfirm={handleConfirmBlock}
                onCancel={handleCancelBlock}
                confirmText="Confirmar"
                cancelText="Cancelar"
            />
            <TransferModal
                open={openTransferModal}
                account={selectedAccount}
                onClose={handleCloseTransfer}
                onSuccess={handleTransferSuccess}
            />
        </>
    );
}
