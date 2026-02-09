const API_URL = 'https://digital-bank-0efq.onrender.com';
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface TransferRequest {
  fromAccountId: string;
  toAccountNumber: string;
  amount: number;
  description?: string;
}

export interface Transaction {
  id: string;
  idempotencyKey: string;
  accountId: string;
  destinationAccountId: string;
  type: string;
  amount: string;
  exchangeRate?: string;
  status: string;
  description: string;
  createdAt: Date;
  account?: {
    id: string;
    accountNumber: string;
    currency: string;
    owner?: {
      id: string;
      firstname: string;
      lastname: string;
      email: string;
    };
  };
  destinationAccount?: {
    id: string;
    accountNumber: string;
    currency: string;
    owner?: {
      id: string;
      firstname: string;
      lastname: string;
      email: string;
    };
  };
}

export interface TransactionFilters {
  transactionId?: string;
  accountId?: string;
  userId?: string;
  minAmount?: string;
  maxAmount?: string;
  currency?: 'PEN' | 'USD';
}

const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
  return match ? match[2] : null;
};

export const transactionService = {
  async transfer(data: TransferRequest): Promise<Transaction> {
    const accessToken = getAccessToken();

    const response = await fetch(`${API_URL}/transactions/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al realizar la transferencia');
    }

    return response.json();
  },

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    const accessToken = getAccessToken();

    const response = await fetch(`${API_URL}/transactions/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener transacciones');
    }

    return response.json();
  },

  async getAllTransactions(accessToken: string): Promise<Transaction[]> {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener transacciones');
    }

    return response.json();
  },

  async searchTransactions(filters: TransactionFilters, accessToken: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams();
    
    if (filters.transactionId) params.append('transactionId', filters.transactionId);
    if (filters.accountId) params.append('accountId', filters.accountId);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.minAmount) params.append('minAmount', filters.minAmount);
    if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
    if (filters.currency) params.append('currency', filters.currency);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`${API_URL}/transactions/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al buscar transacciones');
    }

    return response.json();
  },
};
