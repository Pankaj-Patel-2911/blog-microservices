"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";
import { AUTHOR_SERVICE, BLOG_SERVICE } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

const EditBlog = () => {
  const router = useRouter();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [aiTitleLoading, setAiTitleLoading] = useState(false);
  const [aiDescLoading, setAiDescLoading] = useState(false);
  const [aiBlogLoading, setAiBlogLoading] = useState(false);

  const editor = useRef(null);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "Update your blog...",
    }),
    []
  );

  // 🔥 Fetch blog
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await axios.get(
          `${BLOG_SERVICE}/api/v1/blog/${id}`
        );

        const blog = data.blog || data;

        setTitle(blog.title);
        setDescription(blog.description);
        setContent(blog.blogcontent);
        setCategory(blog.category);
        setExistingImage(blog.image);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load blog");
      }
    };

    if (id) fetchBlog();
  }, [id]);

  // 🔥 AI TITLE
  const handleAiTitle = async () => {
    if (!title) return toast.error("Enter title first");

    try {
      setAiTitleLoading(true);

      const res = await fetch(`${AUTHOR_SERVICE}/api/v1/ai/title`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({ text: title }),
      });

      const data = await res.json();

      if (res.ok) {
        setTitle(data.title);
        toast.success("Title improved ✨");
      }
    } finally {
      setAiTitleLoading(false);
    }
  };

  // 🔥 AI DESCRIPTION
  const handleAiDescription = async () => {
    if (!title) return toast.error("Enter title first");

    try {
      setAiDescLoading(true);

      const res = await fetch(`${AUTHOR_SERVICE}/api/v1/ai/description`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();

      if (res.ok) {
        setDescription(data.description);
        toast.success("Description improved ✨");
      }
    } finally {
      setAiDescLoading(false);
    }
  };

  // 🔥 AI BLOG
  const handleAiBlog = async () => {
    if (!content) return toast.error("Enter blog content");

    try {
      setAiBlogLoading(true);

      const res = await fetch(`${AUTHOR_SERVICE}/api/v1/ai/blog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({ blog: content }),
      });

      const data = await res.json();

      if (res.ok) {
        setContent(data.blog);
        toast.success("Grammar fixed ✨");
      }
    } finally {
      setAiBlogLoading(false);
    }
  };

  // 🔥 UPDATE BLOG
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content) {
      toast.error("Content required");
      return;
    }

    try {
      setLoading(true);

      const token = Cookies.get("token");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("blogcontent", content);
      formData.append("category", category);

      if (image) {
        formData.append("file", image);
      }

      await axios.put(
        `${AUTHOR_SERVICE}/api/v1/blog/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Blog updated 🚀");
      router.push("/blog/my");

    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Edit Blog</h2>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">

            {/* Title */}
            <div className="flex gap-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />

              <Button
                type="button"
                onClick={handleAiTitle}
                disabled={aiTitleLoading}
              >
                {aiTitleLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Improving...
                  </>
                ) : (
                  "✨ Improve"
                )}
              </Button>
            </div>

            {/* Description */}
            <div className="flex gap-2">
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />

              <Button
                type="button"
                onClick={handleAiDescription}
                disabled={aiDescLoading}
              >
                {aiDescLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Improving...
                  </>
                ) : (
                  "✨ Improve"
                )}
              </Button>
            </div>

            {/* Content */}
            <div>
              <Label>Blog Content</Label>

              <JoditEditor
                ref={editor}
                value={content}
                config={config}
                onChange={(c) => setContent(c)}
              />

              {/* 🔥 Fix Grammar BELOW */}
              <div className="flex justify-end mt-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAiBlog}
                  disabled={aiBlogLoading}
                >
                  {aiBlogLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Fixing...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      <span className="ml-2">Fix Grammar</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Category */}
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />

            {/* Image Preview */}
            {existingImage && !image && (
              <img
                src={existingImage}
                className="w-full h-40 object-cover rounded"
              />
            )}

            {image && (
              <img
                src={URL.createObjectURL(image)}
                className="w-full h-40 object-cover rounded"
              />
            )}

            {/* File */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImage(e.target.files?.[0] || null)
              }
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded-lg"
            >
              {loading ? "Updating..." : "Update Blog"}
            </button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditBlog;