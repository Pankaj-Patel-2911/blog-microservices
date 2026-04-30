"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const user_Service = process.env.NEXT_PUBLIC_User_Service!;
export const AUTHOR_SERVICE = process.env.NEXT_PUBLIC_AUTHOR_SERVICE!;
export const BLOG_SERVICE = process.env.NEXT_PUBLIC_BLOG_SERVICE!;

export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  instagram: string;
  linkedin: string;
  bio: string;
}

interface AppContextType {
  user: User | null;
  isAuth: boolean;
  loading: boolean;

  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = Cookies.get("token");

      if (!token) {
        setLoading(false);
        return;
      }

      const { data } = await axios.get(`${user_Service}/api/v1/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data);
      setIsAuth(true);
     
    } catch (error) {
      console.log(error);
      setUser(null);
      setIsAuth(false);
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={clientId!}>
      <AppContext.Provider
        value={{
          user,
          isAuth,
          loading,
          setUser,
          setIsAuth,
          setLoading,
        }}
      >
        {children}
        <Toaster />
      </AppContext.Provider>
    </GoogleOAuthProvider>
  );
};

export const useAppData = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }
  return context;
};