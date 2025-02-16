import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {useEffect, useState} from "react"
import {useToast} from "@/hooks/use-toast"
import {Copy} from "lucide-react"
import {QRCodeSVG} from "qrcode.react";
import {Drawer, DrawerContent, DrawerOverlay, DrawerPortal,} from "@/components/ui/drawer"
import {authService} from "../../../services/auth.ts";
import {useNavigate} from "react-router-dom";


interface MFADrawerProps {
    isOpen: boolean
    onClose: () => void
}

export function MFADrawer({isOpen, onClose}: MFADrawerProps) {
    const [qrCode, setQrCode] = useState("")
    const [secret, setSecret] = useState("")
    const [otp, setOtp] = useState("")
    const [step, setStep] = useState<'qr' | 'verify'>('qr')
    const {toast} = useToast()
    const navigate = useNavigate()

    // Fetch QR code when drawer opens
    useEffect(() => {
        if (isOpen) {
            authService.setupMFA().then(response => {
                setQrCode(response.qr_code)
                setSecret(response.secret)
            }).catch(error => {
                toast({
                    title: "Error",
                    description: "Failed to fetch MFA setup details.",
                    variant: "destructive"
                })
            })
        }
    }, [isOpen, toast])

    const handleCopySecret = () => {
        navigator.clipboard.writeText(secret)
        toast({
            title: "Secret copied!",
            description: "The MFA secret has been copied to your clipboard."
        })
    }

    const handleVerifyOTP = async () => {
        try {
            const response = await authService.verifyMFA(otp);
            toast({
                title: "Success",
                description: response.message || "MFA enabled successfully",
                variant: "default"
            });
            onClose();
            navigate('/dashboard');
        } catch (error: any) {
            toast({
                title: "Verification Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    return (
        <Drawer open={isOpen} onOpenChange={onClose}>
            <DrawerPortal>
                <DrawerOverlay className="fixed inset-0 bg-black/40"/>
                <DrawerContent className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[10px]">
                    <div className="max-w-md mx-auto">
                        <div className="p-4 space-y-4">
                            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8"/>
                            <h2 className="text-lg font-semibold">Enable Multi-Factor Authentication</h2>

                            {step === 'qr' ? (
                                <>
                                    <div className="flex justify-center">
                                        <QRCodeSVG value={qrCode} size={256}/>
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleCopySecret}
                                    >
                                        <Copy className="mr-2 h-4 w-4"/>
                                        Can't scan? Click to copy
                                    </Button>

                                    <Button
                                        className="w-full"
                                        onClick={() => setStep('verify')}
                                    >
                                        Next
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm">Enter OTP from your authenticator app</label>
                                        <Input
                                            type="text"
                                            placeholder="Enter 6-digit code"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            maxLength={6}
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setStep('qr')}
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            onClick={handleVerifyOTP}
                                        >
                                            Verify & Enable MFA
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </DrawerContent>
            </DrawerPortal>
        </Drawer>
    )

}
