import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {useEffect, useState} from "react"
import { useToast } from "@/hooks/use-toast"
import { Copy } from "lucide-react"
import { QRCodeSVG } from "qrcode.react";
import axios from 'axios'
import {
    Drawer,
    DrawerContent,
    DrawerOverlay,
    DrawerPortal,
} from "@/components/ui/drawer"


interface MFADrawerProps {
    isOpen: boolean
    onClose: () => void
}

export function MFADrawer({ isOpen, onClose }: MFADrawerProps) {
    const [qrCode, setQrCode] = useState("")
    const [secret, setSecret] = useState("")
    const [otp, setOtp] = useState("")
    const [step, setStep] = useState<'qr' | 'verify'>('qr')
    const { toast } = useToast()

    // Fetch QR code when drawer opens
    useEffect(() => {
        if (isOpen) {
            fetchMFASetup()
        }
    }, [isOpen])

    const fetchMFASetup = async () => {
        try {
            const response = await axios.post(
                'http://localhost:8000/api/auth/mfa/setup/',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            )
            setQrCode(response.data.qr_code)
            setSecret(response.data.secret)
        } catch (error) {
            console.error('MFA setup failed:', error)
        }
    }

    const handleCopySecret = () => {
        navigator.clipboard.writeText(secret)
        toast({
            title: "Secret copied!",
            description: "The MFA secret has been copied to your clipboard."
        })
    }

    const handleVerifyOTP = async () => {
        try {
            const response = await axios.post(
                'http://localhost:8000/api/auth/mfa/verify/',
                { otp },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            )
            if (response.data.success) {
                localStorage.setItem('isMFAenabled', 'true')
                toast({
                    title: "MFA Enabled",
                    description: "Multi-factor authentication has been enabled successfully."
                })
                onClose()
            }
        } catch (error) {
            toast({
                title: "Verification Failed",
                description: "Invalid OTP. Please try again.",
                variant: "destructive"
            })
        }
    }

    return (
        <Drawer open={isOpen} onOpenChange={onClose}>
            <DrawerPortal>
                <DrawerOverlay className="fixed inset-0 bg-black/40" />
                <DrawerContent className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[10px]">
                    <div className="max-w-md mx-auto">
                        <div className="p-4 space-y-4">
                            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
                            <h2 className="text-lg font-semibold">Enable Multi-Factor Authentication</h2>

                            {step === 'qr' ? (
                                <>
                                    <div className="flex justify-center">
                                        <QRCodeSVG value={qrCode} size={256} />
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleCopySecret}
                                    >
                                        <Copy className="mr-2 h-4 w-4" />
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
