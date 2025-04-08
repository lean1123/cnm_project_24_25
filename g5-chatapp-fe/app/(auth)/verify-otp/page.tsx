"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

type Props = {};

const OtpVerifyPage = (props: Props) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [activeInput, setActiveInput] = useState(0);
  const [countdown, setCountdown] = useState(90);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const {verifyOtp, provideOtp, userRegistrationId, emailForgotPassword, verifyForgotPassword} = useAuthStore()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);

    if (value && index < 5) {
      setActiveInput(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      setActiveInput(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newOtp = [...otp];
    
    pastedData.split("").forEach((char, i) => {
      if (i < 6 && /^\d+$/.test(char)) {
        newOtp[i] = char;
      }
    });
    
    setOtp(newOtp);
    setActiveInput(Math.min(pastedData.length - 1, 5));
    inputRefs.current[Math.min(pastedData.length - 1, 5)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    // Add your OTP verification logic here
    if (emailForgotPassword === null) {
    console.log("OTP submitted:", enteredOtp);
    if (enteredOtp.length === 6 && !otp.some((digit) => digit === "") && userRegistrationId) {
      await verifyOtp(userRegistrationId, enteredOtp);
    } else {
      console.error("Invalid OTP length");
      toast.error("Invalid OTP length");
    } } else {
      console.log("OTP submitted:", enteredOtp);
      if (enteredOtp.length === 6 && !otp.some((digit) => digit === "")) {
        await verifyForgotPassword(emailForgotPassword, enteredOtp);
        
      } else {
        console.error("Invalid OTP length");
        toast.error("Invalid OTP length");
      }
    }
  };

  const handleResend = () => {
    setCountdown(90);
    // Add resend OTP logic here
    console.log("Resending OTP...");
    if (userRegistrationId) {
      provideOtp(userRegistrationId);
    } else {
      console.error("User registration ID is not available");
      toast.error("User registration ID is not available");
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">OTP Verification</h1>
          <p className="text-gray-600">
            We've sent a 6-digit code to your email. Enter it below to continue.
          </p>
        </div>

        <div className="flex justify-center space-x-2">
          {otp.map((value, index) => (
            <Input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
                if (activeInput === index) el?.focus();
              }}
              type="text"
              inputMode="numeric"
              value={value}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              onFocus={() => setActiveInput(index)}
              className="h-14 w-14 text-center text-2xl font-semibold [&::-webkit-inner-spin-button]:appearance-none"
              maxLength={1}
              autoFocus={index === 0}
            />
          ))}
        </div>

        <Button
          type="submit"
          className="w-full text-lg"
          disabled={otp.some((digit) => digit === "")}
        >
          Verify OTP
        </Button>

        <div className="text-center text-sm text-gray-600">
          {countdown > 0 ? (
            <span>Resend code in {formatTime(countdown)} seconds</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-primary hover:text-primary/80 font-medium underline"
            >
              Resend OTP
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default OtpVerifyPage;
