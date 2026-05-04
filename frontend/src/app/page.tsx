"use client";

import { useAppData } from "@/context/AppContext";
import Loading from "@/components/loading";
import SideBar from "@/components/ui/HomeSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Home = () => {
  const { loading, blogLoading, blogs } = useAppData();
  const router = useRouter();

  // 🔥 Sort state
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  if (loading) return <Loading />;

  // 🔥 Sort blogs
  const sortedBlogs = [...blogs].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();

    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">

        {/* 🧭 Sidebar */}
        <SideBar />

        {/* 📰 Main */}
        <div className="flex-1 p-6">

          {/* 🔥 Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Latest Blogs</h1>

            {/* ✅ Sort Dropdown */}
            <select
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(e.target.value as "asc" | "desc")
              }
              className="border px-3 py-2 rounded-lg text-sm"
            >
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </select>
          </div>

          {blogLoading ? (
            <p className="text-gray-500">Loading blogs...</p>
          ) : sortedBlogs.length === 0 ? (
            <p>No blogs found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

              {sortedBlogs.map((blog) => (
                <div
                  key={blog.blogid}
                  onClick={() => router.push(`/blog/${blog.blogid}`)}
                  className="cursor-pointer border rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.02] transition"
                >
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-40 object-cover"
                  />

                  <div className="p-4 space-y-2">
                    <h2 className="font-semibold line-clamp-2">
                      {blog.title}
                    </h2>

                    <p className="text-sm text-gray-600 line-clamp-3">
                      {blog.description}
                    </p>

                    {/* 📅 Date */}
                    <p className="text-xs text-gray-400">
                      {new Date(blog.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

      </div>
    </SidebarProvider>
  );
};

export default Home;