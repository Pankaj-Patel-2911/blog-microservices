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

// 🔥 User type
export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  instagram: string;
  linkedin: string;
  bio: string;
}

// 🔥 Blog type
export interface Blog {
  blogid: number;
  title: string;
  description: string;
  image: string;
  blogcontent: string;
  category: string;
  author: string;
  created_at: string;
}

// 🔥 Context type
interface AppContextType {
  user: User | null;
  isAuth: boolean;
  loading: boolean;

  blogs: Blog[];
  blogLoading: boolean;

  // 🔥 added
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;

  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;

  fetchBlogs: () => Promise<void>;

  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

// 🔥 Context
export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // 🔐 Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  // 📝 Blog state
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogLoading, setBlogLoading] = useState(false);

  // 🔥 FIXED states
  const [category, setCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // 🔥 Fetch user
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

  // 🔥 Fetch blogs
  const fetchBlogs = async () => {
    try {
      setBlogLoading(true);

      // ✅ clean URL
      const url = new URL(`${BLOG_SERVICE}/api/v1/blog/all`);

      if (searchQuery) {
        url.searchParams.append("searchQuery", searchQuery);
      }

      if (category && category !== "All") {
        url.searchParams.append("category", category);
      }

      const { data } = await axios.get(url.toString());

      setBlogs(data.blogs || data);
    } catch (error) {
      console.log("Blog fetch error:", error);
    } finally {
      setBlogLoading(false);
    }
  };

  // 🔥 Initial load
  useEffect(() => {
    fetchUser();
  }, []);

  // 🔥 Refetch on filter change
  useEffect(() => {
    fetchBlogs();
  }, [searchQuery, category]);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={clientId!}>
      <AppContext.Provider
        value={{
          user,
          isAuth,
          loading,

          blogs,
          blogLoading,
          fetchBlogs,

          // 🔥 added
          category,
          setCategory,

          searchQuery,
          setSearchQuery,

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

// 🔥 Hook
export const useAppData = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }
  return context;
};