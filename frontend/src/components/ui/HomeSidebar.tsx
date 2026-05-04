"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import { Input } from "@/components/ui/input";
import { BoxSelect } from "lucide-react";
import { useAppData } from "@/context/AppContext";
import { useState, useEffect } from "react";

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

const SideBar = () => {
  const { setCategory, category, searchQuery, setSearchQuery } = useAppData();

  // 🔥 Local state for smooth typing
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // 🔥 Debounce update to global state
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 500);

    return () => clearTimeout(handler);
  }, [localSearch]);

  return (
    <Sidebar className="mt-16">
     

      <SidebarContent className="bg-white px-4 space-y-6">

        {/* 🔍 Search */}
        <SidebarGroup>
          <SidebarGroupLabel>Search</SidebarGroupLabel>
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search your desired blog"
          />
        </SidebarGroup>

        {/* 📂 All */}
        <SidebarGroup>
          <SidebarGroupLabel>All</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setCategory("All")}
                className={`rounded-md ${
                  category === "All"
                    ? "bg-gray-200"
                    : "hover:bg-gray-100"
                }`}
              >
                <BoxSelect size={16} />
                <span>All</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* 📂 Grouped Categories */}
        {Object.entries(CATEGORY_GROUPS).map(([group, items]) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel>{group}</SidebarGroupLabel>

            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item}>
                  <SidebarMenuButton
                    onClick={() => setCategory(item)}
                    className={`rounded-md ${
                      category === item
                        ? "bg-gray-200"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <BoxSelect size={16} />
                    <span>{item}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}

      </SidebarContent>
    </Sidebar>
  );
};

export default SideBar;