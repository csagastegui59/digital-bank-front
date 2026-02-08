const API_URL = 'https://digital-bank-0efq.onrender.com';

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
};
