import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useForm } from "react-hook-form"

export function Login() {
    const [activeTab, setActiveTab] = useState("login")

    // Separate forms for login and registration
    const loginForm = useForm()
    const regForm = useForm()

    const [passwordValid, setPasswordValid] = useState({
        length: false,
        uppercase: false,
        specialChar: false,
        digit: false,
    })

    // Handle tab change with form resets
    const handleTabChange = (value: string) => {
        setActiveTab(value)
        loginForm.reset()
        regForm.reset()
        setPasswordValid({
            length: false,
            uppercase: false,
            specialChar: false,
            digit: false,
        })
    }

    const handleLoginSubmit = (data: any) => {
        console.log("Login Data:", data)
    }

    const handleRegSubmit = (data: any) => {
        console.log("Registration Data:", data)
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setPasswordValid({
            length: value.length >= 6 && value.length <= 18,
            uppercase: /[A-Z]/.test(value),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
            digit: /\d/.test(value),
        })
        regForm.setValue("regPassword", value) // Update form value
    }

    return (
        <Tabs
            defaultValue="login"
            className="w-[400px]"
            onValueChange={handleTabChange}
        >
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="registration">Registration</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="h-[500px] transition-all duration-300">
                <Card>
                    <CardHeader>
                        <CardTitle>Login</CardTitle>
                        <CardDescription>Enter your username and password to login.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    {...loginForm.register("username", { required: "Username is required" })}
                                />
                                {loginForm.formState.errors.username && (
                                    <p className="text-red-500">{loginForm.formState.errors.username.message as string}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...loginForm.register("password", { required: "Password is required" })}
                                />
                                {loginForm.formState.errors.password && (
                                    <p className="text-red-500">{loginForm.formState.errors.password.message as string}</p>
                                )}
                            </div>
                            <CardFooter className="flex flex-row-reverse pr-0">
                                <Button type="submit">Login</Button>
                            </CardFooter>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Registration Tab */}
            <TabsContent value="registration" className="h-[500px] transition-all duration-300">
                <Card>
                    <CardHeader>
                        <CardTitle>Registration</CardTitle>
                        <CardDescription>Fill in the details to register a new account.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <form onSubmit={regForm.handleSubmit(handleRegSubmit)} className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    {...regForm.register("name", { required: "Name is required" })}
                                />
                                {regForm.formState.errors.name && (
                                    <p className="text-red-500">{regForm.formState.errors.name.message as string}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...regForm.register("email", { required: "Email is required" })}
                                />
                                {regForm.formState.errors.email && (
                                    <p className="text-red-500">{regForm.formState.errors.email.message as string}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="reg-password">Password</Label>
                                <Input
                                    id="reg-password"
                                    type="password"
                                    {...regForm.register("regPassword", {
                                        required: "Password is required",
                                        minLength: { value: 6, message: "Password must be at least 6 characters" },
                                        maxLength: { value: 18, message: "Password must be at most 18 characters" },
                                    })}
                                    onChange={handlePasswordChange}
                                />
                                {regForm.formState.errors.regPassword && (
                                    <p className="text-red-500">{regForm.formState.errors.regPassword.message as string}</p>
                                )}
                                <div className="text-gray-500">
                                    <p className={passwordValid.length ? "text-green-500" : "text-red-500"}>6-18 characters</p>
                                    <p className={passwordValid.uppercase ? "text-green-500" : "text-red-500"}>One uppercase letter</p>
                                    <p className={passwordValid.specialChar ? "text-green-500" : "text-red-500"}>One special character</p>
                                    <p className={passwordValid.digit ? "text-green-500" : "text-red-500"}>One digit</p>
                                </div>
                            </div>
                            <CardFooter className="flex flex-row-reverse pr-0">
                                <Button type="submit">Register</Button>
                            </CardFooter>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
