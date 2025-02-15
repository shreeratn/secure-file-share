import axios from 'axios';
import {DashboardData} from "../components/abnormal/DashboardCards.tsx";

const API_BASE_URL = 'http://localhost:8000/api/files';

// Interfaces
interface UserData {
    total_files_shared: number;
    used_storage: number;
    allocated_storage?: number;
    current_role: 'guest' | 'regular' | 'admin';
    incomplete_mfa?: number;
    encryption_health?: number;
    failed_decryption_alerts?: number;
}

interface FileData {
    id: number;
    name: string;
    size: number;
    extension: string;
    status: 'private' | 'public';
    expiry_date: string;
    uploaded_date: string;
    download_link: string | null;
}

interface UploadFileRequest {
    file: File;
    status: 'private' | 'public';
    expiry_days?: number;
}

interface ShareFileRequest {
    emails: string[];
}

interface DashboardApiResponse {
    total_files_shared: number;
    used_storage: number;
    allocated_storage?: number;
    current_role: 'guest' | 'regular' | 'admin';
    incomplete_mfa?: number;
    encryption_health?: number;
    failed_decryption_alerts?: number;
}

// Transformation function
const transformToDashboardData = (apiData: DashboardApiResponse): DashboardData => {
    // Convert bytes to GB
    const usedStorageGB = apiData.used_storage / (1024 * 1024 * 1024);

    // Default values for guest
    if (apiData.current_role === 'guest') {
        return {
            totalFiles: apiData.total_files_shared,
            usedStorageGB,
            activeLinks: 0,
            userRole: 'Guest',
            encryptionPercent: 100,
            sharedLinks: {
                total: 0,
                viewOnly: 0,
                downloadable: 0,
            },
            accessControl: {
                pendingRequests: 0,
                restrictedFilesPercent: 0,
                adminOverrides: 0,
            },
            securityAlerts: {
                failedDecryptAttempts: 0,
                pendingMFASetups: 0,
            },
            userRoles: {
                admins: 0,
                regularUsers: 0,
                guests: 0,
            },
        };
    }

    // For Regular and Admin users
    return {
        totalFiles: apiData.total_files_shared,
        usedStorageGB,
        activeLinks: 0, // Need to add this to your API
        userRole: apiData.current_role === 'admin' ? 'Admin' : 'Regular',
        encryptionPercent: apiData.encryption_health || 100,
        sharedLinks: {
            total: apiData.total_files_shared,
            viewOnly: 0, // Need to add these to your API
            downloadable: 0,
        },
        accessControl: {
            pendingRequests: 0,
            restrictedFilesPercent: 0,
            adminOverrides: 0,
        },
        securityAlerts: {
            failedDecryptAttempts: apiData.failed_decryption_alerts || 0,
            pendingMFASetups: apiData.incomplete_mfa || 0,
        },
        userRoles: {
            admins: 0,
            regularUsers: 0,
            guests: 0,
        },
    };
};


// Service
export const fileService = {
    // Get user dashboard data
    getUserData: async (): Promise<UserData> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/user-data/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 401) {
                throw new Error('Unauthorized access');
            }
            throw new Error('Failed to fetch user data');
        }
    },

    // Get uploaded files
    getUploadedFiles: async (): Promise<FileData[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/uploaded-files/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error: any) {
            throw new Error('Failed to fetch uploaded files');
        }
    },

    // Get shared files
    getSharedFiles: async (): Promise<FileData[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/shared-files/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error: any) {
            throw new Error('Failed to fetch shared files');
        }
    },

    // Upload file
    uploadFile: async (data: UploadFileRequest): Promise<FileData> => {
        try {
            const formData = new FormData();
            formData.append('file', data.file);
            formData.append('status', data.status);
            if (data.expiry_days) {
                formData.append('expiry_days', data.expiry_days.toString());
            }

            const response = await axios.post(`${API_BASE_URL}/upload/`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 413) {
                throw new Error('File size exceeds limit');
            }
            if (error.response?.status === 403) {
                throw new Error('Guest users cannot upload files');
            }
            throw new Error('Failed to upload file');
        }
    },

    // Delete file
    deleteFile: async (fileId: number): Promise<void> => {
        try {
            await axios.delete(`${API_BASE_URL}/delete/${fileId}/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('File not found');
            }
            throw new Error('Failed to delete file');
        }
    },

    // Share file
    shareFile: async (fileId: number, data: ShareFileRequest): Promise<FileData> => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/share/${fileId}/`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('File not found');
            }
            throw new Error('Failed to share file');
        }
    },


    getDashboardData: async (): Promise<DashboardData> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/user-data/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return transformToDashboardData(response.data);
        } catch (error: any) {
            throw new Error('Failed to fetch dashboard data');
        }
    },

    downloadFile: async (downloadLink: string, downloadName: string): Promise<void> => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/download/${downloadLink}/`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    responseType: 'blob'
                }
            );

            // Get content type from response headers
            const contentType = response.headers['content-type'];

            // Create blob with correct content type
            const blob = new Blob([response.data], { type: contentType });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Check for Content-Disposition header in both cases
            const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
            let filename = downloadName;

            if (contentDisposition) {
                const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('File not found');
            }
            if (error.response?.status === 410) {
                throw new Error('File has expired');
            }
            throw new Error('Failed to download file');
        }
    }



};
