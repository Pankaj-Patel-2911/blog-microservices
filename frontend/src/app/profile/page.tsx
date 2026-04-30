"use client";

import { useAppData, user_Service } from "@/context/AppContext";
import React, { useRef, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";
import { FaInstagram, FaLinkedin, FaFacebook } from "react-icons/fa";
import { useRouter } from "next/navigation";

const Profile = () => {
  const { user, setUser, setIsAuth } = useAppData();
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [facebook, setFacebook] = useState("");

  // 🔥 store original values for cancel
  const [originalData, setOriginalData] = useState({
    bio: "",
    instagram: "",
    linkedin: "",
    facebook: "",
  });

  // 🔥 load user data
  useEffect(() => {
    if (user) {
      setBio(user.bio || "");
      setInstagram(user.instagram || "");
      setLinkedin(user.linkedin || "");
      setFacebook((user as any).facebook || "");
    }
  }, [user]);

  // 🔥 Upload profile pic
  const changeHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const token = Cookies.get("token");

      const { data } = await axios.put(
        `${user_Service}/api/v1/user/update/pic`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(data.user);
      toast.success("Profile picture updated");
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Update profile
  const updateProfile = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");

      const { data } = await axios.put(
        `${user_Service}/api/v1/user/update`,
        { bio, instagram, linkedin, facebook },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(data.user);
      toast.success("Profile updated");
      setEditMode(false);
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Cancel editing
  const handleCancel = () => {
    setBio(originalData.bio);
    setInstagram(originalData.instagram);
    setLinkedin(originalData.linkedin);
    setFacebook(originalData.facebook);
    setEditMode(false);
  };

  // 🔥 Logout
  const handleLogout = () => {
    Cookies.remove("token");
    setIsAuth(false);
    router.push("/");
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gray-100">
      <Card className="w-full max-w-xl shadow-lg border rounded-2xl p-6">

        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">
            Profile
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center space-y-6">

          {/* Avatar */}
          <div
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer"
          >
            <Avatar className="w-28 h-28 border-4 border-gray-200 shadow-md">
              <AvatarImage src={user?.image || ""} />
              <AvatarFallback>
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          <input
            type="file"
            hidden
            ref={inputRef}
            onChange={changeHandler}
          />

          {/* User Info */}
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="text-gray-500">{user?.email}</p>

          {/* 🔥 Bio */}
          {!editMode ? (
            <p className="text-center text-gray-700">
              {bio || "No bio added"}
            </p>
          ) : (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          )}

          {/* 🔥 Social Links */}
          {!editMode ? (
            <div className="flex gap-6 text-2xl">

              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  className="cursor-pointer text-pink-500 hover:scale-110"
                >
                  <FaInstagram />
                </a>
              )}

              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  className="cursor-pointer text-blue-600 hover:scale-110"
                >
                  <FaLinkedin />
                </a>
              )}

              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  className="cursor-pointer text-blue-500 hover:scale-110"
                >
                  <FaFacebook />
                </a>
              )}

            </div>
          ) : (
            <div className="w-full space-y-2">
              <input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Instagram link"
                className="w-full p-2 border rounded-lg"
              />
              <input
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="LinkedIn link"
                className="w-full p-2 border rounded-lg"
              />
              <input
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="Facebook link"
                className="w-full p-2 border rounded-lg"
              />
            </div>
          )}

          {/* 🔥 Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">

            {!editMode ? (
              <button
                onClick={() => {
                  setOriginalData({ bio, instagram, linkedin, facebook });
                  setEditMode(true);
                }}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={updateProfile}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Save
                </button>

                <button
                  onClick={handleCancel}
                  className="bg-gray-300 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </>
            )}

            <button
              onClick={() => router.push("/author/create")}
              className="bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              Add Blog
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>

          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;