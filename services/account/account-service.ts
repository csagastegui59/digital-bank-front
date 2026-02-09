import { ApiError } from "../auth/auth-service";

const API_URL = 'https://digital-bank-0efq.onrender.com';

export enum AccountType {
    CHECKING = 'CHECKING',
    SAVINGS = 'SAVINGS',
}

export enum Currency {
    PEN = 'PEN',
    USD = 'USD',
}

export type Account = {
    id: string;
    accountNumber: string;

    type: AccountType;

    currency: Currency;


    balance: string;

    isActive: boolean;

    isPending: boolean;

    isUnlockRequest: boolean;

    blockedAt: Date | null;

    unlockRequestedAt: Date | null;

    ownerId: string;

    owner: any;
    createdAt: Date;
}

export const accountService = {
    async getUserAccounts(userId: string): Promise<Account[]> {
        try {
            const response = await fetch(`${API_URL}/accounts/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            if (!response.ok) {
                throw new ApiError(response.status, 'Error al obtener estado de registro');
            }

            return response.json();
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(500, 'Error de conexión con el servidor');
        }
    },

    async requestAccount(currency: Currency, accessToken: string): Promise<Account> {
        try {
            const response = await fetch(`${API_URL}/accounts/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ currency }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new ApiError(
                    response.status,
                    error.message || 'Error al solicitar cuenta'
                );
            }

            return response.json();
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(500, 'Error de conexión con el servidor');
        }
    }
}