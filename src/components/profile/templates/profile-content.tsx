"use client";

import { updateProfile } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { Briefcase, Calendar, Clock, Mail, Save, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AvatarIconDisplay,
  AvatarIconSelector,
} from "@/components/common/atoms/avatar-icon-selector";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/firebase";
import type { UserData } from "@/lib/services/auth/auth";
import { useAuth } from "@/providers/auth-provider";

interface ProfileContentProps {
  user: UserData;
}

export function ProfileContent({ user: _serverUser }: ProfileContentProps) {
  const { user, userData, refreshUserData } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    displayName: "",
    role: "",
    experience: "",
  });
  const [selectedIcon, setSelectedIcon] = useState<string>("");

  useEffect(() => {
    if (!user) {
      router.push("/auth");
    }
  }, [user, router]);

  useEffect(() => {
    setEditData({
      displayName: userData?.displayName || user?.displayName || "",
      role: userData?.role || "",
      experience: userData?.experience || "",
    });

    if (userData?.avatarIcon) {
      setSelectedIcon(userData.avatarIcon);
    } else {
      setSelectedIcon("");
    }
  }, [userData, user]);

  const handleIconSelect = async (iconId: string) => {
    if (!user || !db) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        avatarIcon: iconId,
        photoURL: null,
      });

      await updateProfile(user, {
        photoURL: null,
      });

      setSelectedIcon(iconId);
      await refreshUserData();
    } catch (error) {
      alert(
        `Failed to update avatar: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) {
      alert("User not authenticated. Please sign in again.");
      return;
    }

    if (!db) {
      alert(
        "Database connection failed. Please refresh the page and try again.",
      );
      return;
    }

    setSaving(true);
    try {
      await updateProfile(user, {
        displayName: editData.displayName,
      });

      const userDocData = {
        displayName: editData.displayName,
        role: editData.role,
        experience: editData.experience,
        email: user.email || "",
        uid: user.uid,
        avatarIcon: selectedIcon || null,
        photoURL: null,
        ...(userData && {
          createdAt: userData.createdAt,
          howDidYouHear: userData.howDidYouHear,
        }),
        lastLoginAt: new Date(),
        ...(!userData && { createdAt: new Date() }),
      };

      await setDoc(doc(db, "users", user.uid), userDocData, { merge: true });
      await refreshUserData();
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      alert(
        `Failed to update profile: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (!user) {
    return null;
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32 mb-4">
                {userData?.avatarIcon ? (
                  <div className="w-32 h-32 border-4 border-primary/20 rounded-full flex items-center justify-center">
                    <AvatarIconDisplay
                      iconId={userData.avatarIcon}
                      size="xl"
                      className="w-24 h-24"
                    />
                  </div>
                ) : (
                  <Avatar className="w-32 h-32 border-4 border-primary/20">
                    <AvatarFallback className="text-2xl font-bold bg-primary/10">
                      {getInitials(userData?.displayName || user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              <CardTitle className="text-lg sm:text-xl">
                {userData?.displayName || user.displayName || "User"}
              </CardTitle>
              <p className="text-muted-foreground text-sm sm:text-base break-all">
                {user.email}
              </p>
              {(userData?.role || editData.role) && (
                <Badge variant="secondary" className="mt-2">
                  {userData?.role || editData.role}
                </Badge>
              )}
            </CardHeader>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <User className="h-5 w-5" />
                Avatar Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose an icon to represent your profile
              </p>
            </CardHeader>
            <CardContent>
              <AvatarIconSelector
                selectedIcon={selectedIcon}
                onSelectIcon={handleIconSelect}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <User className="h-5 w-5" />
                Profile Details
              </CardTitle>
              <Button
                variant={isEditing ? "outline" : "default"}
                className="w-full sm:w-auto"
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                    setEditData({
                      displayName: userData?.displayName || "",
                      role: userData?.role || "",
                      experience: userData?.experience || "",
                    });
                  } else {
                    setIsEditing(true);
                  }
                }}
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm sm:text-base">
                  Display Name
                </Label>
                {isEditing ? (
                  <Input
                    id="displayName"
                    value={editData.displayName}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        displayName: e.target.value,
                      }))
                    }
                    placeholder="Enter your display name"
                  />
                ) : (
                  <p className="text-sm bg-muted rounded-md p-3">
                    {userData?.displayName || user.displayName || "Not set"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="flex items-center gap-2 text-sm sm:text-base"
                >
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <p className="text-sm bg-muted rounded-md p-3 text-muted-foreground break-all">
                  {user.email}
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="role"
                  className="flex items-center gap-2 text-sm sm:text-base"
                >
                  <Briefcase className="h-4 w-4" />
                  Role/Position
                </Label>
                {isEditing ? (
                  <Input
                    id="role"
                    value={editData.role}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        role: e.target.value,
                      }))
                    }
                    placeholder="Enter your role or position"
                  />
                ) : (
                  <p className="text-sm bg-muted rounded-md p-3">
                    {userData?.role || "Not set"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-sm sm:text-base">
                  Experience Level
                </Label>
                {isEditing ? (
                  <Input
                    id="experience"
                    value={editData.experience}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        experience: e.target.value,
                      }))
                    }
                    placeholder="Enter your experience level"
                  />
                ) : (
                  <p className="text-sm bg-muted rounded-md p-3">
                    {userData?.experience || "Not set"}
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2"
                    type="button"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Calendar className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Member Since
                  </Label>
                  <p className="font-medium">
                    {userData?.createdAt
                      ? formatDate(userData.createdAt)
                      : "Unknown"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Last Login
                  </Label>
                  <p className="font-medium">
                    {userData?.lastLoginAt
                      ? formatDate(userData.lastLoginAt)
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <Separator className="my-4 sm:my-6" />

              <div className="space-y-3 sm:space-y-4">
                <h4 className="font-semibold">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">User ID</Label>
                    <p className="font-mono text-sm bg-muted rounded p-2 break-all">
                      {user.uid}
                    </p>
                  </div>
                  {userData?.howDidYouHear && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">
                        How did you hear about us?
                      </Label>
                      <p className="text-sm bg-muted rounded p-2">
                        {userData.howDidYouHear}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
