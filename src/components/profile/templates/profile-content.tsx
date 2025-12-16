"use client";

import { updateProfile } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import {
  Briefcase,
  Calendar,
  Clock,
  Lock,
  Mail,
  MapPin,
  Save,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AvatarIconDisplay,
  AvatarIconSelector,
} from "@/components/common/atoms/avatar-icon-selector";
import { Typography } from "@/components/common/atoms/typography";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { requestPasswordReset } from "@/lib/services/auth/auth";
import { useAuth } from "@/providers/auth-provider";
import type { UserPreferences } from "@/types/firestore";

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
  const [resettingPassword, setResettingPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusVariant, setStatusVariant] = useState<"success" | "error">(
    "success",
  );
  const [editData, setEditData] = useState({
    displayName: "",
    role: "",
    experience: "",
    preferredLocation: "",
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
      preferredLocation: userData?.preferences?.preferredLocation || "",
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
      setStatusVariant("error");
      setStatusMessage(
        `Failed to update avatar: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) {
      setStatusVariant("error");
      setStatusMessage("User not authenticated. Please sign in again.");
      return;
    }

    if (!db) {
      setStatusVariant("error");
      setStatusMessage(
        "Database connection failed. Please refresh the page and try again.",
      );
      return;
    }

    setSaving(true);
    try {
      await updateProfile(user, {
        displayName: editData.displayName,
      });

      const existingPreferences: UserPreferences | undefined = (
        userData as unknown as { preferences?: UserPreferences } | null
      )?.preferences;

      const basePreferences: UserPreferences = existingPreferences ?? {
        preferredDifficulty: "intermediate",
        preferredInterviewTypes: ["technical"],
        targetCompanies: [],
        notificationsEnabled: true,
        language: "en",
      };

      const updatedPreferences: UserPreferences = {
        ...basePreferences,
        preferredLocation:
          editData.preferredLocation || basePreferences.preferredLocation || "",
      };

      const userDocData = {
        displayName: editData.displayName,
        role: editData.role,
        experience: editData.experience,
        email: user.email || "",
        uid: user.uid,
        avatarIcon: selectedIcon || null,
        photoURL: null,
        preferences: updatedPreferences,
        ...(userData && {
          createdAt: userData.createdAt,
        }),
        lastLoginAt: new Date(),
        ...(!userData && { createdAt: new Date() }),
      };

      await setDoc(doc(db, "users", user.uid), userDocData, { merge: true });
      await refreshUserData();
      setIsEditing(false);
      setStatusVariant("success");
      setStatusMessage("Profile updated successfully.");
    } catch (error) {
      setStatusVariant("error");
      setStatusMessage(
        `Failed to update profile: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) {
      setStatusVariant("error");
      setStatusMessage("No email is associated with this account.");
      return;
    }

    setResettingPassword(true);

    try {
      const { error } = await requestPasswordReset(user.email);

      if (error) {
        setStatusVariant("error");
        setStatusMessage(error);
        return;
      }

      setStatusVariant("success");
      setStatusMessage(
        "If an account exists for this email, we've sent a password reset link.",
      );
    } catch (error) {
      setStatusVariant("error");
      setStatusMessage(
        `Unable to send reset email: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setResettingPassword(false);
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
          <Typography.Body color="secondary" className="mt-2">
            Manage your account settings and preferences
          </Typography.Body>
        </div>

        {statusMessage && (
          <div
            className={`mb-6 p-3 text-sm border rounded-md ${
              statusVariant === "success"
                ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                : "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
            }`}
          >
            {statusMessage}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          <Card className="xl:col-span-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="pb-6">
              <div className="relative mx-auto w-28 h-28 sm:w-36 sm:h-36 mb-6 flex items-center justify-center">
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
              <div className="space-y-3">
                <Typography.SubCaptionBold className="tracking-wide uppercase text-primary/80 text-center">
                  Your interview profile
                </Typography.SubCaptionBold>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between gap-2">
                    <Typography.CaptionMedium className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="size-4" />
                      Location
                    </Typography.CaptionMedium>
                    <Typography.BodyMedium className="text-right">
                      {userData.preferences?.preferredLocation || "Not set"}
                    </Typography.BodyMedium>
                  </div>
                  <div className="flex items-center justify-betwen gap-2">
                    <Typography.CaptionMedium className="text-muted-foreground flex items-center gap-2">
                      <Briefcase className="size-4" />
                      Work type
                    </Typography.CaptionMedium>
                    <Typography.BodyMedium className="text-right">
                      {userData.preferences?.preferredWorkTypes?.join(", ") ||
                        "Not set"}
                    </Typography.BodyMedium>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Typography.CaptionMedium className="text-muted-foreground flex items-center gap-2">
                      <Clock className="size-4" />
                      Goal
                    </Typography.CaptionMedium>
                    <Typography.BodyMedium className="text-right">
                      {userData.preferences?.careerGoals?.[0] || "Not set"}
                    </Typography.BodyMedium>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Typography.CaptionMedium className="text-muted-foreground flex items-center gap-2">
                      <Mail className="size-4" />
                      Email
                    </Typography.CaptionMedium>
                    <Typography.BodyMedium className="text-right truncate max-w-[160px] sm:max-w-[200px]">
                      {user.email}
                    </Typography.BodyMedium>
                  </div>
                </div>
              </div>
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
                <Typography.Heading3 className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Profile Details
                </Typography.Heading3>
                <Typography.Caption color="secondary" className="mt-1 block">
                  Update your personal information and preferences
                </Typography.Caption>
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
                      preferredLocation:
                        userData?.preferences?.preferredLocation || "",
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

              <div className="space-y-3">
                <Label
                  htmlFor="preferredLocation"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <MapPin className="size-4" />
                  Preferred work location
                </Label>
                {isEditing ? (
                  <Input
                    id="preferredLocation"
                    value={editData.preferredLocation}
                    onChange={(event) =>
                      setEditData((prev) => ({
                        ...prev,
                        preferredLocation: event.target.value,
                      }))
                    }
                    placeholder="e.g. Remote Europe, London, UK"
                    className="h-11"
                  />
                ) : (
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <p className="font-medium">
                      {userData.preferences?.preferredLocation || "Not set"}
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
                  <div className="bg-muted/30 rounded-lg p-4 border space-y-3">
                    <Label className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                      <Lock className="size-4" />
                      Security
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Send a password reset link to your email address.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-1"
                      onClick={handlePasswordReset}
                      disabled={resettingPassword}
                    >
                      {resettingPassword
                        ? "Sending reset link..."
                        : "Send reset link"}
                    </Button>
                  </div>
                  {/* Additional preference fields can be surfaced here later if needed */}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
