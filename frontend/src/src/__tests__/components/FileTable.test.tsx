// FileTable.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FileTable } from '@/components/abnormal/FileTable'
import { fileService } from '@/services/files'

vi.mock('@/services/files', () => ({
    fileService: {
        downloadFile: vi.fn(),
        deleteFile: vi.fn(),
        shareFile: vi.fn()
    }
}))

const mockFiles = [
    {
        id: '1',
        name: 'test.pdf',
        size: 1024 * 1024, // 1MB
        extension: 'pdf',
        status: 'private',
        uploaded_date: '2025-02-16T12:00:00Z',
        download_link: 'test-link',
        encryption_metadata: {}
    }
]

describe('FileTable Component', () => {
    it('renders file table with data', () => {
        render(
            <FileTable
                userRole="Regular"
                ownedFiles={mockFiles}
                sharedFiles={[]}
                onRefresh={vi.fn()}
            />
        )

        expect(screen.getByText('test.pdf')).toBeInTheDocument()
        expect(screen.getByText('1.00 MB')).toBeInTheDocument()
        expect(screen.getByText('PDF')).toBeInTheDocument()
    })

    it('handles file download', async () => {
        render(
            <FileTable
                userRole="Regular"
                ownedFiles={mockFiles}
                sharedFiles={[]}
                onRefresh={vi.fn()}
            />
        )

        const downloadButton = screen.getByText('Download')
        fireEvent.click(downloadButton)

        await waitFor(() => {
            expect(fileService.downloadFile).toHaveBeenCalledWith(
                'test-link',
                'test.pdf',
                {}
            )
        })
    })

    it('shows different actions for different user roles', () => {
        const { rerender } = render(
            <FileTable
                userRole="Guest"
                ownedFiles={mockFiles}
                sharedFiles={[]}
                onRefresh={vi.fn()}
            />
        )

        expect(screen.queryByText('Share')).not.toBeInTheDocument()

        rerender(
            <FileTable
                userRole="Regular"
                ownedFiles={mockFiles}
                sharedFiles={[]}
                onRefresh={vi.fn()}
            />
        )

        expect(screen.getByText('Share')).toBeInTheDocument()
    })
})
