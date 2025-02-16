// components/MFAPendingDrawer.tsx
import {useEffect, useState} from "react";
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle} from "@/components/ui/drawer";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {dashboardService} from "@/services/dashboard";

interface MFAPendingUser {
    id: number;
    name: string;
    email: string;
    user_since: string;
    days_left: number;
}

interface MFAPendingDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MFAPendingDrawer({isOpen, onClose}: MFAPendingDrawerProps) {
    const [users, setUsers] = useState<MFAPendingUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                const data = await dashboardService.getMFAPendingUsers();
                setUsers(data);
            } catch (error) {
                setError((error as Error).message);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const handleSendEmail = (email: string) => {
        console.log('Email sent to:', email);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Drawer open={isOpen} onOpenChange={onClose}>
            <DrawerContent className="h-[90vh]">
                <DrawerHeader>
                    <DrawerTitle>Pending MFA Setup</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 overflow-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-center">{error}</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>User Since</TableHead>
                                    <TableHead>Days Left</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{formatDate(user.user_since)}</TableCell>
                                        <TableCell>
                                            <span className={user.days_left === 0 ? "text-red-500" : "text-yellow-500"}>
                                                {user.days_left} days
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSendEmail(user.email)}
                                            >
                                                Send Reminder
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
