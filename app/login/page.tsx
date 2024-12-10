"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { 
        callbackUrl: '/projects',
        redirect: true,
      });
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black relative overflow-hidden">
      <div 
        className="absolute inset-0 -z-10 overflow-hidden"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent 0px,
            transparent 10px,
            rgba(0, 0, 0, 0.01) 10px,
            rgba(0, 0, 0, 0.01) 20px
          )`,
          backgroundSize: '100px 100px',
        }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute whitespace-nowrap text-black/[0.015] dark:text-white/[0.015] text-4xl font-bold"
            style={{
              transform: `rotate(-45deg) translate(${i * 200}px, ${i * 200}px)`,
            }}
          >
            Speculate
          </div>
        ))}
      </div>
      
      <Card className="w-full max-w-md mx-auto bg-white dark:bg-black border border-black/10 dark:border-white/10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Sign in</CardTitle>
          <CardDescription className="text-black/60 dark:text-white/60">
            Choose your preferred sign in method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full border-black/20 text-black hover:bg-black/[0.03] dark:border-white/20 dark:text-white dark:hover:bg-white/[0.03]"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-black dark:border-white" />
                </div>
              ) : (
                <>
                  <Image
                    src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                    alt="Google"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  Continue with Google
                </>
              )}
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-black/10 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-black/60 dark:bg-black dark:text-white/60">
                Or continue with
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black dark:text-white">Email</Label>
              <Input 
                id="email" 
                placeholder="m@example.com" 
                type="email" 
                className="border-black/20 bg-transparent focus:border-black dark:border-white/20 dark:focus:border-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-black dark:text-white">Password</Label>
              <Input 
                id="password" 
                type="password"
                className="border-black/20 bg-transparent focus:border-black dark:border-white/20 dark:focus:border-white"
              />
            </div>
            <Button className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90">
              Sign In
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-4">
          <div className="text-sm text-black/60 dark:text-white/60">
            <Link href="/forgot-password" className="hover:text-black dark:hover:text-white">
              Forgot your password?
            </Link>
          </div>
          <div className="text-sm text-black/60 dark:text-white/60">
            Don't have an account?{" "}
            <Link href="/signup" className="hover:text-black dark:hover:text-white">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}