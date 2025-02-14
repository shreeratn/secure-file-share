import axios from "axios";

interface MFAPendingUser {
    id: number;
    name: string;
    email: string;
    user_since: string;
    days_left: number;
}

const API_BASE_URL = 'http://localhost:8000/api/auth';


export const dashboardService = {
    getMFAPendingUsers: async (): Promise<MFAPendingUser[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/mfa-pending/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new Error('Only admin users can access this data');
            }
            throw new Error('Failed to fetch MFA pending users');
        }
    },
};
