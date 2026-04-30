"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { user_Service, useAppData } from "@/context/AppContext";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useGoogleLogin, CodeResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";

const LoginPage = () => {
  const router = useRouter();
  
  const { isAuth, setIsAuth, setUser, loading,setLoading} = useAppData();

  const handleGoogleLogin = async (authResult: CodeResponse) => {
    setLoading(true);
    try {
      if (!authResult.code) {
        toast.error("Google auth failed");
        return;
      }
      console.log(authResult.code);

      const result = await axios.post(`${user_Service}/api/v1/login`, {
        code: authResult.code,
        
      });

      Cookies.set("token", result.data.token, {
        expires: 5,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });

      // ✅ update both
      setUser(result.data.user);
      setIsAuth(true);
      setLoading(false);

      toast.success("Login successful");
    } catch (error) {
      console.error(error);
      toast.error("Problem while login");
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleLogin,
    onError: () => toast.error("Google login failed"),
    flow: "auth-code",
  });

  useEffect(() => {
    if (isAuth) {
      router.push("/");
    }
  }, [isAuth, router]);

  if (loading) return <Loading />;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Sign in using your Google account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            onClick={() => googleLogin()}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;