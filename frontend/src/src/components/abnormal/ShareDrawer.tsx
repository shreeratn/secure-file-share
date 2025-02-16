// components/share-drawer.tsx
"use client"

import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle} from "@/components/ui/drawer"
import {Copy, Link2} from "lucide-react"
import {useToast} from "@/hooks/use-toast"
import {Badge} from "@/components/ui/badge"
import {fileService} from "@/services/files"

interface ShareDrawerProps {
    file: any
    open: boolean
    onClose: () => void
}

export function ShareDrawer({file, open, onClose}: ShareDrawerProps) {
    const {toast} = useToast()
    const [days, setDays] = useState(7)
    const [emails, setEmails] = useState<string[]>([])
    const [emailInput, setEmailInput] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [shareLink, setShareLink] = useState("")

    const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value)
        setDays(value)
        setError(null)
    }

    const handleEmailAdd = () => {
        const newEmails = emailInput.split(',')
            .map(e => e.trim())
            .filter(e => e.length > 0 && e.includes('@'))

        if (newEmails.length === 0) return

        setEmails([...emails, ...newEmails])
        setEmailInput('')
    }

    const handleSave = async () => {
        if (days > 30) {
            setError("Expiration days cannot exceed 30")
            return
        }
        if (days < 1) {
            setError("Expiration days must be at least 1")
            return
        }

        setIsLoading(true)
        try {
            // Share the file with expiry days
            const response = await fileService.shareFile(file.id, {
                emails: emails
            })

            setShareLink(response.download_link || "")
            toast({
                title: "Success",
                description: "File shared successfully",
            })
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to share file",
            })
        } finally {
            setIsLoading(false)
        }
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
            setEmails([])
            setEmailInput('')
            setError(null)
            setShareLink("")
        }
    }, [open])

    return (
        <Drawer open={open} onOpenChange={onClose}>
            <DrawerContent className="h-[40vh]">
                <div className="mx-auto w-full max-w-sm p-6">
                    <DrawerHeader>
                        <DrawerTitle className="flex items-center gap-2">
                            <Link2 className="h-5 w-5"/>
                            Share File
                        </DrawerTitle>
                    </DrawerHeader>

                    <div className="space-y-4">
                        {!shareLink ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Set Expiration Days
                                        <span className="text-muted-foreground ml-1">(max 30)</span>
                                    </label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={days}
                                        onChange={handleDaysChange}
                                        className="w-24"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Share With (Optional)</label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Enter emails (comma separated)"
                                            value={emailInput}
                                            onChange={(e) => setEmailInput(e.target.value)}
                                        />
                                        <Button onClick={handleEmailAdd}>Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {emails.map((email, index) => (
                                            <Badge key={index} variant="secondary">
                                                {email}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {error && <p className="text-sm text-red-500">{error}</p>}

                                <Button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    {isLoading ? "Sharing..." : "Share"}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={shareLink}
                                        readOnly
                                        className="truncate"
                                    />
                                    <Button size="sm" onClick={handleCopy}>
                                        <Copy className="h-4 w-4 mr-2"/>
                                        Copy
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    This link will expire after {days} day{days !== 1 ? 's' : ''}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
