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
import { Typography } from "@/components/common/atoms/typography";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/firebase";
import type { UserData } from "@/lib/services/auth/auth";
import { useAuth } from "@/providers/auth-provider";

interface ProfileContentProps {
  user: UserData;
}

const ROLE_OPTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Mobile Developer",
  "Data Engineer",
  "Data Scientist",
  "Cybersecurity Engineer",
  "Product Manager",
];

const EXPERIENCE_OPTIONS = [
  "Entry (no experience)",
  "Junior (0-2 years)",
  "Mid (2-5 years)",
  "Senior (5-8 years)",
];

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
          ...(userData.howDidYouHear && {
            howDidYouHear: userData.howDidYouHear,
          }),
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

  if (!user || !userData) {
    return null;
  }

  return (
    <main className="flex-1 overflow-y-auto bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl">
        <div className="mb-8">
          <Typography.Heading1 className="tracking-tight">
            Profile Settings
          </Typography.Heading1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          <Card className="xl:col-span-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="text-center pb-6">
              <div className="relative mx-auto w-28 h-28 sm:w-36 sm:h-36 mb-6">
                {userData?.avatarIcon ? (
                  <div className="w-36 h-36 border-4 border-primary/30 rounded-full flex items-center justify-center bg-background shadow-lg">
                    <AvatarIconDisplay
                      iconId={userData.avatarIcon}
                      size="xl"
                      className="w-28 h-28"
                    />
                  </div>
                ) : (
                  <Avatar className="w-36 h-36 border-4 border-primary/30 shadow-lg">
                    <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                      {getInitials(userData?.displayName || user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold">
                {userData?.displayName || user.displayName || "User"}
              </CardTitle>
              <p className="text-muted-foreground text-sm sm:text-base break-all mt-2">
                {user.email}
              </p>
              {(userData?.role || editData.role) && (
                <Badge variant="secondary" className="mt-3 px-3 py-1">
                  {userData?.role || editData.role}
                </Badge>
              )}
            </CardHeader>
          </Card>

          <Card className="xl:col-span-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <User className="h-5 w-5 text-primary" />
                Avatar Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose an icon to represent your profile across the platform
              </p>
            </CardHeader>
            <CardContent>
              <AvatarIconSelector
                selectedIcon={selectedIcon}
                onSelectIcon={handleIconSelect}
              />
            </CardContent>
          </Card>

          <Card className="xl:col-span-7">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <User className="h-5 w-5 text-primary" />
                  Profile Details
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Update your personal information and preferences
                </p>
              </div>
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
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label
                  htmlFor="displayName"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
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
                    className="h-11"
                  />
                ) : (
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <p className="font-medium">
                      {userData?.displayName || user.displayName || "Not set"}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <p className="font-medium break-all">{user.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="role"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Briefcase className="size-4" />
                  Role/Position
                </Label>
                {isEditing ? (
                  <Select
                    value={editData.role || ""}
                    onValueChange={(value) =>
                      setEditData((prev) => ({
                        ...prev,
                        role: value,
                      }))
                    }
                  >
                    <SelectTrigger
                      id="role"
                      className="h-11 w-full justify-between"
                    >
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <p className="font-medium">{userData?.role || "Not set"}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="experience"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Clock className="size-4" />
                  Experience Level
                </Label>
                {isEditing ? (
                  <Select
                    value={editData.experience || ""}
                    onValueChange={(value) =>
                      setEditData((prev) => ({
                        ...prev,
                        experience: value,
                      }))
                    }
                  >
                    <SelectTrigger
                      id="experience"
                      className="h-11 w-full justify-between"
                    >
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <p className="font-medium">
                      {userData?.experience || "Not set"}
                    </p>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 h-11 px-6"
                    type="button"
                  >
                    {saving ? (
                      <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Information Card */}
          <Card className="xl:col-span-5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <Calendar className="h-5 w-5 text-primary" />
                Account Information
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                View your account details and activity
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <Label className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    Member Since
                  </Label>
                  <p className="font-semibold text-lg mt-1">
                    {userData?.createdAt
                      ? formatDate(userData.createdAt)
                      : "Unknown"}
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <Label className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                    <Clock className="h-4 w-4" />
                    Last Login
                  </Label>
                  <p className="font-semibold text-lg mt-1">
                    {userData?.lastLoginAt
                      ? formatDate(userData.lastLoginAt)
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">
                  Additional Information
                </h4>
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-4 border">
                    <Label className="text-muted-foreground text-sm font-medium">
                      User ID
                    </Label>
                    <p className="font-mono text-sm mt-2 break-all bg-background rounded p-2 border">
                      {user.uid}
                    </p>
                  </div>
                  {userData?.howDidYouHear && (
                    <div className="bg-muted/30 rounded-lg p-4 border">
                      <Label className="text-muted-foreground text-sm font-medium">
                        How did you hear about us?
                      </Label>
                      <p className="mt-2 font-medium">
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
