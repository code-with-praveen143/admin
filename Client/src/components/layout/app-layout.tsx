import { Sidebar } from "@/app/dashboard/components/sidebar";
import { Navbar } from "@/app/dashboard/components/user-nav";
import { Footer } from "./footer";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <Navbar />
      </header>

      <div className="flex-1 flex">
        {/* Sidebar - Hidden on mobile/tablet */}
        <aside className="hidden lg:block fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background">
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64">
          <div className="container py-0">{children}</div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
