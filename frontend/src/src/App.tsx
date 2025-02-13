import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '@/components/abnormal/Dashboard.tsx';
import { ProtectedRoute } from './components/ProtectedRoute';
import AuthLanding from '@/components/abnormal/AuthLanding';

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<AuthLanding />} />
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<DashboardPage />
						</ProtectedRoute>
					}
				/>
				<Route path="/" element={<Navigate to="/dashboard" replace />} />
			</Routes>
		</BrowserRouter>
	);
}
