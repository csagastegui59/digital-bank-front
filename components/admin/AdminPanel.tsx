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
  Chip,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { COLORS } from '@/constants/colors';
import { Account } from '@/services/account/account-service';
import { adminAccountService, PaginatedResponse } from '@/services/admin/admin-account-service';
import { transactionService, Transaction, TransactionFilters, PaginatedResponse as TransactionPaginatedResponse } from '@/services/transaction/transaction-service';
import { toast } from 'react-toastify';
import ConfirmDialog from '../common/ConfirmDialog';
import DataTable, { DataTableColumn } from '../common/DataTable';

// Helper para obtener token de cookies
const getAccessToken = () => {
  const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
  return match ? match[2] : null;
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
  const [pendingAccounts, setPendingAccounts] = useState<Account[]>([]);
  const [searchResults, setSearchResults] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openActivateDialog, setOpenActivateDialog] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'unlock-requests' | 'blocked' | 'transactions'>('pending');

  // Pagination states
  const [blockedPage, setBlockedPage] = useState(1);
  const [blockedTotalPages, setBlockedTotalPages] = useState(0);
  const [blockedTotal, setBlockedTotal] = useState(0);
  const [unlockRequestsPage, setUnlockRequestsPage] = useState(1);
  const [unlockRequestsTotalPages, setUnlockRequestsTotalPages] = useState(0);
  const [unlockRequestsTotal, setUnlockRequestsTotal] = useState(0);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotalPages, setPendingTotalPages] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(0);

  // Transaction states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currencyTab, setCurrencyTab] = useState<'PEN' | 'USD'>('PEN');
  const [transactionFilters, setTransactionFilters] = useState<TransactionFilters>({
    currency: 'PEN',
  });
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsTotalPages, setTransactionsTotalPages] = useState(0);
  const [transactionsTotal, setTransactionsTotal] = useState(0);

  useEffect(() => {
    loadBlockedAccounts();
    loadUnlockRequests();
    loadPendingAccounts();
  }, []);

  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions(1);
    } else {
      setSearchResults([]);
      setSearchTotalPages(0);
      setSearchPage(1);
      setIsSearchActive(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'transactions') {
      setTransactionFilters(prev => ({ ...prev, currency: currencyTab }));
      loadTransactions(1);
    }
  }, [currencyTab, activeTab]);

  const loadBlockedAccounts = async (page: number = blockedPage) => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      router.push('/');
      return;
    }

    try {
      const response = await adminAccountService.getBlockedAccounts(accessToken, page);
      setBlockedAccounts(response.data);
      setBlockedTotalPages(response.totalPages);
      setBlockedTotal(response.total);
    } catch (error: any) {
      toast.error('Error al cargar cuentas bloqueadas');
    } finally {
      setLoading(false);
    }
  };

  const loadUnlockRequests = async (page: number = unlockRequestsPage) => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      router.push('/');
      return;
    }

    try {
      const response = await adminAccountService.getUnlockRequests(accessToken, page);
      setUnlockRequests(response.data);
      setUnlockRequestsTotalPages(response.totalPages);
      setUnlockRequestsTotal(response.total);
    } catch (error: any) {
      toast.error('Error al cargar solicitudes de desbloqueo');
    }
  };

  const loadPendingAccounts = async (page: number = pendingPage) => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      router.push('/');
      return;
    }

    try {
      const response = await adminAccountService.getPendingAccounts(accessToken, page);
      setPendingAccounts(response.data);
      setPendingTotalPages(response.totalPages);
      setPendingTotal(response.total);
    } catch (error: any) {
      toast.error('Error al cargar cuentas pendientes');
    }
  };

  const handleSearch = async (page: number = 1) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchTotalPages(0);
      setSearchPage(1);
      setIsSearchActive(false);
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      router.push('/');
      return;
    }

    setSearching(true);
    setSearchPage(page);
    try {
      const response = await adminAccountService.searchAccounts(searchQuery, accessToken, page);
      const filteredResults = filterAccountsByTab(response.data, activeTab);
      setSearchResults(filteredResults);
      setSearchTotalPages(response.totalPages);
      setIsSearchActive(true);
    } catch (error: any) {
      toast.error('Error en la búsqueda');
    } finally {
      setSearching(false);
    }
  };

  const filterAccountsByTab = (accounts: Account[], tab: 'pending' | 'unlock-requests' | 'blocked' | 'transactions'): Account[] => {
    if (tab === 'transactions') return accounts;
    switch (tab) {
      case 'pending':
        return accounts.filter(acc => acc.isPending === true);
      case 'unlock-requests':
        return accounts.filter(acc => !acc.isActive && acc.isUnlockRequest === true && !acc.isPending);
      case 'blocked':
        return accounts.filter(acc => !acc.isActive && !acc.isPending);
      default:
        return accounts;
    }
  };

  const getAccountsToDisplay = (): Account[] => {
    if (isSearchActive) {
      return searchResults;
    }

    switch (activeTab) {
      case 'pending':
        return pendingAccounts;
      case 'unlock-requests':
        return unlockRequests;
      case 'blocked':
        return blockedAccounts;
      default:
        return [];
    }
  };

  const getDisplayTitle = (): string => {
    const prefix = isSearchActive ? 'Resultados de Búsqueda - ' : '';
    switch (activeTab) {
      case 'pending':
        return prefix + 'Cuentas Pendientes de Aprobación';
      case 'unlock-requests':
        return prefix + 'Solicitudes de Desbloqueo Pendientes';
      case 'blocked':
        return prefix + 'Todas las Cuentas Bloqueadas';
      default:
        return prefix + 'Cuentas';
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
      if (searchQuery.trim()) {
        handleSearch(searchPage);
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

  const handleActivate = (accountId: string) => {
    setSelectedAccountId(accountId);
    setOpenActivateDialog(true);
  };

  const handleConfirmActivate = async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      router.push('/');
      return;
    }

    if (!selectedAccountId) return;

    try {
      await adminAccountService.activateAccount(selectedAccountId, accessToken);
      toast.success('Cuenta activada correctamente');
      setOpenActivateDialog(false);
      setSelectedAccountId(null);
      loadPendingAccounts();
      if (searchQuery.trim()) {
        handleSearch(searchPage);
      }
    } catch (error: any) {
      toast.error('Error al activar cuenta');
      setOpenActivateDialog(false);
    }
  };

  const handleCancelActivate = () => {
    setOpenActivateDialog(false);
    setSelectedAccountId(null);
  };

  const loadTransactions = async (page: number = transactionsPage) => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      router.push('/');
      return;
    }

    setLoadingTransactions(true);
    setTransactionsPage(page);
    try {
      const response = await transactionService.searchTransactions(
        { currency: currencyTab },
        accessToken,
        page
      );
      setTransactions(response.data);
      setTransactionsTotalPages(response.totalPages);
      setTransactionsTotal(response.total);
    } catch (error: any) {
      toast.error('Error al cargar transacciones');
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleSearchTransactions = async (page: number = 1) => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      router.push('/');
      return;
    }

    const filters = { ...transactionFilters, currency: currencyTab };

    setLoadingTransactions(true);
    setTransactionsPage(page);
    try {
      const response = await transactionService.searchTransactions(filters, accessToken, page);
      setTransactions(response.data);
      setTransactionsTotalPages(response.totalPages);
      setTransactionsTotal(response.total);
    } catch (error: any) {
      toast.error('Error al buscar transacciones');
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleClearTransactionFilters = () => {
    setTransactionFilters({ currency: currencyTab });
    loadTransactions(1);
  };

  const getTransactionsToDisplay = (): Transaction[] => {
    return transactions;
  };

  // Pagination helper functions
  const getTotalPages = (): number => {
    if (activeTab === 'transactions') {
      return transactionsTotalPages;
    } else if (isSearchActive) {
      return searchTotalPages;
    }

    switch (activeTab) {
      case 'pending':
        return pendingTotalPages;
      case 'unlock-requests':
        return unlockRequestsTotalPages;
      case 'blocked':
        return blockedTotalPages;
      default:
        return 0;
    }
  };

  const getCurrentPage = (): number => {
    if (activeTab === 'transactions') {
      return transactionsPage;
    } else if (isSearchActive) {
      return searchPage;
    }

    switch (activeTab) {
      case 'pending':
        return pendingPage;
      case 'unlock-requests':
        return unlockRequestsPage;
      case 'blocked':
        return blockedPage;
      default:
        return 1;
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    if (activeTab === 'transactions') {
      handleSearchTransactions(value);
    } else if (isSearchActive) {
      handleSearch(value);
    } else {
      switch (activeTab) {
        case 'pending':
          setPendingPage(value);
          loadPendingAccounts(value);
          break;
        case 'unlock-requests':
          setUnlockRequestsPage(value);
          loadUnlockRequests(value);
          break;
        case 'blocked':
          setBlockedPage(value);
          loadBlockedAccounts(value);
          break;
      }
    }
  };

  const pendingAccountsColumns: DataTableColumn<Account>[] = [
    {
      header: 'Número de Cuenta',
      render: (account) => (
        <span style={{ fontFamily: 'monospace' }}>{account.accountNumber}</span>
      ),
    },
    {
      header: 'Usuario',
      render: (account) => `${account.owner?.firstname} ${account.owner?.lastname}`,
    },
    {
      header: 'Email',
      key: 'owner.email',
      hideOnMobile: true,
    },
    {
      header: 'Moneda',
      key: 'currency',
      hideOnMobile: true,
    },
    {
      header: 'Saldo',
      render: (account) => (
        <span style={{ color: COLORS.state.success }}>
          {account.currency === 'USD' ? '$' : 'S/.'} {parseFloat(account.balance).toFixed(2)}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      header: 'Estado',
      render: () => (
        <Chip
          label="Pendiente de Aprobación"
          size="small"
          sx={{
            backgroundColor: COLORS.state.warning,
            color: COLORS.text.light,
          }}
        />
      ),
      hideOnMobile: true,
    },
    {
      header: 'Acciones',
      render: (account) => (
        <Button
          size="small"
          variant="contained"
          onClick={() => handleActivate(account.id)}
          sx={{
            backgroundColor: COLORS.state.success,
            color: COLORS.text.light,
            '&:hover': {
              backgroundColor: COLORS.state.successHover,
            },
          }}
        >
          Activar
        </Button>
      ),
    },
  ];

  const renderPendingAccountsTable = (accounts: Account[], title: string) => (
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
      <DataTable
        columns={pendingAccountsColumns}
        data={accounts || []}
        emptyMessage="No hay cuentas pendientes de aprobación"
      />
    </Card>
  );

  const accountsColumns: DataTableColumn<Account>[] = [
    {
      header: 'Número de Cuenta',
      render: (account) => (
        <span style={{ fontFamily: 'monospace' }}>{account.accountNumber}</span>
      ),
    },
    {
      header: 'Usuario',
      render: (account) => `${account.owner?.firstname} ${account.owner?.lastname}`,
    },
    {
      header: 'Email',
      key: 'owner.email',
      hideOnMobile: true,
    },
    {
      header: 'Moneda',
      key: 'currency',
      hideOnMobile: true,
    },
    {
      header: 'Saldo',
      render: (account) => (
        <span style={{ color: COLORS.state.success }}>
          {account.currency === 'USD' ? '$' : 'S/.'} {parseFloat(account.balance).toFixed(2)}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      header: 'Estado',
      render: (account) => (
        <Chip
          label={account.isActive ? 'Activa' : 'Bloqueada'}
          size="small"
          sx={{
            backgroundColor: account.isActive ? COLORS.state.success : COLORS.state.error,
            color: COLORS.text.light,
          }}
        />
      ),
      hideOnMobile: true,
    },
    {
      header: 'Bloqueada',
      render: (account) => (
        <span style={{ fontSize: '0.875rem' }}>
          {account.blockedAt ? new Date(account.blockedAt).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }) : '-'}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      header: 'Solicitud',
      render: (account) => (
        <span style={{ fontSize: '0.875rem' }}>
          {account.unlockRequestedAt ? new Date(account.unlockRequestedAt).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }) : '-'}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      header: 'Acciones',
      render: (account) => (
        account.isActive ? null : (
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
        )
      ),
    },
  ];

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
      <DataTable
        columns={accountsColumns}
        data={accounts || []}
        emptyMessage="No hay cuentas para mostrar"
      />
    </Card>
  );

  const transactionsColumns: DataTableColumn<Transaction>[] = [
    {
      header: 'ID Transacción',
      render: (tx) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
          {tx.id.substring(0, 8)}...
        </span>
      ),
      hideOnMobile: true,
    },
    {
      header: 'Tipo',
      render: (tx) => (
        <Chip
          label={tx.type}
          size="small"
          sx={{
            backgroundColor: COLORS.primary.main,
            color: COLORS.text.light,
          }}
        />
      ),
      hideOnMobile: true,
    },
    {
      header: 'Cuenta Origen',
      render: (tx) => (
        <Box>
          <Typography sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
            {tx.account?.accountNumber || '-'}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', opacity: 0.7 }}>
            {tx.account?.owner ? `${tx.account.owner.firstname} ${tx.account.owner.lastname}` : '-'}
          </Typography>
        </Box>
      ),
      cellSx: { fontSize: '0.875rem' },
    },
    {
      header: 'Cuenta Destino',
      render: (tx) => (
        <Box>
          <Typography sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
            {tx.destinationAccount?.accountNumber || '-'}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', opacity: 0.7 }}>
            {tx.destinationAccount?.owner ? `${tx.destinationAccount.owner.firstname} ${tx.destinationAccount.owner.lastname}` : '-'}
          </Typography>
        </Box>
      ),
      cellSx: { fontSize: '0.875rem' },
    },
    {
      header: 'Monto',
      render: (tx) => (
        <span style={{ color: COLORS.state.success, fontWeight: 'bold' }}>
          {tx.account?.currency === 'USD' ? '$' : 'S/.'} {parseFloat(tx.amount).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Tasa de Cambio',
      render: (tx) => tx.exchangeRate ? parseFloat(tx.exchangeRate).toFixed(4) : '-',
      hideOnMobile: true,
    },
    {
      header: 'Estado',
      render: (tx) => (
        <Chip
          label={tx.status}
          size="small"
          sx={{
            backgroundColor: tx.status === 'POSTED' ? COLORS.state.success :
              tx.status === 'PENDING' ? COLORS.state.warning : COLORS.state.error,
            color: COLORS.text.light,
          }}
        />
      ),
      hideOnMobile: true,
    },
    {
      header: 'Fecha',
      render: (tx) => (
        <span style={{ fontSize: '0.875rem' }}>
          {new Date(tx.createdAt).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      header: 'Descripción',
      render: (tx) => (
        <span style={{ fontSize: '0.875rem' }}>{tx.description || '-'}</span>
      ),
      hideOnMobile: true,
    },
  ];

  const renderTransactionsTable = (txs: Transaction[], title: string) => (
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
      <DataTable
        columns={transactionsColumns}
        data={txs || []}
        emptyMessage="No hay transacciones para mostrar"
      />
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
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ color: COLORS.text.light, fontWeight: 'bold' }}>
            Panel de Administración
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.text.light, opacity: 0.8, mt: 0.5 }}>
            Bienvenido, {user.firstname} {user.lastname}
          </Typography>
        </Box>

        {/* Tabs for filtering */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant={activeTab === 'pending' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('pending')}
            sx={{
              color: activeTab === 'pending' ? COLORS.text.dark : COLORS.text.light,
              backgroundColor: activeTab === 'pending' ? COLORS.button.primary.background : 'transparent',
              borderColor: COLORS.text.light,
              '&:hover': {
                backgroundColor: activeTab === 'pending' ? COLORS.button.primary.hover : 'rgba(255, 255, 255, 0.1)',
                borderColor: COLORS.text.light,
              },
            }}
          >
            Cuentas Pendientes
          </Button>
          <Button
            variant={activeTab === 'unlock-requests' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('unlock-requests')}
            sx={{
              color: activeTab === 'unlock-requests' ? COLORS.text.dark : COLORS.text.light,
              backgroundColor: activeTab === 'unlock-requests' ? COLORS.button.primary.background : 'transparent',
              borderColor: COLORS.text.light,
              '&:hover': {
                backgroundColor: activeTab === 'unlock-requests' ? COLORS.button.primary.hover : 'rgba(255, 255, 255, 0.1)',
                borderColor: COLORS.text.light,
              },
            }}
          >
            Solicitudes de Desbloqueo
          </Button>
          <Button
            variant={activeTab === 'blocked' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('blocked')}
            sx={{
              color: activeTab === 'blocked' ? COLORS.text.dark : COLORS.text.light,
              backgroundColor: activeTab === 'blocked' ? COLORS.button.primary.background : 'transparent',
              borderColor: COLORS.text.light,
              '&:hover': {
                backgroundColor: activeTab === 'blocked' ? COLORS.button.primary.hover : 'rgba(255, 255, 255, 0.1)',
                borderColor: COLORS.text.light,
              },
            }}
          >
            Todas las Cuentas Bloqueadas
          </Button>
          <Button
            variant={activeTab === 'transactions' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('transactions')}
            sx={{
              color: activeTab === 'transactions' ? COLORS.text.dark : COLORS.text.light,
              backgroundColor: activeTab === 'transactions' ? COLORS.button.primary.background : 'transparent',
              borderColor: COLORS.text.light,
              '&:hover': {
                backgroundColor: activeTab === 'transactions' ? COLORS.button.primary.hover : 'rgba(255, 255, 255, 0.1)',
                borderColor: COLORS.text.light,
              },
            }}
          >
            Transacciones
          </Button>
        </Box>
        {/* Search Card - Only show when NOT in transactions tab */}
        {activeTab !== 'transactions' && (
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(1);
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
                onClick={() => handleSearch(1)}
                disabled={searching}
                sx={{
                  backgroundColor: COLORS.state.success,
                  color: COLORS.text.light,
                  minWidth: {sm: '40px', md: '100px'},
                  padding: { xs: '8px', md: '8px 16px' },
                  fontSize: { xs: '0.7rem', md: '1rem' },
                  '&:hover': {
                    backgroundColor: COLORS.state.successHover,
                  },
                }}
              >
                {searching ? <CircularProgress size={24} sx={{ color: COLORS.text.light }} /> : 'Buscar'}
              </Button>
            </Box>
          </Card>
        )}
        {/* Currency Tabs - Only show when transactions tab is active */}
        {activeTab === 'transactions' && (
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <Button
              variant={currencyTab === 'PEN' ? 'contained' : 'outlined'}
              onClick={() => setCurrencyTab('PEN')}
              sx={{
                color: currencyTab === 'PEN' ? COLORS.text.dark : COLORS.text.light,
                backgroundColor: currencyTab === 'PEN' ? COLORS.state.success : 'transparent',
                borderColor: COLORS.text.light,
                '&:hover': {
                  backgroundColor: currencyTab === 'PEN' ? COLORS.state.successHover : 'rgba(255, 255, 255, 0.1)',
                  borderColor: COLORS.text.light,
                },
              }}
            >
              Transacciones en PEN
            </Button>
            <Button
              variant={currencyTab === 'USD' ? 'contained' : 'outlined'}
              onClick={() => setCurrencyTab('USD')}
              sx={{
                color: currencyTab === 'USD' ? COLORS.text.dark : COLORS.text.light,
                backgroundColor: currencyTab === 'USD' ? COLORS.state.success : 'transparent',
                borderColor: COLORS.text.light,
                '&:hover': {
                  backgroundColor: currencyTab === 'USD' ? COLORS.state.successHover : 'rgba(255, 255, 255, 0.1)',
                  borderColor: COLORS.text.light,
                },
              }}
            >
              Transacciones en USD
            </Button>
          </Box>
        )}

        {/* Transaction Filters - Only show when transactions tab is active */}
        {activeTab === 'transactions' && (
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
              Filtros de Búsqueda
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
              <TextField
                label="ID de Transacción"
                value={transactionFilters.transactionId || ''}
                onChange={(e) => setTransactionFilters({ ...transactionFilters, transactionId: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: COLORS.text.light,
                    '& fieldset': { borderColor: COLORS.border.card },
                    '&:hover fieldset': { borderColor: COLORS.text.light },
                    '&.Mui-focused fieldset': { borderColor: COLORS.primary.main },
                  },
                  '& .MuiInputLabel-root': { color: COLORS.text.light },
                }}
              />
              <TextField
                label="ID de Cuenta o Número de Cuenta"
                value={transactionFilters.accountId || ''}
                onChange={(e) => setTransactionFilters({ ...transactionFilters, accountId: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: COLORS.text.light,
                    '& fieldset': { borderColor: COLORS.border.card },
                    '&:hover fieldset': { borderColor: COLORS.text.light },
                    '&.Mui-focused fieldset': { borderColor: COLORS.primary.main },
                  },
                  '& .MuiInputLabel-root': { color: COLORS.text.light },
                }}
              />
              <TextField
                label="ID de Usuario"
                value={transactionFilters.userId || ''}
                onChange={(e) => setTransactionFilters({ ...transactionFilters, userId: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: COLORS.text.light,
                    '& fieldset': { borderColor: COLORS.border.card },
                    '&:hover fieldset': { borderColor: COLORS.text.light },
                    '&.Mui-focused fieldset': { borderColor: COLORS.primary.main },
                  },
                  '& .MuiInputLabel-root': { color: COLORS.text.light },
                }}
              />
              <TextField
                label="Monto Mínimo"
                type="number"
                value={transactionFilters.minAmount || ''}
                onChange={(e) => setTransactionFilters({ ...transactionFilters, minAmount: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: COLORS.text.light,
                    '& fieldset': { borderColor: COLORS.border.card },
                    '&:hover fieldset': { borderColor: COLORS.text.light },
                    '&.Mui-focused fieldset': { borderColor: COLORS.primary.main },
                  },
                  '& .MuiInputLabel-root': { color: COLORS.text.light },
                }}
              />
              <TextField
                label="Monto Máximo"
                type="number"
                value={transactionFilters.maxAmount || ''}
                onChange={(e) => setTransactionFilters({ ...transactionFilters, maxAmount: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: COLORS.text.light,
                    '& fieldset': { borderColor: COLORS.border.card },
                    '&:hover fieldset': { borderColor: COLORS.text.light },
                    '&.Mui-focused fieldset': { borderColor: COLORS.primary.main },
                  },
                  '& .MuiInputLabel-root': { color: COLORS.text.light },
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => handleSearchTransactions(1)}
                disabled={loadingTransactions}
                sx={{
                  backgroundColor: COLORS.state.success,
                  color: COLORS.text.light,
                  '&:hover': { backgroundColor: COLORS.state.successHover },
                }}
              >
                {loadingTransactions ? <CircularProgress size={24} sx={{ color: COLORS.text.light }} /> : 'Buscar'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearTransactionFilters}
                sx={{
                  borderColor: COLORS.text.light,
                  color: COLORS.text.light,
                  '&:hover': {
                    borderColor: COLORS.text.light,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Limpiar Filtros
              </Button>
            </Box>
          </Card>
        )}

        {/* Content Display */}
        {activeTab === 'transactions' ? (
          loadingTransactions ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: COLORS.text.light }} />
            </Box>
          ) : (
            <>
              {renderTransactionsTable(
                getTransactionsToDisplay(),
                `Transacciones ${currencyTab} (${currencyTab === 'PEN' ? 'Soles' : 'Dólares'})`
              )}
            </>
          )
        ) : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: COLORS.text.light }} />
          </Box>
        ) : (
          <>
            {activeTab === 'pending' ? (
              renderPendingAccountsTable(getAccountsToDisplay(), getDisplayTitle())
            ) : (
              renderAccountsTable(getAccountsToDisplay(), getDisplayTitle())
            )}
          </>
        )}

        {/* Pagination */}
        {!loading && !loadingTransactions && getTotalPages() > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={getTotalPages()}
              page={getCurrentPage()}
              onChange={handlePageChange}
              color="primary"
              size="large"
              sx={{
                '& .MuiPaginationItem-root': {
                  color: COLORS.text.light,
                  borderColor: COLORS.text.light,
                },
                '& .Mui-selected': {
                  backgroundColor: COLORS.primary.main,
                  color: COLORS.text.light,
                },
              }}
            />
          </Box>
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

        <ConfirmDialog
          open={openActivateDialog}
          title="Activar Cuenta"
          message="¿Estás seguro de que deseas activar esta cuenta? La cuenta será creada y el usuario podrá comenzar a utilizarla."
          onConfirm={handleConfirmActivate}
          onCancel={handleCancelActivate}
          confirmText="Activar"
          cancelText="Cancelar"
        />
      </Container>
    </Box>
  );
}
