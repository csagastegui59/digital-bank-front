import { ApiError } from '../auth/auth-service';

const API_URL = 'https://digital-bank-0efq.onrender.com';

export const accountBlockService = {
  blockAccount: async (accountId: string, accessToken: string) => {
    try {
      const response = await fetch(`${API_URL}/accounts/${accountId}/block`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(response.status, errorData.message || 'Error al bloquear cuenta');
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Error de conexión con el servidor');
    }
  },

  requestUnblock: async (accountId: string, accessToken: string) => {
    try {
      const response = await fetch(`${API_URL}/accounts/${accountId}/request-unlock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(response.status, errorData.message || 'Error al solicitar desbloqueo');
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
