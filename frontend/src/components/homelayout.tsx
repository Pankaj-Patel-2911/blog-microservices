"use client";

import React, { ReactNode } from "react";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";

interface BlogProps {
  children: ReactNode;
}

const HomeLayout: React.FC<BlogProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex w-full">

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1">
          <div className="w-full min-h-[calc(100vh-45px)] px-4 py-4">
            {children}
          </div>
        </main>

      </div>
    </SidebarProvider>
  );
};

export default HomeLayout;