"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useResendOTP, useVerifyOTP } from "../hooks/auth/useAuth";

type OtpVerificationRequest = {
  otp: string;
};

const otpSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 characters long" }),
});

const OtpVerification = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const router = useRouter();

  const verifyOtpMutation = useVerifyOTP();
  const resendOtpMutation = useResendOTP();

  const form = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (isResendDisabled) {
      countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(countdown);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [isResendDisabled]);

  const onSubmit = async (data: OtpVerificationRequest) => {
    try {
      const email = sessionStorage.getItem("signup_email");
      if (!email) {
        setError("Email is missing. Please sign up again.");
        return;
      }
      await verifyOtpMutation.mutateAsync({ otp: data.otp, email });
      
      router.push("/login");
    } catch (error) {
      setError("OTP verification failed. Please try again.");
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsResendDisabled(true);
      setTimer(30);
      const email = sessionStorage.getItem("signup_email");
      if (!email) {
        setError("Email is missing. Please sign up again.");
        return;
      }
      await resendOtpMutation.mutateAsync({ email });
      setSuccess("A new OTP has been sent to your email.");
    } catch (error) {
      setError("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Verify Your Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-6">
            Enter the 6-digit OTP sent to your registered email.
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={verifyOtpMutation.isPending}
              >
                {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>
          </Form>
          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}
          {success && (
            <p className="text-green-500 text-sm mt-2 text-center">{success}</p>
          )}
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={handleResendOTP}
              disabled={isResendDisabled}
            >
              {isResendDisabled
                ? `Resend OTP in ${timer}s`
                : "Resend OTP"}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="link" onClick={() => router.push("/signup")}>
            Didn't receive the code? Sign up again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OtpVerification;
