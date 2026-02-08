'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import { COLORS } from '@/constants/colors';
import { Account } from '@/services/account/account-service';
import { adminAccountService } from '@/services/admin/admin-account-service';
import { toast } from 'react-toastify';
import ConfirmDialog from '../common/ConfirmDialog';

// Helper para obtener token de cookies
const getAccessToken = () => {
  const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
  return match ? match[2] : null;
};

// Helper para limpiar cookies
const clearCookies = () => {
  document.cookie = 'access_token=; path=/; max-age=0';
  document.cookie = 'refresh_token=; path=/; max-age=0';
  document.cookie = 'user=; path=/; max-age=0';
};

interface AdminPanelProps {
  user: {
    id: string;
    email: string;
    role: string;
    firstname: string;
    lastname: string;
  };
}

export default function AdminPanel({ user }: AdminPanelProps) {
  const router = useRouter();
  const [blockedAccounts, setBlockedAccounts] = useState<Account[]>([]);
  const [unlockRequests, setUnlockRequests] = useState<Account[]>([]);
  const [searchResults, setSearchResults] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'blocked' | 'unlock-requests'>('unlock-requests');

  useEffect(() => {
    loadBlockedAccounts();
    loadUnlockRequests();
  }, []);

  const loadBlockedAccounts = async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      router.push('/');
      return;
    }

    try {
      const accounts = await adminAccountService.getBlockedAccounts(accessToken);
      setBlockedAccounts(accounts);
    } catch (error: any) {
      toast.error('Error al cargar cuentas bloqueadas');
    } finally {
      setLoading(false);
    }
  };

  const loadUnlockRequests = async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      router.push('/');
      return;
    }

    try {
      const accounts = await adminAccountService.getUnlockRequests(accessToken);
      setUnlockRequests(accounts);
    } catch (error: any) {
      toast.error('Error al cargar solicitudes de desbloqueo');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      router.push('/');
      return;
    }

    setSearching(true);
    try {
      const results = await adminAccountService.searchAccounts(searchQuery, accessToken);
      setSearchResults(results);
    } catch (error: any) {
      toast.error('Error en la búsqueda');
    } finally {
      setSearching(false);
    }
  };

  const handleUnblock = (accountId: string) => {
    setSelectedAccountId(accountId);
    setOpenConfirmDialog(true);
  };

  const handleConfirmUnblock = async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      router.push('/');
      return;
    }

    if (!selectedAccountId) return;

    try {
      await adminAccountService.unblockAccount(selectedAccountId, accessToken);
      toast.success('Cuenta desbloqueada correctamente');
      setOpenConfirmDialog(false);
      setSelectedAccountId(null);
      loadBlockedAccounts();
      loadUnlockRequests();
      if (searchQuery) {
        handleSearch();
      }
    } catch (error: any) {
      toast.error('Error al desbloquear cuenta');
      setOpenConfirmDialog(false);
    }
  };

  const handleCancelUnblock = () => {
    setOpenConfirmDialog(false);
    setSelectedAccountId(null);
  };

  const handleLogout = () => {
    clearCookies();
    router.push('/');
  };

  const renderAccountsTable = (accounts: Account[], title: string) => (
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
        {title}
      </Typography>

      {accounts.length === 0 ? (
        <Typography sx={{ color: COLORS.text.light, opacity: 0.7 }}>
          No hay cuentas para mostrar
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: COLORS.text.light, fontWeight: 'bold' }}>Número de Cuenta</TableCell>
                <TableCell sx={{ color: COLORS.text.light, fontWeight: 'bold' }}>Usuario</TableCell>
                <TableCell sx={{ color: COLORS.text.light, fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: COLORS.text.light, fontWeight: 'bold' }}>Moneda</TableCell>
                <TableCell sx={{ color: COLORS.text.light, fontWeight: 'bold' }}>Saldo</TableCell>
                <TableCell sx={{ color: COLORS.text.light, fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ color: COLORS.text.light, fontWeight: 'bold' }}>Bloqueada</TableCell>
                <TableCell sx={{ color: COLORS.text.light, fontWeight: 'bold' }}>Solicitud</TableCell>
                <TableCell sx={{ color: COLORS.text.light, fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell sx={{ color: COLORS.text.light, fontFamily: 'monospace' }}>
                    {account.accountNumber}
                  </TableCell>
                  <TableCell sx={{ color: COLORS.text.light }}>
                    {account.owner?.firstname} {account.owner?.lastname}
                  </TableCell>
                  <TableCell sx={{ color: COLORS.text.light }}>{account.owner?.email}</TableCell>
                  <TableCell sx={{ color: COLORS.text.light }}>{account.currency}</TableCell>
                  <TableCell sx={{ color: COLORS.state.success }}>
                    {account.currency === 'USD' ? '$' : 'S/.'} {parseFloat(account.balance).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={account.isActive ? 'Activa' : 'Bloqueada'}
                      size="small"
                      sx={{
                        backgroundColor: account.isActive ? COLORS.state.success : COLORS.state.error,
                        color: COLORS.text.light,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: COLORS.text.light, fontSize: '0.875rem' }}>
                    {account.blockedAt ? new Date(account.blockedAt).toLocaleString('es-ES', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </TableCell>
                  <TableCell sx={{ color: COLORS.text.light, fontSize: '0.875rem' }}>
                    {account.unlockRequestedAt ? new Date(account.unlockRequestedAt).toLocaleString('es-ES', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </TableCell>
                  <TableCell>
                    {!account.isActive && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleUnblock(account.id)}
                        sx={{
                          backgroundColor: COLORS.state.success,
                          color: COLORS.text.light,
                          '&:hover': {
                            backgroundColor: COLORS.state.successHover,
                          },
                        }}
                      >
                        Desbloquear
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${COLORS.background.gradient.start} 0%, ${COLORS.background.gradient.end} 100%)`,
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ color: COLORS.text.light, fontWeight: 'bold' }}>
              Panel de Administración
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.text.light, opacity: 0.8, mt: 0.5 }}>
              Bienvenido, {user.firstname} {user.lastname}
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

        {/* Search Card */}
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
            Buscar Cuentas
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Buscar por ID de cuenta, ID de usuario o número de cuenta"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: COLORS.text.light,
                  '& fieldset': {
                    borderColor: COLORS.border.card,
                  },
                  '&:hover fieldset': {
                    borderColor: COLORS.button.primary.background,
                  },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={searching}
              sx={{
                backgroundColor: COLORS.button.primary.background,
                color: COLORS.text.light,
                minWidth: 120,
                '&:hover': {
                  backgroundColor: COLORS.button.primary.hover,
                },
              }}
            >
              {searching ? <CircularProgress size={24} sx={{ color: COLORS.text.light }} /> : 'Buscar'}
            </Button>
          </Box>
        </Card>

        {/* Tabs for filtering */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Button
            variant={activeTab === 'unlock-requests' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('unlock-requests')}
            sx={{
              color: activeTab === 'unlock-requests' ? COLORS.text.light : COLORS.text.light,
              backgroundColor: activeTab === 'unlock-requests' ? COLORS.button.primary.background : 'transparent',
              borderColor: COLORS.text.light,
              '&:hover': {
                backgroundColor: activeTab === 'unlock-requests' ? COLORS.button.primary.hover : 'rgba(255, 255, 255, 0.1)',
                borderColor: COLORS.text.light,
              },
            }}
          >
            Solicitudes de Desbloqueo ({unlockRequests.length})
          </Button>
          <Button
            variant={activeTab === 'blocked' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('blocked')}
            sx={{
              color: activeTab === 'blocked' ? COLORS.text.light : COLORS.text.light,
              backgroundColor: activeTab === 'blocked' ? COLORS.button.primary.background : 'transparent',
              borderColor: COLORS.text.light,
              '&:hover': {
                backgroundColor: activeTab === 'blocked' ? COLORS.button.primary.hover : 'rgba(255, 255, 255, 0.1)',
                borderColor: COLORS.text.light,
              },
            }}
          >
            Todas las Cuentas Bloqueadas ({blockedAccounts.length})
          </Button>
        </Box>

        {/* Search Results */}
        {searchQuery && searchResults.length > 0 && renderAccountsTable(searchResults, 'Resultados de Búsqueda')}

        {/* Blocked Accounts */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: COLORS.text.light }} />
          </Box>
        ) : (
          <>
            {activeTab === 'unlock-requests' && renderAccountsTable(unlockRequests, 'Solicitudes de Desbloqueo Pendientes')}
            {activeTab === 'blocked' && renderAccountsTable(blockedAccounts, 'Todas las Cuentas Bloqueadas')}
          </>
        )}

        <ConfirmDialog
          open={openConfirmDialog}
          title="Desbloquear Cuenta"
          message="¿Estás seguro de que deseas desbloquear esta cuenta? El usuario podrá volver a realizar transferencias."
          onConfirm={handleConfirmUnblock}
          onCancel={handleCancelUnblock}
          confirmText="Desbloquear"
          cancelText="Cancelar"
        />
      </Container>
    </Box>
  );
}
