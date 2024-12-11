"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import "./globals.css";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthLayout } from "@/components/layout/auth-layout";
import { NotificationProvider } from "./context/notifcation";

const authPages = ["/login", "/signup", "/privacy", "/"];
const validRoutesPrefixes = [
  "/dashboard",
  "/dashboard/college-data",
  "/dashboard/card-data",
  "/dashboard/pdf-uploads",
  "/dashboard/print-station",
  "/dashboard/student-details",
  "/dashboard/internships",
  "/dashboard/user-management",
  "/dashboard/events",
  "/dashboard/notifications",
];

const isValidRoute = (pathname: string) => {
  return validRoutesPrefixes.some((prefix) => pathname.startsWith(prefix));
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = sessionStorage.getItem("auth_token");

        if (!token && isValidRoute(pathname)) {
          router.replace("/");
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/");
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Your loading.tsx will handle the loading state
  if (isLoading) {
    return null;
  }

  return <>{children}</>;
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();
  const isAuthPage = authPages.includes(pathname);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryClientProvider client={queryClient}>
            <NotificationProvider>
              <ProtectedRoute>
                {isAuthPage || !isValidRoute(pathname) ? (
                  <AuthLayout>{children}</AuthLayout>
                ) : (
                  <AppLayout>{children}</AppLayout>
                )}
              </ProtectedRoute>
            </NotificationProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}