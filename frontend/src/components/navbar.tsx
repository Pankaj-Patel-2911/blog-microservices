"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, Bookmark, LogIn, User } from "lucide-react";
import { useAppData } from "@/context/AppContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { isAuth, user } = useAppData(); // ✅ clean usage

  return (
    <nav className="bg-white shadow-md p-4 z-50">
      <div className="container mx-auto flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-gray-900">
          The Reading Retreat
        </Link>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center space-x-6 text-gray-700">

          {/* Home */}
          <li>
            <Link href="/" className="flex items-center gap-2 hover:text-blue-500 group">
              <Home className="w-5 h-5 group-hover:text-blue-500" />
              <span>Home</span>
            </Link>
          </li>

          {/* Saved Blogs */}
          <li>
            <Link href="/blog/saved" className="flex items-center gap-2 hover:text-blue-500 group">
              <Bookmark className="w-5 h-5 group-hover:text-blue-500" />
              <span>Saved Blogs</span>
            </Link>
          </li>

          {/* Profile / Login */}
          <li>
            {isAuth && user ? (
              <Link href="/profile" className="flex items-center gap-2 group">

                {/* Avatar if available */}
                {user.image ? (
                  <img
                    src={user.image}
                    alt="profile"
                    className="w-8 h-8 rounded-full border-2 border-gray-300 group-hover:border-blue-500"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-700 group-hover:text-blue-500" />
                )}

              </Link>
            ) : (
              <Link href="/login" className="flex items-center gap-2 hover:text-blue-500 group">
                <LogIn className="w-5 h-5 group-hover:text-blue-500" />
                <span>Login</span>
              </Link>
            )}
          </li>

        </ul>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 px-4">
          <ul className="flex flex-col gap-4 text-gray-700">

            <li>
              <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 hover:text-blue-500">
                <Home className="w-5 h-5" />
                Home
              </Link>
            </li>

            <li>
              <Link href="/blog/saved" onClick={() => setIsOpen(false)} className="flex items-center gap-2 hover:text-blue-500">
                <Bookmark className="w-5 h-5" />
                Saved Blogs
              </Link>
            </li>

            <li>
              {isAuth && user ? (
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 hover:text-blue-500"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt="profile"
                      className="w-7 h-7 rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  Profile
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 hover:text-blue-500"
                >
                  <LogIn className="w-5 h-5" />
                  Login
                </Link>
              )}
            </li>

          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;