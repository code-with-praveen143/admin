import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function RecentUploads() {
  return (
    <div className="space-y-8">
      {recentUploads?.map((upload, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={upload.avatar} alt="Avatar" />
            <AvatarFallback>{upload.name[0]}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{upload.name}</p>
            <p className="text-sm text-muted-foreground">{upload.email}</p>
          </div>
          <div className="ml-auto font-medium">{upload.amount}</div>
        </div>
      ))}
    </div>
  );
}

const recentUploads = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "3 files",
    avatar: "/avatars/01.png",
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: "2 files",
    avatar: "/avatars/02.png",
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "5 files",
    avatar: "/avatars/03.png",
  },
  {
    name: "William Kim",
    email: "will@email.com",
    amount: "1 file",
    avatar: "/avatars/04.png",
  },
  {
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: "4 files",
    avatar: "/avatars/05.png",
  },
];
