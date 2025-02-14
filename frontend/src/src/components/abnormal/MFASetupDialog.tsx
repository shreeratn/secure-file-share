import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { MFADrawer } from "./MFADrawer"
import { useNavigate } from "react-router-dom"
import { authService } from "../../services/auth.ts"
import { useToast } from "@/hooks/use-toast"

interface MFASetupDialogProps {
    isOpen: boolean
    onClose: () => void
}

export function MFASetupDialog({ isOpen, onClose }: MFASetupDialogProps) {
    const [isMFADrawerOpen, setIsMFADrawerOpen] = useState(false)
    const navigate = useNavigate()
    const { toast } = useToast()

    const handleCompleteLater = async () => {
        try {
            onClose()
            navigate('/dashboard')
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: error.message
            })
        }
    }

    const handleCompleteNow = () => {
        setIsMFADrawerOpen(true)
    }

    const handleMFASuccess = async () => {
        try {
            setIsMFADrawerOpen(false);
            onClose();
            navigate('/dashboard');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: error.message
            });
        }
    }


    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete MFA Setup</DialogTitle>
                        <DialogDescription>
                            To enhance your account security, we recommend setting up Multi-Factor Authentication (MFA).
                            While you can complete this later, administrators may contact you to ensure this security measure is in place.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={handleCompleteLater}>
                            Do it Later
                        </Button>
                        <Button onClick={handleCompleteNow}>
                            Complete Now
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <MFADrawer
                isOpen={isMFADrawerOpen}
                onClose={() => setIsMFADrawerOpen(false)}
                onSuccess={handleMFASuccess}
            />
        </>
    )
}
