"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { BLOG_SERVICE } from "@/context/AppContext";
import { useAppData } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const MyBlogs = () => {
  const { user } = useAppData();
  const router = useRouter();

  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchBlogs = async () => {
      const { data } = await axios.get(
        `${BLOG_SERVICE}/api/v1/blog/author/${user._id}`
      );

      setBlogs(data.blogs);
    };

    fetchBlogs();
  }, [user]);

  // 🔥 Delete
  const handleDelete = async (id: number) => {
    const token = Cookies.get("token");

    try {
      await axios.delete(`${BLOG_SERVICE}/api/v1/blog/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBlogs((prev) => prev.filter((b: any) => b.blogid !== id));

      toast.success("Blog deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  if (!user) {
    return <p className="p-6">Please login</p>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">My Blogs</h1>

      {blogs.length === 0 ? (
        <p>No blogs created</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {blogs.map((blog: any) => (
            <div
              key={blog.blogid}
              className="border rounded-lg overflow-hidden shadow hover:shadow-md transition"
            >
              <img
                src={blog.image}
                className="w-full h-40 object-cover"
              />

              <div className="p-4 space-y-2">
                <h2 className="font-semibold line-clamp-2">
                  {blog.title}
                </h2>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {blog.description}
                </p>

                {/* 🔥 Buttons */}
                <div className="flex gap-2 pt-2">

                  {/* Update */}
                  <button
                    onClick={() => router.push(`/blog/edit/${blog.blogid}`)}
                    className="bg-black text-white px-3 py-1 rounded text-sm"
                  >
                    Update
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(blog.blogid)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>

                </div>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default MyBlogs;