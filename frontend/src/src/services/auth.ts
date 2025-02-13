// src/services/auth.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/auth';

interface LoginResponse {
    token: string;
    refresh_token: string;
    isMFAenabled: boolean;
}

interface RegisterResponse {
    message: string;
    user_id: number;
}

interface LogoutResponse {
    message: string;
    status: string;
}

interface MFASetupResponse {
    qr_code: string;
    secret: string;
}

interface MFAVerifyResponse {
    message: string;
    success: boolean;
}

export const authService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/login/`, {
                email,
                password
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 401) {
                throw new Error('Invalid email or password');
            }
            throw new Error('An unexpected error occurred. Please try again later.');
        }
    },

    register: async (name: string, email: string, password: string): Promise<RegisterResponse> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/register/`, {
                name,
                email,
                password
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new Error('Registration failed. Please check your details.');
            }
            throw new Error('An unexpected error occurred. Please try again later.');
        }
    },

    logout: async (): Promise<LogoutResponse> => {
        try {
            const token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refreshToken');

            const response = await axios.post(
                `${API_BASE_URL}/logout/`,
                { refresh_token: refreshToken },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Clear all auth related data from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userType');

            return response.data;
        } catch (error: any) {
            if (error.response?.status === 401) {
                // Clear localStorage even if the request fails
                localStorage.clear();
                throw new Error('Session expired');
            }
            throw new Error('Logout failed. Please try again.');
        }
    },

    setupMFA: async (): Promise<MFASetupResponse> => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/mfa/setup/`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            return response.data;
        } catch (error: any) {
            throw new Error('MFA setup failed');
        }
    },

    verifyMFA: async (otp: string): Promise<MFAVerifyResponse> => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.post(
                `${API_BASE_URL}/mfa/verify/`,
                { otp },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (response.data.success) {
                localStorage.setItem('isMFAenabled', 'true');
            }
            return response.data;
        } catch (error: any) {
            if (error.response?.data?.code === 'token_not_valid') {
                // Handle expired token
                localStorage.removeItem('token');
                throw new Error('Session expired. Please login again.');
            }
            throw new Error('MFA verification failed');
        }
    }



};
