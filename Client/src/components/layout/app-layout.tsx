import React from "react";
import { Sidebar } from "@/app/dashboard/components/sidebar";
import { Navbar } from "@/app/dashboard/components/user-nav";
import { Footer } from "./footer";
import Chatbot from "@/app/dashboard/chat/page";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const userRole =
    typeof window !== "undefined" ? sessionStorage.getItem("role") : null;

  if (userRole === "Student") {
    // Render Chatbot UI for Student role
    return (
      <div className="relative min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Navbar />
        <Chatbot />
        </header>
        
      </div>
    );
  }

  // Render the default layout for other roles
  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      {/* Header */}
      {userRole === "SuperAdmin" && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Navbar />
        </header>
      )}

      <div className="flex-1 flex flex-col lg:flex-row">
        {userRole === "SuperAdmin" && (
          <>
            {/* Mobile sidebar */}
            <aside
              className={`fixed inset-y-0 left-0 z-50 w-64 bg-background transform ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              } transition-transform duration-300 ease-in-out lg:hidden`}
            >
              <div className="h-16 flex items-center justify-between px-4 border-b">
                <span className="text-lg font-semibold">Dashboard</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2">
                  <span className="sr-only">Close sidebar</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <Sidebar />
            </aside>

            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0 border-r bg-background">
              <div className="h-full overflow-y-auto">
                <Sidebar />
              </div>
            </aside>
          </>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      <Footer />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
