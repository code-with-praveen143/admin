"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  GraduationCap,
  CreditCard,
  FileUp,
  Printer,
  Users,
  Briefcase,
  UserCog,
  CalendarRange,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { Bell, LogOut, Settings, User, Sun, Moon, Menu, Bot } from "lucide-react";
import logo from "../../../utils/logo.png";
import logo3 from "../../../utils/logo3.jpeg";
import { useNotifications } from "@/app/context/notifcation";

const NavbarItems = [
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

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
};

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const isMobile =
    typeof window !== "undefined" ? window.innerWidth < 1024 : false;
  const authToken = typeof window !== "undefined" ? sessionStorage.getItem("auth_token") : null;
  const [windowWidth, setWindowWidth] = React.useState(isMobile);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(""); // Role state
  const [isAnimating, setIsAnimating] = useState(false);
  const { notifications } = useNotifications();

  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [notifications.length]);

  useEffect(() => {
    // Retrieve user details from session storage
    const storedUsername = sessionStorage.getItem("username");
    const storedEmail = sessionStorage.getItem("email");
    const storedRole = sessionStorage.getItem("role"); // Retrieve role
    if (storedUsername) setUsername(storedUsername);
    if (storedEmail) setEmail(storedEmail);
    if (storedRole) setRole(storedRole); // Set role
  }, []);

  const handleLogout = () => {
    router.push("/");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("user_id");
    sessionStorage.removeItem("signup_email");
  };

  const getLogoutText = () => {
    const authToken = sessionStorage.getItem("auth_token");
    return authToken ? "Logout" : "Login";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      ?.map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter NavbarItems based on role
  const filteredNavbarItems = NavbarItems.filter((item) => {
    if (role === "Student") {
      return item.title === "ChatBot"; // Show only ChatBot for Student
    }
    if (role === "Admin") {
      return item.title !== "ChatBot"; // Show all except ChatBot for Admin
    }
    return false; // Show nothing for other roles
  });

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center mx-auto relative">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="absolute left-1/2 transform -translate-x-1/2 lg:relative lg:left-0 lg:transform-none lg:flex-1">
            <Image
              src={theme === "dark" ? logo3 : logo}
              alt="Logo"
              width={150}
              height={40}
              className="h-8 w-auto"
            />
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            {!windowWidth && (
              <>
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(username)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {username}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 dark:text-red-400"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{getLogoutText()}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
             {windowWidth && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/01.png" alt="@johndoe" />
                      <AvatarFallback>{getInitials(username)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {username}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                    >
                      {theme === "dark" ? (
                        <Sun className="mr-2 h-4 w-4" />
                      ) : (
                        <Moon className="mr-2 h-4 w-4" />
                      )}
                      <span>Theme</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 dark:text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}  
          </div>
        </div>
      </header>

      <NavigationMenu.Root className="lg:hidden">
        <NavigationMenu.List
          className={`fixed w-full bg-background border-b z-40 shadow-lg transition-transform ${
            isOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <nav className="flex flex-col p-4">
            {filteredNavbarItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start mb-1"
                asChild
                onClick={() => setIsOpen(false)}
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </nav>
        </NavigationMenu.List>
      </NavigationMenu.Root>
    </>
  );
}
