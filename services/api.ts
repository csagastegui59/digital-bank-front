const API_URL = 'https://digital-bank-0efq.onrender.com';

export interface SignupRequest {
  email: string;
  password: string;
  role?: 'ADMIN' | 'OPS' | 'CUSTOMER';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
    isActive?: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export interface SignupStatusResponse {
  canSignup: boolean;
  remainingSeconds: number;
  serverTime: string;
  lastSignupTime: string | null;
  cooldownMinutes: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const authService = {
  async getSignupStatus(): Promise<SignupStatusResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/signup-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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

  async signup(data: SignupRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = Array.isArray(error.message) 
          ? error.message.join(', ')
          : error.message || 'Error en el registro';
        
        throw new ApiError(
          response.status,
          errorMessage,
          error
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Error de conexión con el servidor');
    }
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = Array.isArray(error.message) 
          ? error.message.join(', ')
          : error.message || 'Error en el inicio de sesión';
        
        throw new ApiError(
          response.status,
          errorMessage,
          error
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Error de conexión con el servidor');
    }
  },

  async logout(accessToken: string): Promise<void> {
    try {
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
        console.error('Logout - Error response:', error);
        const errorMessage = Array.isArray(error.message) 
          ? error.message.join(', ')
          : error.message || 'Error al cerrar sesión';
        
        throw new ApiError(
          response.status,
          errorMessage,
          error
        );
      }

    } catch (error) {
      console.error('Logout - Exception:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Error de conexión con el servidor');
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = Array.isArray(error.message) 
          ? error.message.join(', ')
          : error.message || 'Error al refrescar el token';
        
        throw new ApiError(
          response.status,
          errorMessage,
          error
        );
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
