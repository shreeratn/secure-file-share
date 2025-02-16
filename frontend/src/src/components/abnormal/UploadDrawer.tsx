import React, {useState} from 'react';
import {Button} from "@/components/ui/button";
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle,} from "@/components/ui/drawer";
import {Badge} from "@/components/ui/badge";

interface FileUploadDrawerProps {
    file: File | null;
    onClose: () => void;
    onSubmit: (status: 'private' | 'public', emails: string[], expiryDays: number) => void;
}

export const FileUploadDrawer: React.FC<FileUploadDrawerProps> = ({
                                                                      file,
                                                                      onClose,
                                                                      onSubmit
                                                                  }) => {
    const [status, setStatus] = useState<'private' | 'public'>('private');
    const [expiryDays, setExpiryDays] = useState(7);
    const [emails, setEmails] = useState<string[]>([]);
    const [emailInput, setEmailInput] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleEmailAdd = () => {
        const newEmails = emailInput.split(',')
            .map(e => e.trim())
            .filter(e => e.length > 0 && e.includes('@'));

        if (newEmails.length === 0) return;

        setEmails([...emails, ...newEmails]);
        setEmailInput('');
    };

    const handleSubmit = () => {
        if (status === 'public') {
            if (expiryDays > 30 || expiryDays < 1) {
                setError('Expiry days must be between 1-30');
                return;
            }
            if (emails.length === 0) {
                setError('Please add at least one email');
                return;
            }
        }

        onSubmit(status, emails, expiryDays);
    };

    return (
        <Drawer open={true} onOpenChange={onClose}>
            <DrawerContent>
                <div className="max-w-[300px] mx-auto p-4">
                    <DrawerHeader className="p-0">
                        <DrawerTitle>File Details</DrawerTitle>
                    </DrawerHeader>

                    {file && (
                        <div className="mb-4 mt-4 space-y-2">
                            <p className="text-sm"><span className="font-medium">Name:</span> {file.name}</p>
                            <p className="text-sm"><span
                                className="font-medium">Size:</span> {(file.size / 1024 / 1024).toFixed(2)}MB</p>
                            <p className="text-sm"><span
                                className="font-medium">Type:</span> {file.name.split('.').pop()}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Button
                                variant={status === 'private' ? 'default' : 'outline'}
                                onClick={() => setStatus('private')}
                                size="sm"
                            >
                                Private
                            </Button>
                            <Button
                                variant={status === 'public' ? 'default' : 'outline'}
                                onClick={() => setStatus('public')}
                                size="sm"
                            >
                                Share Publicly
                            </Button>
                        </div>

                        {status === 'public' && (
                            <div className="space-y-2">
                                <div>
                                    <Label>Share With</Label>
                                    <div className="flex gap-2 mt-1">
                                        <Input
                                            placeholder="Enter emails (comma separated)"
                                            value={emailInput}
                                            onChange={(e) => setEmailInput(e.target.value)}
                                        />
                                        <Button
                                            onClick={handleEmailAdd}
                                            size="sm"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {emails.map((email, index) => (
                                            <Badge key={index} variant="secondary">
                                                {email}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label>Link Expires In (Days)</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={expiryDays}
                                        onChange={(e) => setExpiryDays(Math.min(30, Math.max(1, Number(e.target.value))))}
                                    />
                                </div>
                            </div>
                        )}

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <div className="flex gap-2">
                            <Button onClick={handleSubmit} size="sm">
                                Confirm Upload
                            </Button>
                            <Button variant="outline" onClick={onClose} size="sm">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
