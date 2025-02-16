import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {ProtectedRoute} from './components/ProtectedRoute';
import {useEffect} from 'react';
import {setupAxiosInterceptors} from './services/auth';
import AuthLanding from "./components/abnormal/AuthLanding.tsx";
import DashboardPage from "./components/abnormal/Dashboard.tsx";

export default function App() {
    useEffect(() => {
        // Setup axios interceptors when app loads
        setupAxiosInterceptors();
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<AuthLanding/>}/>
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage/>
                        </ProtectedRoute>
                    }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
            </Routes>
        </BrowserRouter>
    );
}
