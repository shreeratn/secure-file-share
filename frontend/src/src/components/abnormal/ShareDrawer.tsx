// components/share-drawer.tsx
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Copy, Link2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ShareDrawerProps {
    file: File
    open: boolean
    onClose: () => void
}

export function ShareDrawer({ file, open, onClose }: ShareDrawerProps) {
    const { toast } = useToast()
    const [days, setDays] = useState(7)
    const [error, setError] = useState<string | null>(null)
    const [isSettingsSaved, setIsSettingsSaved] = useState(false)
    const [shareLink, setShareLink] = useState("")

    const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value)
        setDays(value)
        setError(null)
    }

    const handleSave = () => {
        if (days > 30) {
            setError("Expiration days cannot exceed 30")
            return
        }
        if (days < 1) {
            setError("Expiration days must be at least 1")
            return
        }

        setShareLink(`https://your-app.com/share/${crypto.randomUUID()}?expires_in=${days}`)
        setIsSettingsSaved(true)
        setError(null)
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink)
        toast({
            title: "Link copied!",
            description: "Share link has been copied to clipboard",
        })
    }

    useEffect(() => {
        if (!open) {
            // Reset state when drawer closes
            setDays(7)
            setError(null)
            setIsSettingsSaved(false)
            setShareLink("")
        }
    }, [open])

    return (
        <Drawer open={open} onOpenChange={onClose}>
            <DrawerContent className="h-[40vh]">
                <div className="mx-auto w-full max-w-sm p-6">
                    <DrawerHeader>
                        <DrawerTitle className="flex items-center gap-2">
                            <Link2 className="h-5 w-5" />
                            Share File
                        </DrawerTitle>
                    </DrawerHeader>

                    {!file.isShared && (
                        <div className="space-y-4">
                            {!isSettingsSaved ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Set Expiration Days
                                        <span className="text-muted-foreground ml-1">(max 30)</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min="1"
                                            max="30"
                                            value={days}
                                            onChange={handleDaysChange}
                                            className="w-24"
                                        />
                                        <Button onClick={handleSave}>
                                            Save
                                        </Button>
                                    </div>
                                    {error && <p className="text-sm text-red-500">{error}</p>}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={shareLink}
                                            readOnly
                                            className="truncate max-w-[300px]"
                                        />
                                        <Button size="sm" onClick={handleCopy}>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        This link will expire after {days} day{days !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {file.isShared && (
                        <div className="space-y-2 mt-4">
                            <div className="flex items-center gap-2">
                                <Input
                                    value={shareLink}
                                    readOnly
                                    className="truncate max-w-[300px]"
                                />
                                <Button size="sm" onClick={handleCopy}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                This file is already shared publicly
                            </p>
                        </div>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    )
}
