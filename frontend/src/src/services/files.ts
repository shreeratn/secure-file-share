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
    name: string;
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
            name: apiData.name
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
        name: apiData.name
    };
};

const encryptFile = async (file: File) => {
    try {
        // Generate a new AES-GCM key
        const key = await crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );

        // Generate random initialization vector
        const iv = crypto.getRandomValues(new Uint8Array(16));

        // Encrypt file contents
        const encryptedData = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            await file.arrayBuffer()
        );


        // Export key for storage
        const exportedKey = await crypto.subtle.exportKey("raw", key);
        const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));

        return {
            encryptedBlob: new Blob([encryptedData], { type: file.type }),
            metadata: {
                originalName: file.name,
                iv: Array.from(iv),
                key: keyBase64
            }
        };
    } catch (error) {
        throw new Error(`Encryption failed: ${error.message}`);
    }
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
            // Encrypt the file before upload
            const encryptionResult = await encryptFile(data.file);

            console.log('encryptionResult', encryptionResult);

            const formData = new FormData();
            formData.append('file', encryptionResult.encryptedBlob, data.file.name);
            formData.append('status', data.status);
            formData.append('encryption_metadata', JSON.stringify({
                iv: encryptionResult.metadata.iv,  // Already an array from encryptFile
                key: encryptionResult.metadata.key // Already base64 encoded from encryptFile
            }));

            if (data.expiry_days) {
                formData.append('expiry_days', data.expiry_days.toString());
            }

            for (const pair of formData.entries()) {
                console.log(`${pair[0]}: ${pair[1]}`);
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

    downloadFile: async (downloadLink: string, downloadName: string, metadata: any): Promise<void> => {
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

            // Add debug logs
            console.log('link:', downloadLink);
            console.log('name', downloadName);
            console.log('Download response size:', response.data.size);
            console.log('Metadata received:', metadata);

            // Convert base64 key back to ArrayBuffer
            const keyBytes = Uint8Array.from(atob(metadata.key), c => c.charCodeAt(0));
            console.log('Key bytes:', keyBytes);

            const key = await crypto.subtle.importKey(
                "raw",
                keyBytes,
                { name: "AES-GCM", length: 256 },
                false,
                ["decrypt"]
            );

            const iv = new Uint8Array(metadata.iv);
            console.log('IV array:', iv);

            const decryptedData = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv },
                key,
                await response.data.arrayBuffer()
            );

            const blob = new Blob([decryptedData], { type: response.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = downloadName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Decryption error details:', error);
            throw new Error('Decryption failed: Invalid key or corrupted data');
        }
    },


    // Get role upgrade requests
    getRoleRequests: async (): Promise<any[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/role-requests/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error: any) {
            throw new Error('Failed to fetch role requests');
        }
    },

    // Request role upgrade
    requestRoleUpgrade: async (): Promise<void> => {
        try {
            await axios.post(`${API_BASE_URL}/request-upgrade/`, null, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error: any) {
            throw new Error('Failed to request role upgrade');
        }
    },

    // Approve role upgrade
    approveRoleUpgrade: async (userId: number, role: 'regular' | 'admin'): Promise<void> => {
        try {
            await axios.post(`${API_BASE_URL}/approve-upgrade/${userId}/`, { role }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error: any) {
            throw new Error('Failed to approve role upgrade');
        }
    },

    // Downgrade user to guest
    downgradeToGuest: async (userId: number): Promise<void> => {
        try {
            await axios.post(`${API_BASE_URL}/downgrade-to-guest/${userId}/`, null, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error: any) {
            throw new Error('Failed to downgrade user');
        }
    }




};
