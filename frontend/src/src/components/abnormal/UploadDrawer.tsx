import React, {useState} from 'react';
import {Button} from "@/components/ui/button";
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle,} from "@/components/ui/drawer";

interface FileUploadDrawerProps {
    file: File | null;
    expiryDays: number;
    setExpiryDays: (days: number) => void;
    onClose: () => void;
    onSubmit: () => void;
}

export const FileUploadDrawer: React.FC<FileUploadDrawerProps> = ({
                                                                      file,
                                                                      expiryDays,
                                                                      setExpiryDays,
                                                                      onClose,
                                                                      onSubmit
                                                                  }) => {
    const [error, setError] = useState<string | null>(null);

    const handleExpiryDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const days = Number(e.target.value);
        if (days > 30) {
            setError('Expiry days cannot be more than 30.');
        } else {
            setError(null);
        }
        setExpiryDays(days);
    };

    const handleSubmit = () => {
        if (expiryDays > 30) {
            setError('Expiry days cannot be more than 30.');
            return;
        }
        onSubmit();
    };

    return (
        <Drawer open={true} onOpenChange={onClose}>
            <DrawerContent>
                <div className="max-w-[300px] mx-auto p-4">
                    <DrawerHeader className="p-0">
                        <DrawerTitle>File Details</DrawerTitle>
                    </DrawerHeader>
                    {file && (
                        <div className="mb-4 mt-4">
                            <p className="text-sm text-gray-500">
                                <span className="font-medium">File Name:</span>{' '}
                                <span className="truncate block" title={file.name}>
                                        {file.name}
                                    </span>
                            </p>
                            <p className="text-sm text-gray-500">
                                <span className="font-medium">File Size:</span>{' '}
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <p className="text-sm text-gray-500">
                                <span className="font-medium">File Type:</span>{' '}
                                {file.name.split('.').pop()}
                            </p>
                        </div>
                    )}
                    <div className="mb-4">
                        <Label htmlFor="expiry_days">Expiry Days</Label>
                        <Input
                            type="number"
                            id="expiry_days"
                            value={expiryDays}
                            onChange={handleExpiryDaysChange}
                            className="mt-2"
                        />
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                    <div className="flex space-x-4">
                        <Button
                            onClick={handleSubmit}
                            size="sm"
                        >
                            Upload
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            size="sm"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
