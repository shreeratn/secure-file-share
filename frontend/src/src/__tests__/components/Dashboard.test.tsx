// Dashboard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Dashboard from '@/components/abnormal/Dashboard'
import { fileService } from '@/services/files'
import { BrowserRouter } from 'react-router-dom'

vi.mock('@/services/files', () => ({
    fileService: {
        getDashboardData: vi.fn(),
        getUploadedFiles: vi.fn(),
        getSharedFiles: vi.fn()
    }
}))

const mockDashboardData = {
    name: 'Test User',
    totalFiles: 10,
    usedStorageGB: 0.5,
    activeLinks: 5,
    userRole: 'Regular',
    encryptionPercent: 100,
    sharedLinks: {
        total: 15,
        viewOnly: 10,
        downloadable: 5
    },
    securityAlerts: {
        failedDecryptAttempts: 0,
        pendingMFASetups: 2
    }
}

const renderDashboard = () => {
    return render(
        <BrowserRouter>
            <Dashboard />
        </BrowserRouter>
    )
}

describe('Dashboard Component', () => {
    beforeEach(() => {
        fileService.getDashboardData.mockResolvedValue(mockDashboardData)
        fileService.getUploadedFiles.mockResolvedValue([])
        fileService.getSharedFiles.mockResolvedValue([])
    })

    it('renders dashboard with user data', async () => {
        renderDashboard()

        await waitFor(() => {
            expect(screen.getByText('Test User')).toBeInTheDocument()
            expect(screen.getByText('10')).toBeInTheDocument() // Total files
            expect(screen.getByText('100%')).toBeInTheDocument() // Encryption
        })
    })

    it('shows MFA setup button for users without MFA', async () => {
        localStorage.setItem('isMFAenabled', 'false')
        renderDashboard()

        await waitFor(() => {
            expect(screen.getByText('Complete MFA')).toBeInTheDocument()
        })
    })

    it('handles logout', async () => {
        renderDashboard()

        const logoutButton = await screen.findByText('Logout')
        fireEvent.click(logoutButton)

        await waitFor(() => {
            expect(window.location.pathname).toBe('/login')
        })
    })
})
