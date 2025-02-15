import {useMemo, useState} from "react"
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card"
import {AlertTriangleIcon, DatabaseIcon, LinkIcon, Share2Icon, ShieldCheckIcon, UserCheckIcon, LockIcon} from "lucide-react"
import {Cell, Pie, PieChart} from "recharts"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart"
import {Progress} from "@/components/ui/progress"
import {Button} from "@/components/ui/button"
import { CardFooter } from "../ui/card"
import {HyperText} from "../magicui/hyper-text.tsx";
import {MFAPendingDrawer} from "./people/PeopleMFAPending.tsx";
import UploadFile from "./UploadFile.tsx";

// Chart configuration
const storageChartConfig = {
    used: {
        label: "Used",
        color: "#0284c7", // Tailwind blue-600
    },
    free: {
        label: "Free",
        color: "#f3f4f6", // Tailwind gray-100
    },
} satisfies ChartConfig

export interface DashboardData {
    totalFiles: number
    usedStorageGB: number
    activeLinks: number
    userRole: 'Guest' | 'Regular' | 'Admin'
    encryptionPercent: number
    sharedLinks: {
        total: number
        viewOnly: number
        downloadable: number
    }
    accessControl: {
        pendingRequests: number
        restrictedFilesPercent: number
        adminOverrides: number
    }
    securityAlerts: {
        failedDecryptAttempts: number
        pendingMFASetups: number
    }
    userRoles: {
        admins: number
        regularUsers: number
        guests: number
    }
}

const STORAGE_LIMIT_GB = 1

const LOCKED_CARD_CLASS = "min-w-[150px] border-2 border-yellow-200 shadow-sm shadow-yellow-600/100 relative"

const LockedContent = () => (
    <>
        <CardContent className="flex items-center">
            <HyperText className="text-2xl font-bold text-red-600">Locked!</HyperText>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
            Contact your Admin to upgrade to Regular user to view analytics
        </CardFooter>
    </>
)

const formatStorage = (valueGB: number) => {
    if (valueGB >= 1) {
        return `${valueGB.toFixed(3)}GB`
    }
    const valueMB = valueGB * 1000
    return `${Math.round(valueMB)}MB`
}

export function DashboardCards({data}: { data: DashboardData }) {
    const storageData = useMemo(() => [
        {category: "used", value: data.usedStorageGB},
        {category: "free", value: STORAGE_LIMIT_GB - data.usedStorageGB},
    ], [data.usedStorageGB])

    const storageText = useMemo(() => ({
        free: formatStorage(STORAGE_LIMIT_GB - data.usedStorageGB),
        used: formatStorage(data.usedStorageGB),
    }), [data.usedStorageGB])

    const [peopleDrawerOpen, setPeopleDrawerOpen] = useState(false)

    const roleColors = {
        Guest: 'text-gray-500',
        Regular: 'text-blue-500',
        Admin: 'text-emerald-500',
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Files Shared Card */}
            <Card className={data.userRole === 'Guest' ? LOCKED_CARD_CLASS : "min-w-[150px]"}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Files Shared</CardTitle>
                    {data.userRole === 'Guest' ? (
                        <LockIcon className="h-4 w-4 text-red-500"/>
                    ) : (
                        <Share2Icon className="h-4 w-4 text-blue-500"/>
                    )}
                </CardHeader>
                {data.userRole === 'Guest' ? (
                    <LockedContent/>
                ) : (
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalFiles}</div>
                        <p className="text-xs text-muted-foreground">
                            files shared till date
                        </p>
                    </CardContent>
                )}
            </Card>

            {/* Storage Card */}
            <Card className={data.userRole === 'Guest' ? LOCKED_CARD_CLASS : "min-w-[150px]"}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Storage</CardTitle>
                    {data.userRole === 'Guest' ? (
                        <LockIcon className="h-4 w-4 text-red-500"/>
                    ) : (
                        <DatabaseIcon className="h-4 w-4 text-green-500"/>
                    )}
                </CardHeader>
                {data.userRole === 'Guest' ? (
                    <LockedContent/>
                ) : (
                    <CardContent className="flex items-center justify-between">
                        {/* Left Text Section */}
                        <div className="space-y-1">
                            <div className="text-2xl font-bold">
                                {storageText.free}
                                <span className="text-sm text-muted-foreground"> / {STORAGE_LIMIT_GB}GB</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Used: {storageText.used}
                            </p>
                        </div>

                        {/* Pie Chart */}
                        <div className="h-[70px] w-[70px] -mr-3">
                            <ChartContainer
                                config={storageChartConfig}
                                className="aspect-square h-full w-full"
                            >
                                <PieChart>
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel/>}
                                    />
                                    <Pie
                                        data={storageData}
                                        dataKey="value"
                                        nameKey="category"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={30}
                                        paddingAngle={0}
                                    >
                                        {storageData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={storageChartConfig[entry.category].color}/>
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ChartContainer>
                        </div>
                    </CardContent>
                )}
            </Card>


            {/* Current Role Card */}
            <Card className="min-w-[150px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Role</CardTitle>
                    <UserCheckIcon className="h-4 w-4 text-purple-500"/>
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${roleColors[data.userRole]}`}>
                        {data.userRole}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        account permissions level
                    </p>
                </CardContent>
                {/*todo: add email in content footer*/}
            </Card>


            {/* Security Alerts */}
            <Card className={data.userRole === 'Guest' ? LOCKED_CARD_CLASS : "min-w-[150px] border-2 border-rose-100"}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                    {data.userRole === 'Guest' ? (
                        <LockIcon className="h-4 w-4 text-red-500"/>
                    ) : (
                        <AlertTriangleIcon className="h-4 w-4 text-rose-500"/>
                    )}
                </CardHeader>
                {data.userRole === 'Guest' ? (
                        <LockedContent/>
                    ) :
                    (
                       <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-3 w-3 rounded-full bg-rose-500"/>
                                    <p>{data.securityAlerts.failedDecryptAttempts} Failed Decryption Attempts</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`flex h-3 w-3 rounded-full ${data.securityAlerts.pendingMFASetups > 0 ? 'bg-yellow-500' : 'bg-green-500'}`}/>
                                    {data.securityAlerts.pendingMFASetups > 0 ? (
                                        <Button
                                            variant="outline"
                                            className="text-yellow-500"
                                            onClick={() => setPeopleDrawerOpen(true)}
                                        >
                                            {data.securityAlerts.pendingMFASetups} MFA Setups Pending
                                        </Button>
                                    ) : (
                                        <p className="text-green-500">No MFA Pending</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    )
                }
            </Card>

            {/* Encryption Health */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Encryption Health</CardTitle>
                    <ShieldCheckIcon className="h-4 w-4 text-emerald-500"/>
                </CardHeader>
                {
                    data.userRole === 'Guest' ? (<CardContent>
                        <div className="text-2xl text-green-600 font-bold">{100}%</div>
                        <p className="text-sm text-green-600 mb-1.5">Files Encrypted</p>
                        <Progress value={100} className="h-2 bg-green-600"/>
                    </CardContent>) : (<CardContent>
                        <div className="text-2xl font-bold">{data.encryptionPercent}%</div>
                        <p className="text-sm text-muted-foreground mb-1.5">Files Encrypted</p>
                        <Progress value={data.encryptionPercent} className="h-2"/>
                    </CardContent>)
                }
                <CardFooter className="text-xs text-muted-foreground">
                    AES-256 Active | Last Audit: 2h ago
                </CardFooter>
            </Card>

            {/* Shared Links Card */}
            <Card className={data.userRole === 'Guest' ? LOCKED_CARD_CLASS : ""}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Shared Links</CardTitle>
                    {data.userRole === 'Guest' ? (
                        <LockIcon className="h-4 w-4 text-red-500"/>
                    ) : (
                        <LinkIcon className="h-4 w-4 text-pink-500"/>
                    )}
                </CardHeader>
                {data.userRole === 'Guest' ? (
                        <LockedContent/>
                    ) :
                    (<CardContent>
                        <div className="text-2xl font-bold">{data.sharedLinks.total}</div>
                        <p className="text-sm text-muted-foreground">Total Links</p>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            <div>
                                <p className="text-lg font-bold">{data.activeLinks}</p>
                                <p className="text-xs text-muted-foreground">Active</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold">{data.sharedLinks.viewOnly}</p>
                                <p className="text-xs text-muted-foreground">View-only</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold">{data.sharedLinks.downloadable}</p>
                                <p className="text-xs text-muted-foreground">Downloadable</p>
                            </div>
                        </div>
                    </CardContent>)}
            </Card>

            {/*Upload Card*/}
            <Card className={data.userRole === 'Guest' ? LOCKED_CARD_CLASS : "min-w-[150px]"}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upload Files</CardTitle>
                    {data.userRole === 'Guest' && <LockIcon className="h-4 w-4 text-red-500"/>}
                </CardHeader>
                {data.userRole === 'Guest' ? (
                        <LockedContent/>
                    ) :
                    (
                        <CardContent>
                            <UploadFile />
                        </CardContent>)}
            </Card>

            {/*People drawer for pending MFA*/}
            {peopleDrawerOpen && (
                <MFAPendingDrawer
                    isOpen={peopleDrawerOpen}
                    onClose={() => setPeopleDrawerOpen(false)}
                />
            )}
        </div>
    )
}
