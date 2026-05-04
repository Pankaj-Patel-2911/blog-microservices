"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/loading";
import { user_Service, BLOG_SERVICE } from "@/context/AppContext";

interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  instagram: string;
  linkedin: string;
  bio: string;
}

interface Blog {
  blogid: number;
  title: string;
  image: string;
  description: string;
}

const AuthorPage = () => {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  const [author, setAuthor] = useState<User | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        const [userRes, blogRes] = await Promise.all([
          // 👤 user service
          axios.get(`${user_Service}/api/v1/user/${id}`),

          // 🔥 FIXED blog service API
          axios.get(`${BLOG_SERVICE}/api/v1/blog/author/${id}`),
        ]);

        setAuthor(userRes.data);

        // your controller returns { blogs: [...] }
        setBlogs(blogRes.data.blogs || []);

      } catch (error) {
        console.error("Error fetching author:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAuthorData();
  }, [id]);

  if (loading) return <Loading />;
  if (!author) return <p className="p-6">Author not found</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">

      {/* 👤 Profile */}
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">

        <img
          src={author.image}
          alt={author.name}
          className="w-32 h-32 rounded-full object-cover"
        />

        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-2xl font-bold">{author.name}</h1>

          <p className="text-gray-500">{author.email}</p>

          {author.bio && (
            <p className="text-gray-700 max-w-xl">{author.bio}</p>
          )}

          <div className="flex gap-4 justify-center md:justify-start mt-2">
            {author.instagram && (
              <a
                href={author.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 hover:underline"
              >
                Instagram
              </a>
            )}

            {author.linkedin && (
              <a
                href={author.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 📰 Blogs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Blogs by {author.name}
        </h2>

        {blogs.length === 0 ? (
          <p className="text-gray-500">No blogs found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

            {blogs.map((blog) => (
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

                <div className="p-4">
                  <h3 className="font-semibold line-clamp-2">
                    {blog.title}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {blog.description}
                  </p>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>

    </div>
  );
};

export default AuthorPage;