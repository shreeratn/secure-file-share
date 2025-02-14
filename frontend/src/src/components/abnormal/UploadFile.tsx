import React, {useState} from 'react';
import {FileUploadDrawer} from './UploadDrawer.tsx';
import {useToast} from "@/hooks/use-toast";
import {fileService} from "@/services/files.ts"; // Import shadcn toast

const UploadFile: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [expiryDays, setExpiryDays] = useState<number>(1);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const {toast} = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setDrawerOpen(true);
        }
    };

    const handleCancel = () => {
        setFile(null);
        setExpiryDays(1);
        setDrawerOpen(false);
    };

    const handleSubmit = async () => {
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
            await fileService.uploadFile({
                file,
                status: 'private',
                expiry_days: expiryDays
            });

            toast({
                title: "Success",
                description: "File uploaded successfully!",
            });

            handleCancel(); // Reset and close drawer
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

    return (
        <div>
            <div className="border-dashed border-2 border-gray-300 p-4 rounded-md text-center">
                <input type="file" id="file" onChange={handleFileChange} className="hidden"/>
                <label htmlFor="file" className="text-blue-500 cursor-pointer">Browse Files</label>
            </div>
            {drawerOpen && (
                <FileUploadDrawer
                    file={file}
                    expiryDays={expiryDays}
                    setExpiryDays={setExpiryDays}
                    onClose={handleCancel}
                    onSubmit={handleSubmit}
                    isUploading={isUploading}
                />
            )}
        </div>
    );
};

export default UploadFile;
