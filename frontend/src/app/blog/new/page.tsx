"use client";

import React, { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { AUTHOR_SERVICE } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

const CATEGORY_GROUPS = {
  "💻 Tech": [
    "Technology",
    "Programming",
    "Web Development",
    "Mobile Development",
    "AI & Machine Learning",
    "Data Science",
    "Cybersecurity",
    "DevOps",
    "Cloud Computing",
    "Open Source",
  ],

  "💼 Career & Business": [
    "Career",
    "Freelancing",
    "Startups",
    "Entrepreneurship",
    "Business",
    "Finance",
    "Investing",
    "Productivity",
    "Remote Work",
  ],

  "🧠 Education": [
    "Education",
    "Tutorials",
    "Study Tips",
    "Online Courses",
    "Certifications",
    "College Life",
  ],

  "🌍 Lifestyle": [
    "Lifestyle",
    "Self Improvement",
    "Habits",
    "Minimalism",
    "Personal Development",
    "Relationships",
    "Mental Health",
  ],

  "🏋️ Health & Fitness": [
    "Fitness",
    "Workout",
    "Yoga",
    "Meditation",
    "Nutrition",
    "Diet",
  ],

  "✈️ Travel": [
    "Travel",
    "Travel Guides",
    "Adventure",
    "Budget Travel",
    "Destinations",
  ],

  "🍔 Food": [
    "Food",
    "Recipes",
    "Cooking Tips",
    "Restaurants",
    "Healthy Eating",
  ],

  "🎮 Entertainment": [
    "Entertainment",
    "Movies",
    "Web Series",
    "Gaming",
    "Music",
    "Reviews",
  ],

  "📰 Content & Writing": [
    "Blogging",
    "Writing",
    "Content Creation",
    "SEO",
    "Marketing",
    "Social Media",
  ],

  "🎨 Creative": [
    "Design",
    "UI/UX",
    "Photography",
    "Art",
    "Video Editing",
  ],

  "🔧 Misc": [
    "Opinion",
    "Guides",
    "Case Study",
    "News",
    "General",
  ],
};

const AddBlog = () => {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(false);
  const [aiTitleLoading, setAiTitleLoading] = useState(false);
  const [aiDescLoading, setAiDescLoading] = useState(false);
  const [aiBlogLoading, setAiBlogLoading] = useState(false);

  const editor = useRef(null);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "Start typing your blog...",
    }),
    []
  );

  // 🔥 AI TITLE
  const handleAiTitle = async () => {
    if (!title) {
      toast.error("Enter title first");
      return;
    }

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
      } else {
        toast.error(data.message);
      }

    } catch (err) {
      console.error(err);
      toast.error("AI failed");
    } finally {
      setAiTitleLoading(false);
    }
  };

  // 🔥 AI DESCRIPTION
  const handleAiDescription = async () => {
    if (!title) {
      toast.error("Enter title first");
      return;
    }

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
        toast.success(
          description ? "Description improved ✨" : "Description generated ✨"
        );
      } else {
        toast.error(data.message);
      }

    } catch (err) {
      console.error(err);
      toast.error("AI failed");
    } finally {
      setAiDescLoading(false);
    }
  };

  // 🔥 AI BLOG GRAMMAR FIX
  const handleAiBlog = async () => {
    if (!content || content.trim() === "") {
      toast.error("Enter blog content first");
      return;
    }

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
      } else {
        toast.error(data.message);
      }

    } catch (err) {
      console.error(err);
      toast.error("AI failed");
    } finally {
      setAiBlogLoading(false);
    }
  };

  // 🔥 SUBMIT BLOG
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      toast.error("Please select an image");
      return;
    }

    if (!content || content.trim() === "") {
      toast.error("Blog content is required");
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
      formData.append("file", image);

      await axios.post(
        `${AUTHOR_SERVICE}/api/v1/blog/new`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success("Blog created successfully 🚀");
      router.push("/");

    } catch (error) {
      console.error(error);
      toast.error("Failed to create blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader className="flex justify-center">
          <h2 className="text-2xl font-bold">Add New Blog</h2>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Title */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded-lg"
                required
              />

              <Button type="button" onClick={handleAiTitle} disabled={aiTitleLoading}>
                {aiTitleLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Improving...
                  </>
                ) : "✨ Improve"}
              </Button>
            </div>

            {/* Description */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Short Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-lg"
                required
              />

              <Button
                type="button"
                onClick={handleAiDescription}
                disabled={aiDescLoading}
              >
                {aiDescLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    {description ? "Improving..." : "Generating..."}
                  </>
                ) : description ? (
                  "✨ Improve"
                ) : (
                  "✨ Generate"
                )}
              </Button>
            </div>

            {/* Blog Content */}
            <div>
              <Label>Blog Content</Label>

              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-muted-foreground">
                  Paste your blog or type here.
                </p>

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

              <JoditEditor
                ref={editor}
                value={content}
                config={config}
                onChange={(newContent) => setContent(newContent)}
              />
            </div>

            {/* Category */}
            <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required
          >
            <option value="">Select Category</option>

            {Object.entries(CATEGORY_GROUPS).map(([group, items]) => (
              <optgroup key={group} label={group}>
                {items.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

            <div>
              <input
              className="cursor-pointer"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              required
            />

            <p className="text-xs text-gray-500 mt-1">
              Max file size: 7MB. 
            </p>
          </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              {loading ? "Publishing..." : "Publish Blog"}
            </button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBlog;