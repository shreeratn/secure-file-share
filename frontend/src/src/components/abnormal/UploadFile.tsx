import React, {useState} from 'react';
import {FileUploadDrawer} from './UploadDrawer.tsx';
import {useToast} from "@/hooks/use-toast";
import {fileService} from "@/services/files.ts";
import {Loader2} from "lucide-react"; // Add this import

const UploadFile: React.FC<{ onSuccess?: () => Promise<void> }> = ({ onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const {toast} = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setDrawerOpen(true);
        }
    };

    const handleCancel = () => {
        setFile(null);
        setDrawerOpen(false);
    };

    const handleSubmit = async (status: 'private' | 'public', emails: string[], expiryDays: number) => {
        if (!file) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please select a file to upload.",
            });
            return;
        }

        setIsUploading(true);
        try {
            const uploadedFile = await fileService.uploadFile({
                file,
                status,
                expiry_days: status === 'public' ? expiryDays : undefined
            });

            if (status === 'public' && emails.length > 0) {
                await fileService.shareFile(uploadedFile.id, { emails });
            }

            toast({
                title: "Success",
                description: "File uploaded successfully!",
            });

            handleCancel();
            if (onSuccess) {
                await onSuccess(); // Call the refresh function
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to upload file",
            });
        } finally {
            setIsUploading(false);
        }
    };

    if (isRefreshing) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                    <p className="text-sm text-muted-foreground">Refreshing your secure workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="border-dashed border-2 border-gray-300 p-4 rounded-md text-center">
                <input type="file" id="file" onChange={handleFileChange} className="hidden"/>
                <label htmlFor="file" className="text-blue-500 cursor-pointer">Browse Files</label>
            </div>
            {drawerOpen && (
                <FileUploadDrawer
                    file={file}
                    onClose={handleCancel}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
};

export default UploadFile;
