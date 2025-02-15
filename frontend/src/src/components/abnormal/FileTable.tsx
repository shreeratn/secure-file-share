// components/file-table.tsx
"use client"

import {useState} from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {Button} from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Badge} from "@/components/ui/badge"
import {Checkbox} from "@/components/ui/checkbox"
import {
    Download,
    Share2,
    Lock,
    MoreVertical,
    Trash2,
    Loader2,
} from "lucide-react"
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs"
import { ShareDrawer } from "./ShareDrawer.tsx"
import { useToast } from "@/hooks/use-toast"
import { fileService } from "@/services/files.ts"

export interface File {
    expiry_date: string;
    id: string
    name: string
    size: any
    extension: string
    isShared: boolean
    expiry?: string
    sharedBy?: string
    uploadedAt?: Date
    sharedAt?: Date
    uploaded_date?: String
}

interface FileTableProps {
    userRole: 'Guest' | 'Regular' | 'Admin'
    ownedFiles: any
    sharedFiles: any
}

export const columns: ColumnDef<File>[] = [
    {
        id: "select",
        header: ({table}) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({row}) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
    },
    {
        accessorKey: "name",
        header: "File Name",
    },
    {
        accessorKey: "size",
        header: "Size",
        cell: ({ row }) => formatFileSize(row.getValue("size")),
    },
    {
        accessorKey: "extension",
        header: "Type",
        cell: ({row}) => (
            <Badge variant="outline">{row.getValue("extension").toUpperCase()}</Badge>
        ),
    },
    {
        accessorKey: "isShared",
        header: "Status",
        cell: ({row}) => row.original.isShared ? (
            <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-green-500"/>
                <span>Shared</span>
            </div>
        ) : (
            <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-red-500"/>
                <span>Private</span>
            </div>
        ),
    },
    {
        accessorKey: "expiry",
        header: "Expires In",
    },
    {
        accessorKey: "uploadedAt",
        header: "Upload Date",
        cell: ({row}) => new Date(row.original.uploadedAt).toLocaleDateString(),
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <>
                {isDeleting ? (
                    <div className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin"/>
                    </div>
                ) : (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => console.log('Download', row.original)}>
                                Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                setSelectedFile(row.original)
                                setShareDrawerOpen(true)
                            }}>
                                Share
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(row.original.id)}
                                className="text-red-500"
                            >
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </>
        ),
    },
]

const sharedColumns: ColumnDef<File>[] = [
    {
        accessorKey: "name",
        header: "File Name",
    },
    {
        accessorKey: "size",
        header: "Size",
        cell: ({ row }) => formatFileSize(row.getValue("size")),
    },
    {
        accessorKey: "extension",
        header: "Type",
        cell: ({row}) => (
            <Badge variant="outline">{row.getValue("extension").toUpperCase()}</Badge>
        ),
    },
    {
        accessorKey: "sharedBy",
        header: "Shared By",
    },
    {
        accessorKey: "sharedAt",
        header: "Shared Date",
        cell: ({row}) => row.original.sharedAt ?
            new Date(row.original.sharedAt).toLocaleDateString() : "-",
    },
    {
        accessorKey: "expiry",
        header: "Expires In",
    },
    {
        id: "download",
        cell: ({row}) => (
            <Button variant="ghost" size="sm">
                <Download className="h-4 w-4 mr-2"/>
                Download
            </Button>
        ),
    },
]

function formatFileSize(size: number): string {
    if (size >= 1024 * 1024 * 300) {
        return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    } else {
        return (size / (1024 * 1024)).toFixed(2) + ' MB';
    }
}

export function FileTable({userRole, ownedFiles, sharedFiles}: FileTableProps) {
    const [activeTab, setActiveTab] = useState<'owned' | 'shared'>(userRole === 'Guest' ? 'shared' : 'owned')
    const [rowSelection, setRowSelection] = useState({})
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [shareDrawerOpen, setShareDrawerOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const columns: ColumnDef<File>[] = [
        {
            id: "select",
            header: ({table}) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({row}) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
        },
        {
            accessorKey: "name",
            header: "File Name",
        },
        {
            accessorKey: "size",
            header: "Size",
            cell: ({ row }) => formatFileSize(row.getValue("size")),
        },
        {
            accessorKey: "extension",
            header: "Type",
            cell: ({row}) => (
                <Badge variant="outline">{row.getValue("extension").toUpperCase()}</Badge>
            ),
        },
        {
            accessorKey: "isShared",
            header: "Status",
            cell: ({row}) => row.original.isShared ? (
                <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-green-500"/>
                    <span>Shared</span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-red-500"/>
                    <span>Private</span>
                </div>
            ),
        },
        {
            accessorKey: "expiry",
            header: "Expires In",
            cell: ({ row }) => {
                const expiryDate = row.original.expiry_date; // match the exact field name from API
                if (!expiryDate) return "-";

                // Calculate remaining days
                const now = new Date();
                const expiry = new Date(expiryDate);
                const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

                return `${diffDays} days`;
            }

        },
        {
            accessorKey: "uploadedAt",
            header: "Upload Date",
            cell: ({ row }) => {
                const date = row.original["uploaded_date"];
                return date ? new Date(date).toLocaleDateString() : "-";
            }
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <>
                    {isDeleting ? (
                        <div className="flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin"/>
                        </div>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => console.log('Download', row.original)}>
                                    Download
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    setSelectedFile(row.original)
                                    setShareDrawerOpen(true)
                                }}>
                                    Share
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleDelete(row.original.id)}
                                    className="text-red-500"
                                >
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </>
            ),
        }
    ]

    const table = useReactTable({
        data: activeTab === 'owned' ? ownedFiles : sharedFiles,
        columns: activeTab === 'owned' ? columns : sharedColumns,
        getCoreRowModel: getCoreRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
        },
    })

    const handleDelete = async (fileId: string) => {
        setIsDeleting(true);
        try {
            await fileService.deleteFile(fileId);
            toast({
                title: "Success",
                description: "File deleted successfully",
            });
            window.location.reload(); // Refresh the page
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to delete file",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="rounded-md border mt-4 flex flex-col h-[calc(100vh-540px)]">
            <div className="flex items-center justify-between p-4 border-b">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'owned' | 'shared')}>
                    <TabsList>
                        {userRole !== 'Guest' && (
                            <TabsTrigger value="owned">
                                Your Files ({ownedFiles.length})
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="shared">
                            Shared with You ({sharedFiles.length})
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-4">
                    {activeTab === 'owned' && table.getSelectedRowModel().rows.length > 0 && (
                        <Button
                            variant="ghost"
                            onClick={() => console.log('Delete selected', table.getSelectedRowModel().rows)}
                            className="text-red-500 ml-auto"
                        >
                            <Trash2 className="h-4 w-4 mr-2"/>
                            Delete Selected ({table.getSelectedRowModel().rows.length})
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-background">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No files found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {selectedFile && (
                <ShareDrawer
                    file={selectedFile}
                    open={shareDrawerOpen}
                    onClose={() => {
                        setShareDrawerOpen(false)
                        setSelectedFile(null)
                    }}
                />
            )}

        </div>
    )
}
