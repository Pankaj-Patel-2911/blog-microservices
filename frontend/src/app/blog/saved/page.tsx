"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { BLOG_SERVICE } from "@/context/AppContext";
import Loading from "@/components/loading";
import { Bookmark } from "lucide-react";

interface Blog {
  blogid: number;
  title: string;
  description: string;
  image: string;
  created_at: string;
}

const SavedBlogsPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // 🔥 Fetch saved blogs
  const fetchSavedBlogs = async () => {
    try {
      const token = Cookies.get("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const { data } = await axios.get(
        `${BLOG_SERVICE}/api/v1/blog/saved`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBlogs(data.blogs || []);
    } catch (error) {
      console.error("Error fetching saved blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedBlogs();
  }, []);

  // 🔥 Unsave blog
  const handleUnsave = async (blogid: number) => {
    try {
      const token = Cookies.get("token");

      await axios.delete(`${BLOG_SERVICE}/api/v1/blog/unsave`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { blogid },
      });

      // 🔥 Update UI instantly
      setBlogs((prev) => prev.filter((b) => b.blogid !== blogid));
    } catch (error) {
      console.error("Error unsaving blog:", error);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      {/* 🔥 Header */}
      <h1 className="text-3xl font-bold">Saved Blogs</h1>

      {/* ❌ Empty state */}
      {blogs.length === 0 ? (
        <p className="text-gray-500">No saved blogs yet</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

          {blogs.map((blog) => (
            <div
              key={blog.blogid}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.02] transition"
            >
              {/* 🖼️ Image */}
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-40 object-cover cursor-pointer"
                onClick={() => router.push(`/blog/${blog.blogid}`)}
              />

              {/* 📄 Content */}
              <div className="p-4 space-y-2">

                <div className="flex justify-between items-start">

                  <h2
                    className="font-semibold line-clamp-2 cursor-pointer"
                    onClick={() => router.push(`/blog/${blog.blogid}`)}
                  >
                    {blog.title}
                  </h2>

                  {/* 🔥 Unsave button */}
                  <Bookmark
                    onClick={() => handleUnsave(blog.blogid)}
                    className="fill-black text-black cursor-pointer"
                  />
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {blog.description}
                </p>

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
  );
};

export default SavedBlogsPage;