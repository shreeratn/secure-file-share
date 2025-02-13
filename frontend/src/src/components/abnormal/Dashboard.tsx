// app/dashboard/page.tsx
import { FileTable } from "./FileTable"
import { DashboardCards, DashboardData } from "./DashboardCards"
import { File } from "./FileTable.tsx"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {AuroraText} from "../magicui/aurora-text.tsx";
import { useNavigate } from 'react-router-dom';
import {authService} from "../../services/auth.ts";
import {MFADrawer} from "./MFADrawer.tsx";
import {useState} from "react";


const generateDates = (daysBack: number) => {
    const date = new Date()
    date.setDate(date.getDate() - daysBack)
    return date
}

export const dummyOwnedFiles: File[] = [
    {
        id: "1a2b3c", name: "Q4 Financial Report", size: "2.4 MB", extension: "pdf",
        isShared: true, expiry: "3 days left", uploadedAt: generateDates(2)
    },
    {
        id: "4d5e6f", name: "Project Blueprint", size: "1.8 MB", extension: "docx",
        isShared: false, uploadedAt: generateDates(5)
    },
    {
        id: "7g8h9i", name: "Design Assets", size: "15.2 MB", extension: "zip",
        isShared: true, expiry: "6 days left", uploadedAt: generateDates(1)
    },
    {
        id: "0j1k2l", name: "Security Audit", size: "3.1 MB", extension: "xlsx",
        isShared: true, expiry: "12 hours left", uploadedAt: generateDates(0)
    },
    {
        id: "3m4n5o", name: "User Manual", size: "0.9 MB", extension: "txt",
        isShared: false, uploadedAt: generateDates(10)
    },
    {
        id: "6p7q8r", name: "Marketing Strategy", size: "4.2 MB", extension: "pptx",
        isShared: true, expiry: "2 days left", uploadedAt: generateDates(3)
    },
    {
        id: "9s0t1u", name: "Backend API Docs", size: "1.1 MB", extension: "md",
        isShared: true, expiry: "7 days left", uploadedAt: generateDates(7)
    },
    {
        id: "2v3w4x", name: "Database Schema", size: "0.8 MB", extension: "sql",
        isShared: false, uploadedAt: generateDates(14)
    },
    {
        id: "5y6z7a", name: "Legal Agreement", size: "2.9 MB", extension: "pdf",
        isShared: true, expiry: "1 day left", uploadedAt: generateDates(1)
    },
    {
        id: "8b9c0d", name: "UI Mockups", size: "9.5 MB", extension: "png",
        isShared: true, expiry: "4 days left", uploadedAt: generateDates(4)
    },
    {
        id: "1e2f3g", name: "Code Review Notes", size: "0.5 MB", extension: "txt",
        isShared: false, uploadedAt: generateDates(8)
    },
    {
        id: "4h5i6j", name: "Budget Plan", size: "2.3 MB", extension: "xlsx",
        isShared: true, expiry: "8 hours left", uploadedAt: generateDates(0)
    },
    {
        id: "7k8l9m", name: "Client Presentation", size: "5.7 MB", extension: "pptx",
        isShared: true, expiry: "5 days left", uploadedAt: generateDates(6)
    },
    {
        id: "0n1o2p", name: "System Architecture", size: "3.4 MB", extension: "pdf",
        isShared: false, uploadedAt: generateDates(12)
    },
    {
        id: "3q4r5s", name: "Meeting Minutes", size: "1.2 MB", extension: "docx",
        isShared: true, expiry: "2 days left", uploadedAt: generateDates(2)
    },
    {
        id: "6t7u8v", name: "Test Results", size: "2.1 MB", extension: "csv",
        isShared: true, expiry: "3 days left", uploadedAt: generateDates(3)
    },
    {
        id: "9w0x1y", name: "Design System", size: "12.8 MB", extension: "sketch",
        isShared: false, uploadedAt: generateDates(9)
    },
    {
        id: "2z3a4b", name: "API Spec", size: "1.7 MB", extension: "yaml",
        isShared: true, expiry: "6 hours left", uploadedAt: generateDates(0)
    },
    {
        id: "5c6d7e", name: "Performance Metrics", size: "2.5 MB", extension: "pdf",
        isShared: false, uploadedAt: generateDates(6)
    },
    {
        id: "8f9g0h", name: "Onboarding Guide", size: "3.9 MB", extension: "docx",
        isShared: true, expiry: "1 week left", uploadedAt: generateDates(7)
    },
]

export const dummySharedFiles: File[] = [
    {
        id: "s1a2b3", name: "Marketing Plan", size: "4.1 MB", extension: "pdf",
        isShared: true, expiry: "1 day left", sharedBy: "Alice Johnson", sharedAt: generateDates(1)
    },
    {
        id: "s4c5d6", name: "Product Roadmap", size: "2.8 MB", extension: "pptx",
        isShared: true, expiry: "3 days left", sharedBy: "Michael Chen", sharedAt: generateDates(3)
    },
    {
        id: "s7e8f9", name: "Infra Diagram", size: "1.9 MB", extension: "vsdx",
        isShared: true, expiry: "12 hours left", sharedBy: "Sarah Wilson", sharedAt: generateDates(0)
    },
    {
        id: "s0g1h2", name: "User Research", size: "3.5 MB", extension: "docx",
        isShared: true, expiry: "2 weeks left", sharedBy: "David Kim", sharedAt: generateDates(14)
    },
    {
        id: "s3i4j5", name: "Security Policy", size: "0.8 MB", extension: "pdf",
        isShared: true, expiry: "5 days left", sharedBy: "Emma Davis", sharedAt: generateDates(5)
    },
    {
        id: "s6k7l8", name: "Sales Forecast", size: "2.2 MB", extension: "xlsx",
        isShared: true, expiry: "6 hours left", sharedBy: "James Brown", sharedAt: generateDates(0)
    },
    {
        id: "s9m0n1", name: "UI Kit", size: "8.4 MB", extension: "zip",
        isShared: true, expiry: "10 days left", sharedBy: "Olivia Taylor", sharedAt: generateDates(9)
    },
    {
        id: "s2o3p4", name: "Code Review Notes", size: "0.6 MB", extension: "md",
        isShared: true, expiry: "7 days left", sharedBy: "William Lee", sharedAt: generateDates(6)
    },
    {
        id: "s5q6r7", name: "API Documentation", size: "1.3 MB", extension: "html",
        isShared: true, expiry: "4 days left", sharedBy: "Sophia Martinez", sharedAt: generateDates(3)
    },
    {
        id: "s8t9u0", name: "Test Cases", size: "0.9 MB", extension: "csv",
        isShared: true, expiry: "2 days left", sharedBy: "Liam Wilson", sharedAt: generateDates(1)
    },
    {
        id: "s1v2w3", name: "Analytics Report", size: "3.2 MB", extension: "pdf",
        isShared: true, expiry: "9 hours left", sharedBy: "Charlotte White", sharedAt: generateDates(0)
    },
    {
        id: "s4x5y6", name: "Brand Guidelines", size: "6.7 MB", extension: "pdf",
        isShared: true, expiry: "3 weeks left", sharedBy: "Noah Harris", sharedAt: generateDates(18)
    },
    {
        id: "s7z8a9", name: "System Logs", size: "4.5 MB", extension: "log",
        isShared: true, expiry: "5 days left", sharedBy: "Ava Clark", sharedAt: generateDates(4)
    },
    {
        id: "s0b1c2", name: "Meeting Recordings", size: "120.0 MB", extension: "mp4",
        isShared: true, expiry: "8 days left", sharedBy: "Ethan Hall", sharedAt: generateDates(7)
    },
    {
        id: "s3d4e5", name: "Benchmark Results", size: "2.1 MB", extension: "xlsx",
        isShared: true, expiry: "1 day left", sharedBy: "Mia Green", sharedAt: generateDates(1)
    },
    {
        id: "s6f7g8", name: "Onboarding Plan", size: "1.5 MB", extension: "docx",
        isShared: true, expiry: "6 days left", sharedBy: "Alexander Moore", sharedAt: generateDates(5)
    },
    {
        id: "s9h0i1", name: "Network Diagram", size: "2.8 MB", extension: "png",
        isShared: true, expiry: "12 days left", sharedBy: "Chloe Young", sharedAt: generateDates(10)
    },
    {
        id: "s2j3k4", name: "Risk Assessment", size: "3.7 MB", extension: "pdf",
        isShared: true, expiry: "7 hours left", sharedBy: "Benjamin King", sharedAt: generateDates(0)
    },
    {
        id: "s5l6m7", name: "Deployment Plan", size: "1.6 MB", extension: "txt",
        isShared: true, expiry: "2 weeks left", sharedBy: "Emily Scott", sharedAt: generateDates(13)
    },
    {
        id: "s8n9o0", name: "Bug Tracker", size: "0.7 MB", extension: "csv",
        isShared: true, expiry: "4 days left", sharedBy: "Daniel Wright", sharedAt: generateDates(3)
    },
]


const dummyData: DashboardData = {
    totalFiles: 298,
    usedStorageGB: 0.32,
    activeLinks: 23,
    userRole: "Guest",
    encryptionPercent: 98,
    sharedLinks: {
        total: 142,
        viewOnly: 89,
        downloadable: 53,
    },
    accessControl: {
        pendingRequests: 23,
        restrictedFilesPercent: 91,
        adminOverrides: 3,
    },
    securityAlerts: {
        failedDecryptAttempts: 2,
        pendingMFASetups: 7,
    },
    userRoles: {
        admins: 3,
        regularUsers: 142,
        guests: 29,
    },
}

export default function DashboardPage() {

    const navigate = useNavigate();
    const [isMFADrawerOpen, setIsMFADrawerOpen] = useState(false);


    const handleLogout = async () => {
        try {
            await authService.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };


    return (
        <div className="flex-col md:flex">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Card className="w-full mb-4">
                    <CardContent className="flex justify-between items-center p-3">
                        <h1 className="text-3xl font-bold tracking-tighter">
                            Secure File Share by <AuroraText>Shree Ratn</AuroraText>
                        </h1>
                        <div className="flex gap-4">
                            {!localStorage.getItem('isMFAenabled') && (
                                <Button
                                    variant="outline"
                                    onClick={() => setIsMFADrawerOpen(true)}
                                >
                                    Complete MFA
                                </Button>
                            )}
                            <Button variant="destructive" onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <DashboardCards data={dummyData}/>
                <FileTable
                    userRole="Admin"
                    ownedFiles={dummyOwnedFiles}
                    sharedFiles={dummySharedFiles}
                />

                {isMFADrawerOpen && (<MFADrawer
                    isOpen={isMFADrawerOpen}
                    onClose={() => setIsMFADrawerOpen(false)}
                />)}
            </div>
        </div>
    )

}
