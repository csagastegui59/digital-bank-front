import { ApiError } from '../auth/auth-service';
import { Account } from '../account/account-service';

const API_URL = 'https://digital-bank-0efq.onrender.com';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export const adminAccountService = {
  getBlockedAccounts: async (accessToken: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Account>> => {
    try {
      const response = await fetch(`${API_URL}/admin/accounts/blocked?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(response.status, errorData.message || 'Error al obtener cuentas bloqueadas');
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Error de conexión con el servidor');
    }
  },

  getUnlockRequests: async (accessToken: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Account>> => {
    try {
      const response = await fetch(`${API_URL}/admin/accounts/unlock-requests?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(response.status, errorData.message || 'Error al obtener solicitudes de desbloqueo');
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Error de conexión con el servidor');
    }
  },

  searchAccounts: async (query: string, accessToken: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Account>> => {
    try {
      const response = await fetch(`${API_URL}/admin/accounts/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(response.status, errorData.message || 'Error en la búsqueda');
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Error de conexión con el servidor');
    }
  },

  unblockAccount: async (accountId: string, accessToken: string): Promise<Account> => {
    try {
      const response = await fetch(`${API_URL}/admin/accounts/${accountId}/unblock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(response.status, errorData.message || 'Error al desbloquear cuenta');
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Error de conexión con el servidor');
    }
  },

  getPendingAccounts: async (accessToken: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Account>> => {
    try {
      const response = await fetch(`${API_URL}/accounts/pending?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(response.status, errorData.message || 'Error al obtener cuentas pendientes');
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Error de conexión con el servidor');
    }
  },

  activateAccount: async (accountId: string, accessToken: string): Promise<Account> => {
    try {
      const response = await fetch(`${API_URL}/accounts/${accountId}/activate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(response.status, errorData.message || 'Error al activar cuenta');
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Error de conexión con el servidor');
    }
  },
};
