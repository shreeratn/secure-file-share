import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth";

interface MFAVerifyDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function MFAVerifyDialog({ isOpen, onClose, onSuccess }: MFAVerifyDialogProps) {
    const [otp, setOtp] = useState("")
    const { toast } = useToast()

    const handleVerifyOTP = async () => {
        try {
            await authService.verifyMFA(otp);
            onSuccess();
        } catch (error: any) {
            toast({
                title: "Verification Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enter MFA Code</DialogTitle>
                    <DialogDescription>
                        Please enter the code from your authenticator app
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                    />
                    <Button onClick={handleVerifyOTP} className="w-full">
                        Verify
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
