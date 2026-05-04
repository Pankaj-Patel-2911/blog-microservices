"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/loading";
import { BLOG_SERVICE, user_Service, AUTHOR_SERVICE } from "@/context/AppContext";
import Cookies from "js-cookie";
import { Bookmark, Loader2 } from "lucide-react";
import { useAppData } from "@/context/AppContext";
import toast from "react-hot-toast";

interface Blog {
  blogid: number;
  title: string;
  description: string;
  image: string;
  blogcontent: string;
  category: string;
  author: string;
  created_at: string;
}

interface Comment {
  commentid: number;
  comment: string;
  userid: string;
  username: string;
  blogid: number;
}

const BlogPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAppData();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [loading, setLoading] = useState(true);

  const [isSaved, setIsSaved] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  // 🔥 AI SUMMARY
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // 🔥 Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const blogRes = await axios.get(
          `${BLOG_SERVICE}/api/v1/blog/${id}`
        );

        const blogData = blogRes.data.blog || blogRes.data;
        setBlog(blogData);

        const userRes = await axios.get(
          `${user_Service}/api/v1/user/${blogData.author}`
        );
        setAuthorName(userRes.data.name);

        const commentRes = await axios.get(
          `${BLOG_SERVICE}/api/v1/comment/${id}`
        );
        setComments(commentRes.data.comments || []);

        const token = Cookies.get("token");
        if (token) {
          const savedRes = await axios.get(
            `${BLOG_SERVICE}/api/v1/blog/saved`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const exists = savedRes.data.blogs?.some(
            (b: any) => b.blogid === blogData.blogid
          );

          setIsSaved(exists);
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // 🔥 AI SUMMARY HANDLER
  const handleSummary = async () => {
    try {
      setLoadingSummary(true);

      const token = Cookies.get("token");

      const res = await fetch(
        `${AUTHOR_SERVICE}/api/v1/ai/summary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ blog: blog?.blogcontent }),
        }
      );

      const data = await res.json();

      if (data.aiBusy) {
        toast.error("AI is busy, try again ⚡");
        return;
      }

      setSummary(data.summary);
      setShowSummary(true);

    } catch (err) {
      console.error(err);
      toast.error("Failed to generate summary");
    } finally {
      setLoadingSummary(false);
    }
  };

  // 🔥 Add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const token = Cookies.get("token");
    if (!token) return toast.error("Login first");

    await axios.post(
      `${BLOG_SERVICE}/api/v1/comment`,
      {
        comment: newComment,
        blogid: id,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setNewComment("");

    const res = await axios.get(`${BLOG_SERVICE}/api/v1/comment/${id}`);
    setComments(res.data.comments);
  };

  // 🔥 Delete comment
  const handleDelete = async (commentid: number) => {
    const token = Cookies.get("token");

    await axios.delete(
      `${BLOG_SERVICE}/api/v1/comment/${commentid}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setComments((prev) =>
      prev.filter((c) => c.commentid !== commentid)
    );
  };

  // 🔥 Save toggle
  const handleSaveToggle = async () => {
    if (!blog) return;

    const token = Cookies.get("token");
    if (!token) return toast.error("Login first");

    const url = isSaved
      ? `${BLOG_SERVICE}/api/v1/blog/unsave`
      : `${BLOG_SERVICE}/api/v1/blog/save`;

    const method = isSaved ? "DELETE" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ blogid: blog.blogid }),
    });

    if (res.ok) setIsSaved(!isSaved);
  };

  if (loading) return <Loading />;
  if (!blog) return <p>Blog not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      <img
        src={blog.image}
        className="w-full h-[300px] object-cover rounded-lg"
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{blog.title}</h1>

        <Bookmark
          onClick={handleSaveToggle}
          className={`cursor-pointer ${
            isSaved ? "fill-black text-black" : "text-gray-400"
          }`}
        />
      </div>

      <p className="text-gray-600">{blog.description}</p>

      <div className="flex justify-between text-sm text-gray-500 border-b pb-3">
        <span className="bg-gray-100 px-3 py-1 rounded">
          {blog.category}
        </span>
        <span>
          {new Date(blog.created_at).toLocaleDateString()}
        </span>
      </div>

      <div>
        By{" "}
        <span
          onClick={() => router.push(`/author/${blog.author}`)}
          className="text-blue-500 cursor-pointer"
        >
          {authorName}
        </span>
      </div>

      <div dangerouslySetInnerHTML={{ __html: blog.blogcontent }} />

      {/* COMMENTS */}
      <div className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Comments</h2>

        <div className="flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="border p-2 flex-1 rounded"
          />
          <button
            onClick={handleAddComment}
            className="bg-black text-white px-4 rounded"
          >
            Post
          </button>
        </div>

        {comments.map((c) => (
          <div key={c.commentid} className="border p-3 rounded flex justify-between">
            <div>
              <p className="font-semibold">{c.username}</p>
              <p>{c.comment}</p>
            </div>

            {c.userid === user?._id && (
              <button
                onClick={() => handleDelete(c.commentid)}
                className="text-red-500"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 🔥 FLOATING SUMMARY */}
      <div className="fixed bottom-6 right-6 z-50">

        <button
          onClick={handleSummary}
          className="bg-black text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
        >
          {loadingSummary ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Generating...
            </>
          ) : "✨ Summary"}
        </button>

        {showSummary && (
          <div className="mt-3 w-72 min-h-[180px] max-h-[260px] bg-white border rounded-xl shadow-xl p-4 overflow-y-auto">

            <div className="flex justify-between mb-2">
              <h3 className="font-semibold text-sm">AI Summary</h3>

              <button onClick={() => setShowSummary(false)}>✕</button>
            </div>

            <p className="text-sm text-gray-700">
              {summary}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default BlogPage;