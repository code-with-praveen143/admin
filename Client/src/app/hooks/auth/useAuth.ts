import { useMutation } from "@tanstack/react-query";
import { BASE_URL } from "@/app/utils/constants";
const API_URL = `${BASE_URL}/api`;

type SignupRequest = {
    username: string;
    email: string;
    password: string;
    role: string;
    yearOfJoining: any;
  };

type OtpVerificationRequest = {
    email: string;
    otp: string;
  };  
  
  type LoginRequest = {
    email: string;
    password: string;
  };
  
export const useSignUp = () => {
  return useMutation({
    mutationFn: async (data: SignupRequest) => {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Signup failed");
      }
      return response.json();
    },
  });
};
export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: async (data:OtpVerificationRequest) => {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("OTP verification failed");
      }
      return response.json();
    },
  });
};
export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Login failed");
      }
      return response.json();
    },
  });
};

async function completeProfile(profileData: any) {
    const response = await fetch(`${API_URL}/auth/complete-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error completing profile");
    }
  
    return response.json();
  }
  
  export const useCompleteProfileMutation = () => {
    return useMutation({
      mutationFn: completeProfile,
    });
  }
