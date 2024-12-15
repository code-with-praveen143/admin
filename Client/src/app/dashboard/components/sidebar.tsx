"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  GraduationCap,
  CreditCard,
  FileUp,
  Printer,
  Users,
  Briefcase,
  UserCog,
  Bell,
  CalendarRange,
  Bot,
} from "lucide-react";

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "College Data",
    href: "/dashboard/college-data",
    icon: GraduationCap,
  },
  {
    title: "Card Data",
    href: "/dashboard/card-data",
    icon: CreditCard,
  },
  {
    title: "PDF Uploads",
    href: "/dashboard/pdf-uploads",
    icon: FileUp,
  },
  {
    title: "Previous Papers",
    href: "/dashboard/previous-papers",
    icon: FileUp,
  },
  {
    title: "Print Station",
    href: "/dashboard/print-station",
    icon: Printer,
  },
  {
    title: "Student Details",
    href: "/dashboard/student-details",
    icon: Users,
  },
  {
    title: "Internship/Placement",
    href: "/dashboard/internships",
    icon: Briefcase,
  },
  {
    title: "User Management",
    href: "/dashboard/user-management",
    icon: UserCog,
  },
  {
    title: "Event Management",
    href: "/dashboard/events",
    icon: CalendarRange,
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    title: "Regulations",
    href: "/dashboard/regulations",
    icon: Bell,
  },
  {
    title: "ChatBot",
    href: "/dashboard/chat",
    icon: Bot,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState("");

  useEffect(() => {
    // Retrieve user role from session storage
    const storedRole = sessionStorage.getItem("role");
    if (storedRole) setRole(storedRole);
  }, []);

  // Filter sidebarNavItems based on user role
  const filteredSidebarNavItems = sidebarNavItems.filter((item) => {
    // if (role === "Student") {
    //   return item.title === "ChatBot"; // Only show ChatBot for Student role
    // }
    if (role === "Admin") {
      return item.title !== "ChatBot"; // Show all routes except ChatBot for Admin
    }
    return false; // No items displayed for other roles
  });

  return (
    <ScrollArea className="h-screen">
      <div className="space-y-4 py-8">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {filteredSidebarNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive
                      ? "bg-secondary hover:bg-secondary/80"
                      : "hover:bg-secondary/10"
                  )}
                  asChild
                >
                  <Link href={item.href} className="flex items-center">
                    <item.icon className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
