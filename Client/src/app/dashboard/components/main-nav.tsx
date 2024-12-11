// import Link from "next/link";

// import { cn } from "@/lib/utils";

// export function MainNav({
//   className,
//   ...props
// }: React.HTMLAttributes<HTMLElement>) {
//   return (
//     <nav
//       className={cn("flex items-center space-x-4 lg:space-x-6", className)}
//       {...props}
//     >
//       <Link
//         href="/dashboard"
//         className="text-sm font-medium transition-colors hover:text-primary"
//       >
//         Overview
//       </Link>
//       <Link
//         href="/dashboard/college-data"
//         className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
//       >
//         College Data
//       </Link>
//       <Link
//         href="/dashboard/card-data"
//         className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
//       >
//         Card Data
//       </Link>
//       <Link
//         href="/dashboard/pdf-uploads"
//         className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
//       >
//         PDF Uploads
//       </Link>
//       <Link
//         href="/dashboard/print-station"
//         className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
//       >
//         Print Station
//       </Link>
//       <Link
//         href="/dashboard/student-details"
//         className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
//       >
//         Student Details
//       </Link>
//       <Link
//         href="/dashboard/internships"
//         className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
//       >
//         Internships
//       </Link>
//     </nav>
//   );
// }
