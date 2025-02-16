// components/role/RoleApprovalDrawer.tsx
import {useEffect, useState} from "react"
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle} from "@/components/ui/drawer"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {useToast} from "@/hooks/use-toast"
import {fileService} from "@/services/files"
import {cn} from "../../../lib/utils.ts";

interface RoleRequest {
    user_id: number;
    id: number
    user_name: string
    user_email: string
    current_role: string
    requested_role: string
    request_date: string
}

interface RoleApprovalDrawerProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => Promise<void>
}

export function RoleApprovalDrawer({isOpen, onClose, onSuccess}: RoleApprovalDrawerProps) {
    const [requests, setRequests] = useState<RoleRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const {toast} = useToast()

    const fetchRequests = async () => {
        try {
            const data = await fileService.getRoleRequests()
            setRequests(data)
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to fetch role requests"
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchRequests()
        }
    }, [isOpen])

    const handleApprove = async (userId: number, role: 'regular' | 'admin') => {
        try {
            await fileService.approveRoleUpgrade(userId, role)
            toast({
                title: "Success",
                description: "Role upgrade approved successfully"
            })
            await fetchRequests() // Refresh the list
            if (onSuccess) await onSuccess()
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to approve upgrade"
            })
        }
    }

    const handleDowngrade = async (userId: number) => {
        try {
            await fileService.downgradeToGuest(userId)
            toast({
                title: "Success",
                description: "User downgraded to guest successfully"
            })
            await fetchRequests() // Refresh the list
            if (onSuccess) await onSuccess()
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to downgrade user"
            })
        }
    }

    return (
        <Drawer open={isOpen} onOpenChange={onClose}>
            <DrawerContent className="h-[80vh]">
                <DrawerHeader>
                    <DrawerTitle>Role Approval Requests</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 overflow-auto">
                    {isLoading ? (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : requests.length === 0 ? (
                        <p className="text-center text-muted-foreground">No pending requests</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Current Role</TableHead>
                                    <TableHead>Requested Role</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((request) => (
                                    <TableRow key={request.user_id}>
                                        <TableCell>{request.user_name}</TableCell>
                                        <TableCell>{request.user_email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn({
                                                "text-gray-500": request.current_role === "guest",
                                                "text-blue-500": request.current_role === "regular",
                                                "text-red-500": request.current_role === "admin"
                                            })}>
                                                {request.current_role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={cn({
                                                "text-gray-500": request.requested_role === "guest",
                                                "text-blue-500": request.requested_role === "regular",
                                                "text-red-500": request.requested_role === "admin"
                                            })}>
                                                {request.requested_role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="space-x-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleApprove(request.user_id, request.requested_role as 'regular' | 'admin')}
                                                disabled={request.current_role === request.requested_role || request.current_role === "admin"}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDowngrade(request.user_id)}
                                                disabled={request.current_role === "guest"}
                                            >
                                                Downgrade to Guest
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
    )
}
