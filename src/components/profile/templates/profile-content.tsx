"use client";

import { updateProfile } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  CreditCard,
  Edit2,
  Globe,
  History,
  Key,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Rocket,
  Save,
  ShieldCheck,
  Trash2,
  User,
  Zap,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
          {/* Profile Summary Card - Fixed Left Column for Desktop */}
          <Card className="xl:col-span-4 border-primary/10 bg-card/50 backdrop-blur-sm h-fit sticky top-24 overflow-hidden shadow-2xl shadow-primary/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

            <CardContent className="pt-10 pb-8 px-6 relative z-10">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  {userData?.avatarIcon ? (
                    <div className="w-32 h-32 border-[6px] border-background rounded-full flex items-center justify-center bg-card shadow-xl ring-1 ring-primary/20">
                      <AvatarIconDisplay
                        iconId={userData.avatarIcon}
                        size="xl"
                        className="w-24 h-24"
                      />
                    </div>
                  ) : (
                    <Avatar className="w-32 h-32 border-[6px] border-background shadow-xl ring-1 ring-primary/20">
                      <AvatarFallback className="text-3xl font-bold bg-primary/5 text-primary">
                        {getInitials(userData?.displayName || user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {userData?.subscription?.plan === "pro" && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-black tracking-widest shadow-lg border-2 border-background flex items-center gap-1"
                    >
                      <Zap className="size-3 fill-current" /> PRO
                    </motion.div>
                  )}
                </div>

                <Typography.Heading3 className="text-2xl font-bold tracking-tight">
                  {userData?.displayName ||
                    user.displayName ||
                    "Anonymous User"}
                </Typography.Heading3>
                <div className="mt-1 flex items-center gap-1.5 px-3 py-1 bg-muted/50 rounded-full border border-border/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <Typography.Caption className="text-muted-foreground font-medium uppercase tracking-tighter text-[10px]">
                    {userData?.role || "Candidate"}
                  </Typography.Caption>
                </div>
              </div>

              <div className="mt-10 space-y-4">
                <div className="p-4 rounded-2xl bg-muted/20 border border-border/40 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="size-3.5" />
                      Location
                    </span>
                    <span className="font-semibold text-foreground">
                      {userData.preferences?.preferredLocation || "Remote"}
                    </span>
                  </div>
                  <Separator className="bg-border/30" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Briefcase className="size-3.5" />
                      Experience
                    </span>
                    <span className="font-semibold text-foreground">
                      {userData?.experience?.split(" ")[0] || "Junior"}
                    </span>
                  </div>
                  <Separator className="bg-border/30" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Mail className="size-3.5" />
                      Email
                    </span>
                    <span
                      className="font-semibold text-foreground truncate max-w-[140px]"
                      title={user.email || ""}
                    >
                      {user.email}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="ghost"
                    className="w-full text-xs font-semibold hover:bg-red-50 hover:text-red-500 rounded-xl py-6 border border-dashed border-border hover:border-red-200 transition-all group"
                    onClick={() => router.push("/auth/logout")}
                  >
                    Sign Out
                    <div className="ml-2 px-1.5 py-0.5 rounded bg-muted group-hover:bg-red-100 text-[9px] uppercase tracking-tighter transition-colors">
                      Session
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <div className="xl:col-span-8">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger
                  value="profile"
                  className="rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                >
                  <User className="size-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger
                  value="subscription"
                  className="rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                >
                  <CreditCard className="size-4" />
                  <span className="hidden sm:inline">Subscription</span>
                </TabsTrigger>
                <TabsTrigger
                  value="account"
                  className="rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                >
                  <Lock className="size-4" />
                  <span className="hidden sm:inline">Account</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="profile"
                className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <div className="grid grid-cols-1 gap-6">
                  {/* Personal Identity Section */}
                  <Card className="border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                    <CardHeader className="bg-muted/30 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <User className="size-4 text-primary" />
                            Personal Identity
                          </CardTitle>
                          <Typography.Caption color="secondary">
                            Manage your public-facing information and avatar
                          </Typography.Caption>
                        </div>
                        <Button
                          variant={isEditing ? "outline" : "ghost"}
                          size="sm"
                          className="h-8 text-xs font-semibold hover:bg-primary/5 hover:text-primary transition-colors"
                          onClick={() => {
                            if (isEditing) {
                              setIsEditing(false);
                              setEditData({
                                displayName: userData?.displayName || "",
                                role: userData?.role || "",
                                experience: userData?.experience || "",
                                preferredLocation:
                                  userData?.preferences?.preferredLocation ||
                                  "",
                              });
                            } else {
                              setIsEditing(true);
                            }
                          }}
                        >
                          {isEditing ? (
                            "Cancel"
                          ) : (
                            <>
                              <Edit2 className="size-3 mr-1.5" />
                              Edit Identity
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <Label
                            htmlFor="displayName"
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                          >
                            Display Name
                          </Label>
                          {isEditing ? (
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                              <Input
                                id="displayName"
                                value={editData.displayName}
                                onChange={(e) =>
                                  setEditData((p) => ({
                                    ...p,
                                    displayName: e.target.value,
                                  }))
                                }
                                className="h-11 pl-10 bg-muted/20 border-border/40 focus:ring-primary/20 rounded-xl"
                                placeholder="Enter your name"
                              />
                            </div>
                          ) : (
                            <div className="h-11 flex items-center px-4 rounded-xl bg-muted/10 border border-transparent font-bold text-foreground/80">
                              {userData?.displayName ||
                                user.displayName ||
                                "Not set"}
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                            Account Email
                          </Label>
                          <div className="h-11 flex items-center px-4 rounded-xl bg-muted/30 border border-dashed border-border/60 text-muted-foreground/60 italic font-medium">
                            {user.email}
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-border/30">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 block mb-6">
                          Profile Avatar
                        </Label>
                        <AvatarIconSelector
                          selectedIcon={selectedIcon}
                          onSelectIcon={handleIconSelect}
                          className="border-none shadow-none bg-transparent p-0"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Professional Profile Section */}
                  <Card className="border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                    <CardHeader className="bg-muted/30 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Briefcase className="size-4 text-primary" />
                            Professional Details
                          </CardTitle>
                          <Typography.Caption color="secondary">
                            Details we use to customize your interview
                            experience
                          </Typography.Caption>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <Label
                            htmlFor="role"
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                          >
                            Target Role
                          </Label>
                          {isEditing ? (
                            <Select
                              value={editData.role}
                              onValueChange={(v) =>
                                setEditData((p) => ({ ...p, role: v }))
                              }
                            >
                              <SelectTrigger className="h-11 bg-muted/20 border-border/40 rounded-xl">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLE_OPTIONS.map((opt) => (
                                  <SelectItem key={opt} value={opt}>
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="h-11 flex items-center px-4 rounded-xl bg-muted/10 border border-transparent font-bold text-foreground/80">
                              {userData?.role || "Not set"}
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <Label
                            htmlFor="experience"
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                          >
                            Experience Level
                          </Label>
                          {isEditing ? (
                            <Select
                              value={editData.experience}
                              onValueChange={(v) =>
                                setEditData((p) => ({ ...p, experience: v }))
                              }
                            >
                              <SelectTrigger className="h-11 bg-muted/20 border-border/40 rounded-xl">
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                              <SelectContent>
                                {EXPERIENCE_OPTIONS.map((opt) => (
                                  <SelectItem key={opt} value={opt}>
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="h-11 flex items-center px-4 rounded-xl bg-muted/10 border border-transparent font-bold text-foreground/80">
                              {userData?.experience || "Not set"}
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <Label
                            htmlFor="preferredLocation"
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                          >
                            Preferred Location
                          </Label>
                          {isEditing ? (
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                              <Input
                                id="preferredLocation"
                                value={editData.preferredLocation}
                                onChange={(e) =>
                                  setEditData((p) => ({
                                    ...p,
                                    preferredLocation: e.target.value,
                                  }))
                                }
                                className="h-11 pl-10 bg-muted/20 border-border/40 focus:ring-primary/20 rounded-xl"
                                placeholder="e.g. Remote, New York"
                              />
                            </div>
                          ) : (
                            <div className="h-11 flex items-center px-4 rounded-xl bg-muted/10 border border-transparent font-bold text-foreground/80 gap-2">
                              <MapPin className="size-4 text-muted-foreground/60" />
                              {userData.preferences?.preferredLocation ||
                                "Not set"}
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                            Work Preference
                          </Label>
                          <div className="h-11 flex items-center px-4 rounded-xl bg-muted/10 border border-transparent font-bold text-foreground/80 gap-2">
                            <Globe className="size-4 text-muted-foreground/60" />
                            {userData.preferences?.preferredWorkTypes?.join(
                              ", ",
                            ) || "Full-time / Remote"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {isEditing && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="flex justify-end pt-4"
                    >
                      <Button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="h-12 px-10 font-bold shadow-xl shadow-primary/20 rounded-xl hover:scale-[1.02] transition-transform active:scale-95"
                      >
                        {saving ? (
                          <Loader2 className="size-4 animate-spin mr-2" />
                        ) : (
                          <Save className="size-4 mr-2" />
                        )}
                        Update Career Profile
                      </Button>
                    </motion.div>
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="subscription"
                className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400"
              >
                <div className="grid grid-cols-1 gap-6">
                  {/* Main Subscription Status Card */}
                  <Card className="overflow-hidden border-primary/20 bg-card/40 backdrop-blur-md shadow-xl relative">
                    <div
                      className={`h-1.5 w-full ${userData?.subscription?.plan === "pro" ? "bg-primary" : "bg-muted"}`}
                    />
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <CreditCard className="size-5 text-primary" />
                            Subscription Overview
                          </CardTitle>
                          <Typography.Caption color="secondary">
                            View and manage your current access level
                          </Typography.Caption>
                        </div>
                        <Badge
                          variant={
                            userData?.subscription?.plan === "pro"
                              ? "default"
                              : "secondary"
                          }
                          className={`px-4 py-1 text-xs font-bold tracking-wider ${userData?.subscription?.plan === "pro" ? "bg-primary shadow-lg shadow-primary/20" : ""}`}
                        >
                          {userData?.subscription?.plan === "pro"
                            ? "PRO MEMBER"
                            : "FREE TIER"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-8 pt-4">
                      {userData?.subscription?.plan === "pro" ? (
                        <div className="space-y-6">
                          <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-5">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <ShieldCheck className="size-7 text-primary" />
                            </div>
                            <div className="space-y-1">
                              <Typography.BodyBold className="text-lg">
                                Pro Benefits Active
                              </Typography.BodyBold>
                              <Typography.Caption className="text-muted-foreground leading-relaxed">
                                You have full access to unlimited mock
                                interviews, advanced AI analysis, and career
                                progress tracking.
                              </Typography.Caption>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border bg-muted/20 flex flex-col gap-1">
                              <Typography.Caption className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">
                                Current Plan
                              </Typography.Caption>
                              <Typography.BodyBold className="text-lg flex items-center gap-2">
                                Pro Monthly{" "}
                                <Zap className="size-4 fill-primary text-primary" />
                              </Typography.BodyBold>
                            </div>
                            <div className="p-4 rounded-xl border bg-muted/20 flex flex-col gap-1">
                              <Typography.Caption className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">
                                Status
                              </Typography.Caption>
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                <Typography.BodyBold className="text-lg text-emerald-500">
                                  Active
                                </Typography.BodyBold>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2">
                            <Button
                              variant="outline"
                              className="w-full h-12 text-base font-semibold border-primary/20 hover:bg-primary/5 group"
                              onClick={async () => {
                                const res = await fetch("/api/stripe/portal", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    userId: user?.uid,
                                    email: user?.email,
                                  }),
                                });
                                const d = await res.json();
                                if (d.url) window.location.href = d.url;
                              }}
                            >
                              <CreditCard className="size-4 mr-2 group-hover:scale-110 transition-transform" />
                              Manage Billing & Subscription
                            </Button>
                            <p className="text-center text-[10px] text-muted-foreground mt-3 uppercase tracking-tighter">
                              Secure payments by Stripe
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="p-5 rounded-2xl bg-muted/30 border flex items-start gap-5">
                            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                              <Rocket className="size-7 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                              <Typography.BodyBold className="text-lg">
                                Limited Access (Free)
                              </Typography.BodyBold>
                              <Typography.Caption className="text-muted-foreground leading-relaxed">
                                Upgrade to Pro to unlock unlimited practice and
                                gain deep insights into your interview
                                performance.
                              </Typography.Caption>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <Typography.CaptionBold className="uppercase tracking-[0.2em] text-[10px] text-primary">
                              Pro Unlockables
                            </Typography.CaptionBold>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                              {[
                                "Unlimited Mock Interviews",
                                "Advanced Performance Metrics",
                                "Priority Feature Access",
                                "Custom Skill Roadmaps",
                                "Unlimited Skill Tracking",
                                "Priority Support",
                              ].map((feature) => (
                                <div
                                  key={feature}
                                  className="flex items-center gap-3 text-sm"
                                >
                                  <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="size-2.5 text-primary" />
                                  </div>
                                  <span className="text-muted-foreground">
                                    {feature}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2">
                            <Button
                              className="w-full h-12 text-base font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.01]"
                              onClick={() => router.push("/upgrade")}
                            >
                              <Zap className="size-4 mr-2 fill-current" />
                              Upgrade to Pro Now
                            </Button>
                            <p className="text-center text-[10px] text-muted-foreground mt-3 uppercase tracking-tighter">
                              Start practicing without limits
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Billing FAQ or Support Card */}
                  <Card className="border-dashed bg-transparent">
                    <CardContent className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left">
                        <Typography.BodyBold>
                          Need help with your subscription?
                        </Typography.BodyBold>
                        <Typography.Caption className="text-muted-foreground">
                          Our support team is here to assist with billing and
                          plan questions.
                        </Typography.Caption>
                      </div>
                      <Button
                        variant="link"
                        className="text-primary font-bold"
                        onClick={() => router.push("/support")}
                      >
                        Contact Support
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent
                value="account"
                className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                {/* Account Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Calendar className="size-5" />
                      </div>
                      <div>
                        <Typography.Caption
                          color="secondary"
                          className="uppercase tracking-tighter font-bold text-[10px]"
                        >
                          Member Since
                        </Typography.Caption>
                        <Typography.BodyBold className="text-sm">
                          {userData?.createdAt
                            ? formatDate(userData.createdAt).split(" at")[0]
                            : "Jan 2024"}
                        </Typography.BodyBold>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <History className="size-5" />
                      </div>
                      <div>
                        <Typography.Caption
                          color="secondary"
                          className="uppercase tracking-tighter font-bold text-[10px]"
                        >
                          Last Login
                        </Typography.Caption>
                        <Typography.BodyBold className="text-sm">
                          {userData?.lastLoginAt
                            ? formatDate(userData.lastLoginAt).split(" at")[0]
                            : "Today"}
                        </Typography.BodyBold>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <ShieldCheck className="size-5" />
                      </div>
                      <div>
                        <Typography.Caption
                          color="secondary"
                          className="uppercase tracking-tighter font-bold text-[10px]"
                        >
                          Security Status
                        </Typography.Caption>
                        <Typography.BodyBold className="text-sm">
                          Verified
                        </Typography.BodyBold>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Security & Access Section */}
                <Card className="border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                  <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Lock className="size-4 text-primary" />
                      Security & Access
                    </CardTitle>
                    <Typography.Caption color="secondary">
                      Manage your password and authentication methods
                    </Typography.Caption>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/40 bg-muted/20">
                      <div className="space-y-1">
                        <Typography.BodyBold className="text-sm">
                          Password Management
                        </Typography.BodyBold>
                        <Typography.Caption color="secondary">
                          Update your password to keep your account secure
                        </Typography.Caption>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs font-semibold rounded-lg"
                        onClick={handlePasswordReset}
                        disabled={resettingPassword}
                      >
                        {resettingPassword ? (
                          <Loader2 className="size-3 animate-spin mr-2" />
                        ) : (
                          <Key className="size-3 mr-2" />
                        )}
                        Reset via Email
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                        Unique Account ID
                      </Label>
                      <div className="group relative">
                        <div className="h-11 flex items-center px-4 rounded-xl bg-muted/10 border border-border/40 font-mono text-[10px] text-muted-foreground select-all transition-all group-hover:bg-muted/20">
                          {user.uid}
                        </div>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Typography.Caption
                            color="primary"
                            className="text-[9px] font-bold"
                          >
                            CLICK TO COPY
                          </Typography.Caption>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Data & Privacy Section */}
                <Card className="border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                  <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <ShieldCheck className="size-4 text-primary" />
                      Data & Privacy
                    </CardTitle>
                    <Typography.Caption color="secondary">
                      How we handle your data and your rights under GDPR
                    </Typography.Caption>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button
                        variant="ghost"
                        className="h-auto py-4 px-4 justify-start flex-col items-start gap-1 rounded-xl border border-border/40 hover:bg-muted/40 transition-all"
                      >
                        <Typography.BodyBold className="text-sm">
                          Export Data
                        </Typography.BodyBold>
                        <Typography.Caption className="text-[10px]">
                          Download all your interview results and profile info
                        </Typography.Caption>
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-auto py-4 px-4 justify-start flex-col items-start gap-1 rounded-xl border border-border/40 hover:bg-muted/40 transition-all"
                      >
                        <Typography.BodyBold className="text-sm">
                          Privacy Overview
                        </Typography.BodyBold>
                        <Typography.Caption className="text-[10px]">
                          Learn how we use AI to analyze your performance
                        </Typography.Caption>
                      </Button>
                    </div>

                    <div className="pt-6">
                      <div className="p-4 rounded-xl border border-red-100 bg-red-50/30 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <Typography.BodyBold className="text-sm text-red-600 flex items-center gap-2">
                            <Trash2 className="size-4" />
                            Danger Zone
                          </Typography.BodyBold>
                          <Typography.Caption className="text-red-500/70 text-[11px]">
                            Permanently delete your account and all associated
                            data
                          </Typography.Caption>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-9 px-4 text-xs font-bold rounded-lg shadow-lg shadow-red-200"
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  );
}
