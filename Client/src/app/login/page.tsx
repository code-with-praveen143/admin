"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLogin } from "../hooks/auth/useAuth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../utils/logo.png";
import logo3 from "../../utils/logo3.jpeg";
import { useTheme } from "next-themes";
type LoginRequest = {
  email: string;
  password: string;
};

const ClientSideImage = dynamic(() => import("next/image"), { ssr: false });
const queryClient = new QueryClient();
const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});
function LoginPageContent() {
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const signInForm = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loginMutation = useLogin();

  const onSignInSubmit = async (data: LoginRequest) => {
    try {
      const response = await loginMutation.mutateAsync(data);
      console.log("Login successful:", response);
      // Store the token in localStorage or a secure cookie
      sessionStorage.setItem("auth_token", response.token);
      sessionStorage.setItem("username", response.user.username);
      sessionStorage.setItem("email", response.user.email);
      sessionStorage.setItem("user_id", response.user._id);
      sessionStorage.setItem("role", response.user.role);
      // Redirect to dashboard or home page
      if(response.user.role === "Student"){
      router.push("/dashboard/chat");
      }
      else{
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:items-center lg:justify-center lg:p-8 lg:w-1/2">
          <div className="relative h-64 w-full">
            {isClient && (
              <ClientSideImage
                src={theme === "dark" ? logo3 : logo}
                alt="Campusify Logo"
                layout="fill"
                objectFit="contain"
                priority
              />
            )}
          </div>
          <h2 className="mt-8 max-w-xl text-center text-3xl font-bold leading-tight text-gray-700 dark:text-gray-200">
            Transform Your Campus Operations with Campusify
          </h2>
        </div>

        <div className="flex flex-1 items-center justify-center p-4 w-full lg:w-1/2">
          <Card className="w-full max-w-[400px] shadow-xl border-0 bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm">
            <CardHeader className="space-y-2 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative h-16 w-32">
                  <ClientSideImage
                    src={theme === "dark" ? logo3 : logo}
                    alt="Campusify"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="space-y-1.5">
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl dark:text-white">
                    Welcome back
                  </h1>
                  <p className="text-sm text-muted-foreground sm:text-base dark:text-gray-400">
                    Enter your credentials to sign in to your account
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...signInForm}>
                <form
                  onSubmit={signInForm.handleSubmit(onSignInSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            className="shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-700"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          <Link
                            href="/forgot-password"
                            className="text-xs text-secondary hover:underline hover:underline-offset-4"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder="Enter your password"
                              type={showPassword ? "text" : "password"}
                              autoCapitalize="none"
                              autoComplete="current-password"
                              autoCorrect="off"
                              className="shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-700 pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <EyeOff
                                  className={`h-6 w-6 text-${
                                    theme === "dark" ? "white" : "gray-800"
                                  }`}
                                  aria-hidden="true"
                                />
                              ) : (
                                <Eye
                                  className={`h-6 w-6 text-${
                                    theme === "dark" ? "white" : "gray-800"
                                  }`}
                                  aria-hidden="true"
                                />
                              )}
                              <span className="sr-only">
                                {showPassword
                                  ? "Hide password"
                                  : "Show password"}
                              </span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-primary text-white shadow-md hover:bg-primary/80"
                    size="lg"
                  >
                    Sign in
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 text-center">
              <p className="px-2 text-sm text-muted-foreground dark:text-gray-400">
                Don&apos;t have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 text-secondary hover:underline hover:underline-offset-4"
                  onClick={() => router.push("/signup")}
                >
                  Sign up
                </Button>
              </p>
              <p className="px-2 text-xs text-muted-foreground dark:text-gray-400">
                By continuing, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-blue-600 hover:underline hover:underline-offset-4 dark:text-blue-400"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-blue-600 hover:underline hover:underline-offset-4 dark:text-blue-400"
                >
                  Privacy Policy
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LoginPageContent />
    </QueryClientProvider>
  );
}
