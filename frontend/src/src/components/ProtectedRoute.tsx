import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fileService } from '@/services/files';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const [isValidating, setIsValidating] = useState(true);
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsValid(false);
                setIsValidating(false);
                return;
            }

            try {
                // Make a light API call to validate token
                await fileService.getUserData();
                setIsValid(true);
            } catch (error) {
                // Clear localStorage on auth failure
                localStorage.clear();
                setIsValid(false);
            } finally {
                setIsValidating(false);
            }
        };

        validateToken();
    }, []);

    if (isValidating) {
        return <div>Loading...</div>; // Or your loading component
    }

    if (!isValid) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
