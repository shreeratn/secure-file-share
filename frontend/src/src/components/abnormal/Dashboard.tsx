// app/dashboard/page.tsx
import { FileTable } from "./FileTable"
import { DashboardCards, DashboardData } from "./DashboardCards"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {AuroraText} from "../magicui/aurora-text.tsx";
import { useNavigate } from 'react-router-dom';
import {authService} from "../../services/auth.ts";
import {MFADrawer} from "./mfa/MFADrawer.tsx";
import {useState} from "react";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { fileService } from "@/services/files";


interface FileData {
    id: string;
    name: string;
    size: string;
    extension: string;
    status: string;
    expiry?: string;
    uploadedAt?: string;
    sharedBy?: string;
    sharedAt?: string;
    downloadLink?: string;
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const [isMFADrawerOpen, setIsMFADrawerOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [ownedFiles, setOwnedFiles] = useState<FileData[]>([]);
    const [sharedFiles, setSharedFiles] = useState<FileData[]>([]);

    const isMFAenabled = localStorage.getItem('isMFAenabled') === 'true';

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [dashboardData, uploadedFiles, sharedFilesData] = await Promise.all([
                    fileService.getDashboardData(),
                    fileService.getUploadedFiles(),
                    fileService.getSharedFiles()
                ]);

                setDashboardData(dashboardData);
                setOwnedFiles(uploadedFiles);
                setSharedFiles(sharedFilesData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await authService.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            navigate('/login');
        }
    };

    const handleMFAClick = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        setIsMFADrawerOpen(true);
    }

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                    <p className="text-sm text-muted-foreground">Loading your secure workspace...</p>
                </div>
            </div>
        );
    }

    const refreshData = async () => {
        try {
            const [dashboardData, uploadedFiles, sharedFilesData] = await Promise.all([
                fileService.getDashboardData(),
                fileService.getUploadedFiles(),
                fileService.getSharedFiles()
            ]);
            setDashboardData(dashboardData);
            setOwnedFiles(uploadedFiles);
            setSharedFiles(sharedFilesData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
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
                            {!isMFAenabled && (
                                <Button
                                    variant="outline"
                                    onClick={() => handleMFAClick()}
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

                {dashboardData && <DashboardCards data={dashboardData} onRefresh={refreshData} />}
                <FileTable
                    userRole={dashboardData?.userRole || 'Guest'}
                    ownedFiles={ownedFiles}
                    sharedFiles={sharedFiles}
                    onRefresh={refreshData}
                />

                {isMFADrawerOpen && (<MFADrawer
                    isOpen={isMFADrawerOpen}
                    onClose={() => setIsMFADrawerOpen(false)}
                />)}
            </div>
        </div>
    );
}

