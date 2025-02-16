// Login.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Login } from '@/components/abnormal/Login'
import { authService } from '@/services/auth'
import { BrowserRouter } from 'react-router-dom'

// Mock the auth service
vi.mock('@/services/auth', () => ({
    authService: {
        login: vi.fn(),
        register: vi.fn()
    }
}))

const renderLogin = () => {
    return render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    )
}

describe('Login Component', () => {
    it('renders login form by default', () => {
        renderLogin()
        expect(screen.getByText('Login')).toBeInTheDocument()
        expect(screen.getByLabelText('Username')).toBeInTheDocument()
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('switches to registration form', async () => {
        renderLogin()
        fireEvent.click(screen.getByText('Registration'))
        expect(screen.getByLabelText('Name')).toBeInTheDocument()
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('handles login submission', async () => {
        renderLogin()
        authService.login.mockResolvedValueOnce({ token: 'test-token' })

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
        fireEvent.click(screen.getByText('Login'))

        await waitFor(() => {
            expect(authService.login).toHaveBeenCalledWith('testuser', 'password123')
        })
    })

    it('validates registration password requirements', async () => {
        renderLogin()
        fireEvent.click(screen.getByText('Registration'))

        const passwordInput = screen.getByLabelText('Password')
        fireEvent.change(passwordInput, { target: { value: 'weak' } })

        expect(screen.getByText('6-18 characters')).toHaveClass('text-red-500')
        expect(screen.getByText('One uppercase letter')).toHaveClass('text-red-500')
        expect(screen.getByText('One special character')).toHaveClass('text-red-500')
        expect(screen.getByText('One digit')).toHaveClass('text-red-500')
    })
})
