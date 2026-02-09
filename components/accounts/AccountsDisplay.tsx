'use client';

import { useEffect, useState } from 'react';
import { Box, Card, Grid, Typography, Button, Alert, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { COLORS } from '@/constants/colors';
import { Account } from '@/services/account/account-service';
import { toast } from 'react-toastify';
import TransferModal from './TransferModal';
import TransactionsHistoryModal from './TransactionsHistoryModal';
import { accountBlockService } from '@/services/account/account-block-service';
import ConfirmDialog from '../common/ConfirmDialog';

interface AccountsDisplayProps {
    accounts: Account[];
    userId: string;
    onBalanceUpdate?: () => void;
}

export default function AccountsDisplay({ accounts, userId, onBalanceUpdate }: AccountsDisplayProps) {
    const [openTransferModal, setOpenTransferModal] = useState(false);
    const [openTransactionsModal, setOpenTransactionsModal] = useState(false);
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

    const handleOpenTransactions = (account: Account) => {
        setSelectedAccount(account);
        setOpenTransactionsModal(true);
    };

    const handleCloseTransactions = () => {
        setOpenTransactionsModal(false);
        setSelectedAccount(null);
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
        if (isRequestingUnblock) return;
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
                                    <Typography
                                        sx={{
                                            color: account.isPending
                                                ? COLORS.state.warning
                                                : account.isActive
                                                    ? COLORS.state.success
                                                    : COLORS.state.error,
                                            fontSize: '0.875rem',
                                            fontWeight: 500
                                        }}
                                    >
                                        {account.isPending
                                            ? '● Pendiente de Aprobación'
                                            : account.isActive
                                                ? '● Activa'
                                                : account.isUnlockRequest
                                                    ? '● Desbloqueo Solicitado'
                                                    : '● Inactiva'}
                                    </Typography>
                                </Box>

                                {/* Action Buttons */}
                                {!account.isPending && (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                disabled={!account.isActive}
                                                onClick={() => handleOpenTransfer(account)}
                                                sx={{
                                                    backgroundColor: COLORS.state.success,
                                                    color: COLORS.text.light,
                                                    fontWeight: 600,
                                                    fontSize: { xs: '0.6rem', sm: '0.6rem', md: '0.7rem' },
                                                    padding: { xs: '4px', sm: '6px', md: '10px' },
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
                                                        fontSize: { xs: '0.6rem', sm: '0.6rem', md: '0.7rem' },
                                                        padding: { xs: '4px', sm: '6px', md: '10px' },
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
                                                        fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.7rem' },
                                                        padding: { xs: '4px', sm: '6px', md: '10px' },
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
                                                        fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.7rem' },
                                                        padding: { xs: '4px', sm: '6px', md: '10px' },
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

                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => handleOpenTransactions(account)}
                                            sx={{
                                                color: COLORS.text.light,
                                                borderColor: COLORS.text.light,
                                                fontWeight: 600,
                                                fontSize: { xs: '0.6rem', sm: '0.6rem', md: '0.7rem' },
                                                padding: { xs: '4px', sm: '6px', md: '10px' },
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                    borderColor: COLORS.text.light,
                                                },
                                            }}
                                        >
                                            Ver Transacciones
                                        </Button>
                                    </Box>
                                )}

                                {/* Mensaje para cuentas pendientes */}
                                {account.isPending && (
                                    <Box sx={{ mt: 2, p: 2, backgroundColor: COLORS.background.decorative, borderRadius: 2 }}>
                                        <Typography sx={{ color: COLORS.text.light, fontSize: '0.875rem', opacity: 0.8, textAlign: 'center' }}>
                                            ⏳ Tu solicitud está siendo revisada por un administrador
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            
            {/* Test Account Numbers */}
            {accounts.length > 0 && (
                <Alert severity="info" sx={{ mt: 4, borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        💡 Números de cuenta de prueba para transferencias:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection:{ xs: 'column', sm: 'row' }, gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                                0159497042319579
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    navigator.clipboard.writeText('0159497042319579');
                                    toast.success('Número de cuenta copiado');
                                }}
                                sx={{ p: 0.5 }}
                            >
                                <ContentCopyIcon sx={{ fontSize: '0.875rem' }} />
                            </IconButton>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                                0159374243994117
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    navigator.clipboard.writeText('0159374243994117');
                                    toast.success('Número de cuenta copiado');
                                }}
                                sx={{ p: 0.5 }}
                            >
                                <ContentCopyIcon sx={{ fontSize: '0.875rem' }} />
                            </IconButton>
                        </Box>
                    </Box>
                </Alert>
            )}
            
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
            <TransactionsHistoryModal
                open={openTransactionsModal}
                account={selectedAccount}
                userId={userId}
                onClose={handleCloseTransactions}
            />
        </>
    );
}
