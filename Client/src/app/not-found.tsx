'use client'
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo2 from "../utils/logo2.png";

const NotFoundPage: React.FC = () => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-3">
          <Image src={logo2} alt="Logo" width={200} height={200} />
        </div>
        <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
        <p className="text-lg text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button onClick={handleGoHome}>Go to Home</Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
