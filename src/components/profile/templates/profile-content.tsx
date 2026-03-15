"use client";

import { updateProfile } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import {
  CreditCard as BillingIcon,
  Calendar,
  ChevronRight,
  Edit2,
  History,
  Key,
  Loader2,
  LogOut,
  Save,
  Shield,
  UserCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AvatarIconDisplay,
  AvatarIconSelector,
} from "@/components/common/atoms/avatar-icon-selector";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { UserPreferences } from "@/types/firestore";

interface ProfileContentProps {
  user: UserData;
  initialTab?: "subscription" | "profile" | "account";
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

const LOOKUP_KEY = process.env.NEXT_PUBLIC_STRIPE_LOOKUP_KEY ?? "";
const PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ?? "";

export function ProfileContent({
  user: _serverUser,
  initialTab = "profile",
}: ProfileContentProps) {
  const { user, userData, refreshUserData, loading, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "subscription" | "profile" | "account"
  >(initialTab);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [editData, setEditData] = useState({
    displayName: "",
    role: "",
    experience: "",
    preferredLocation: "",
  });
  const [selectedIcon, setSelectedIcon] = useState<string>("");

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success) toast.success("Subscription successful! Welcome to Pro.");
    if (canceled) toast.error("Subscription canceled. No charges were made.");
  }, [searchParams]);

  const SETTINGS_TABS = [
    {
      id: "profile",
      label: "Personal Profile",
      description: "IDENTITY",
      icon: UserCircle,
    },
    {
      id: "subscription",
      label: "Subscription",
      description: "BILLING",
      icon: BillingIcon,
    },
    {
      id: "account",
      label: "Account Security",
      description: "PRIVACY",
      icon: Shield,
    },
  ] as const;

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [user, loading, router]);

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
        avatarIcon: iconId || null,
        photoURL: null,
      });
      await updateProfile(user, { photoURL: null });
      setSelectedIcon(iconId);
      await refreshUserData();
      toast.success("Avatar updated");
    } catch (_error) {
      toast.error("Failed to update avatar");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !db) {
      toast.error("Connection error. Please try again.");
      return;
    }

    setSaving(true);
    try {
      await updateProfile(user, { displayName: editData.displayName });

      const basePreferences: UserPreferences = userData?.preferences ?? {
        preferredDifficulty: "intermediate",
        preferredInterviewTypes: ["technical"],
        targetCompanies: [],
        notificationsEnabled: true,
        language: "en",
      };

      const userDocData = {
        displayName: editData.displayName,
        role: editData.role,
        experience: editData.experience,
        email: user.email || "",
        uid: user.uid,
        avatarIcon: selectedIcon || null,
        photoURL: null,
        preferences: {
          ...basePreferences,
          preferredLocation:
            editData.preferredLocation ||
            basePreferences.preferredLocation ||
            "",
        },
        lastLoginAt: new Date(),
        createdAt: userData?.createdAt ?? new Date(),
      };

      await setDoc(doc(db, "users", user.uid), userDocData, { merge: true });
      await refreshUserData();
      setIsEditing(false);
      toast.success("Profile saved successfully");
    } catch (_error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setResettingPassword(true);
    try {
      const { error } = await requestPasswordReset(user.email);
      if (error) toast.error(error);
      else toast.success("Reset link sent to your email");
    } catch (_error) {
      toast.error("Unable to send reset email");
    } finally {
      setResettingPassword(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
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
    }).format(date);
  };

  if (loading || !user || !userData)
    return (
      <div className="flex-1 flex items-center justify-center bg-background/50">
        <div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );

  return (
    <main className="flex-1 overflow-y-auto bg-background/50 pb-24">
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Profile Styled Header - Adjusted to 5xl max-width */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Typography.Caption className="text-3xl sm:text-4xl font-bold tracking-tight">
              Settings
            </Typography.Caption>
          </div>

          <Button
            variant="outline"
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
          >
            <LogOut className="size-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Navigation Sidebar */}
          <aside className="w-full lg:w-60 shrink-0">
            <div className="sticky top-8">
              <nav className="flex lg:flex-col gap-1 p-1 bg-card border border-border/50 rounded-xl">
                {SETTINGS_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      type="button"
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex-1 lg:flex-none flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-left",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      )}
                    >
                      <tab.icon
                        className={cn(
                          "size-4 shrink-0",
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground",
                        )}
                      />
                      <div className="hidden lg:block">
                        <div className="font-bold text-xs leading-tight">
                          {tab.label}
                        </div>
                        <div
                          className={cn(
                            "text-[8px] font-black tracking-widest leading-tight mt-0.5",
                            isActive
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground/50",
                          )}
                        >
                          {tab.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  <div className="bg-card border border-border/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="space-y-0.5">
                        <div className="text-[9px] font-bold text-primary uppercase tracking-widest">
                          Profile Identity
                        </div>
                        <Typography.Caption className="text-xl font-bold tracking-tight">
                          Personal Details
                        </Typography.Caption>
                      </div>
                      <Button
                        variant={isEditing ? "ghost" : "outline"}
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? (
                          "Cancel"
                        ) : (
                          <>
                            <Edit2 className="size-3 mr-2" /> Edit
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar Cell - Standardized circle to match ME icon */}
                        <div className="relative group shrink-0">
                          <div className="size-24 rounded-full bg-muted/20 border border-border/40 flex items-center justify-center overflow-hidden transition-all group-hover:scale-[1.01] shadow-sm">
                            {userData.avatarIcon ? (
                              <AvatarIconDisplay
                                iconId={userData.avatarIcon}
                                size="lg"
                              />
                            ) : (
                              <Typography.BodyBold className="text-2xl text-muted-foreground/30">
                                {getInitials(
                                  userData.displayName || user.displayName,
                                )}
                              </Typography.BodyBold>
                            )}
                          </div>
                          {userData.subscription?.plan === "pro" && (
                            <div className="absolute top-0 right-0 z-20 bg-primary px-1.5 py-0.5 rounded-full text-[7px] font-black text-primary-foreground shadow-sm">
                              PRO
                            </div>
                          )}
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                          <div className="p-3.5 rounded-xl bg-muted/5 border border-border/40 space-y-1">
                            <label
                              htmlFor="displayName"
                              className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest"
                            >
                              Display Identity
                            </label>
                            {isEditing ? (
                              <Input
                                id="displayName"
                                value={editData.displayName}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    displayName: e.target.value,
                                  })
                                }
                                className="h-8 rounded-md bg-background border-border/40 text-sm"
                              />
                            ) : (
                              <div className="text-sm font-bold text-foreground">
                                {userData.displayName ||
                                  user.displayName ||
                                  "Anonymous"}
                              </div>
                            )}
                          </div>
                          <div className="p-3.5 rounded-xl bg-muted/5 border border-border/40 space-y-1 opacity-70">
                            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                              Verified Email
                            </div>
                            <div className="text-sm font-medium text-muted-foreground truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator className="opacity-30" />

                      {/* Icon Selector Grid - Fixed conflicting class */}
                      <div className="space-y-4">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                          Identity Collection
                        </div>
                        <AvatarIconSelector
                          selectedIcon={selectedIcon}
                          onSelectIcon={handleIconSelect}
                          variant="embedded"
                          className="border-none shadow-none bg-transparent p-0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border/50 rounded-2xl p-6">
                    <div className="space-y-0.5 mb-6">
                      <div className="text-[9px] font-bold text-primary uppercase tracking-widest">
                        Professional Context
                      </div>
                      <Typography.Caption className="text-xl font-bold tracking-tight">
                        Interview Logic
                      </Typography.Caption>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-primary/[0.02] border border-primary/10 space-y-2">
                        <div className="text-[8px] font-bold text-primary uppercase tracking-widest">
                          Candidate Role
                        </div>
                        {isEditing ? (
                          <Select
                            value={editData.role}
                            onValueChange={(v) =>
                              setEditData({ ...editData, role: v })
                            }
                          >
                            <SelectTrigger className="h-9 rounded-md bg-card border-primary/20 text-sm">
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
                          <div className="text-base font-bold text-foreground">
                            {userData.role || "Not Configured"}
                          </div>
                        )}
                      </div>

                      <div className="p-4 rounded-xl bg-primary/[0.02] border border-primary/10 space-y-2">
                        <div className="text-[8px] font-bold text-primary uppercase tracking-widest">
                          Industry Longevity
                        </div>
                        {isEditing ? (
                          <Select
                            value={editData.experience}
                            onValueChange={(v) =>
                              setEditData({ ...editData, experience: v })
                            }
                          >
                            <SelectTrigger className="h-9 rounded-md bg-card border-primary/20 text-sm">
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
                          <div className="text-base font-bold text-foreground">
                            {userData.experience || "Not Set"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end pt-1">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        size="sm"
                      >
                        {saving ? (
                          <Loader2 className="size-3 animate-spin mr-2" />
                        ) : (
                          <Save className="size-3 mr-2" />
                        )}
                        Apply Changes
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "subscription" && (
                <motion.div
                  key="subscription"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />

                    <div className="space-y-1 mb-10 relative z-10">
                      <div className="text-[9px] font-bold text-primary uppercase tracking-widest">
                        Billing Cycle
                      </div>
                      <Typography.Caption className="text-2xl font-bold tracking-tight">
                        Subscription Access
                      </Typography.Caption>
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-tighter mt-1">
                        Active Tier:{" "}
                        <span className="text-primary font-bold">
                          {userData.subscription?.plan || "Free"}
                        </span>
                      </div>
                    </div>

                    <div className="relative z-10">
                      {userData.subscription?.plan === "pro" ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                              { label: "Plan", val: "Pro" },
                              { label: "Rate", val: "$5.00/mo" },
                              {
                                label: "Status",
                                val: "Active",
                                accent: "text-emerald-500",
                              },
                            ].map((item) => (
                              <div
                                key={item.label}
                                className="p-3.5 rounded-xl bg-muted/5 border border-border/40 text-center"
                              >
                                <div className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                  {item.label}
                                </div>
                                <div
                                  className={cn(
                                    "text-sm font-bold",
                                    item.accent || "text-foreground",
                                  )}
                                >
                                  {item.val}
                                </div>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            className="w-full text-xs font-bold"
                            onClick={async () => {
                              const res = await fetch("/api/stripe/portal", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  userId: user.uid,
                                  email: user.email,
                                }),
                              });
                              const d = await res.json();
                              if (d.url) window.location.href = d.url;
                            }}
                          >
                            Open Stripe Portal
                            <ChevronRight className="ml-1 size-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-6 rounded-xl border border-border/40 bg-muted/5 flex flex-col justify-between opacity-70 group hover:opacity-100 transition-opacity">
                            <div className="space-y-3">
                              <Typography.Caption className="text-lg font-bold">
                                Standard
                              </Typography.Caption>
                              <div className="space-y-1.5">
                                {[
                                  "Daily Session Caps",
                                  "Essential Analytics",
                                ].map((f) => (
                                  <div
                                    key={f}
                                    className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground"
                                  >
                                    <div className="size-1 rounded-full bg-border" />{" "}
                                    {f}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="text-2xl font-black mt-6 tracking-tighter">
                              $0
                            </div>
                          </div>

                          <div className="p-6 rounded-xl border-2 border-primary/20 bg-primary/5 flex flex-col justify-between relative overflow-hidden group">
                            <div className="space-y-3 relative z-10">
                              <Typography.Caption className="text-lg font-bold flex items-center gap-1.5 text-primary">
                                Pro <Zap className="size-3.5 fill-primary" />
                              </Typography.Caption>
                              <div className="space-y-1.5">
                                {[
                                  "Unlimited Mock Sessions",
                                  "Deep Performance Mapping",
                                ].map((f) => (
                                  <div
                                    key={f}
                                    className="flex items-center gap-2 text-[10px] font-bold text-foreground"
                                  >
                                    <div className="size-1 rounded-full bg-primary" />{" "}
                                    {f}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-3 relative z-10 mt-6">
                              <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black tracking-tighter text-foreground">
                                  $5
                                </span>
                                <span className="text-muted-foreground text-[8px] font-black uppercase tracking-widest">
                                  / month
                                </span>
                              </div>
                              <Button
                                className="w-full h-9 text-xs font-bold shadow-sm"
                                disabled={checkoutLoading}
                                onClick={async () => {
                                  if (!LOOKUP_KEY || !PRICE_ID)
                                    return toast.error("Billing logic fail.");
                                  setCheckoutLoading(true);
                                  try {
                                    const response = await fetch(
                                      "/api/stripe/checkout",
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          userId: user.uid,
                                          lookupKey: LOOKUP_KEY,
                                          priceId: PRICE_ID,
                                          email: user.email,
                                        }),
                                      },
                                    );
                                    const data = await response.json();
                                    if (data.url)
                                      window.location.href = data.url;
                                  } catch (_error) {
                                    toast.error("Network fault.");
                                  } finally {
                                    setCheckoutLoading(false);
                                  }
                                }}
                              >
                                {checkoutLoading ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  "Upgrade Now"
                                )}
                              </Button>
                            </div>
                            <div className="absolute -bottom-16 -right-16 size-48 bg-primary/10 rounded-full blur-[50px]" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "account" && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      {
                        label: "Deployment",
                        val: userData.createdAt
                          ? formatDate(userData.createdAt)
                          : "--",
                        icon: Calendar,
                      },
                      {
                        label: "Last Active",
                        val: userData.lastLoginAt
                          ? formatDate(userData.lastLoginAt)
                          : "Now",
                        icon: History,
                      },
                      {
                        label: "Encryption",
                        val: "Verified",
                        icon: Shield,
                        accent: "text-emerald-500",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-card border border-border/50 rounded-xl p-4 flex flex-col gap-2"
                      >
                        <stat.icon className="size-3.5 text-muted-foreground" />
                        <div>
                          <div className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest">
                            {stat.label}
                          </div>
                          <div
                            className={cn(
                              "text-sm font-bold truncate",
                              stat.accent,
                            )}
                          >
                            {stat.val}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-card border border-border/50 rounded-2xl p-6">
                    <div className="space-y-0.5 mb-6">
                      <div className="text-[9px] font-bold text-primary uppercase tracking-widest">
                        Privacy Controls
                      </div>
                      <Typography.Caption className="text-xl font-bold tracking-tight">
                        Security Protocol
                      </Typography.Caption>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-muted/5 border border-border/40">
                      <div className="space-y-0.5 text-center sm:text-left">
                        <div className="text-base font-bold">
                          Credential Sync
                        </div>
                        <div className="text-[10px] text-muted-foreground font-medium">
                          Reconfigure account access via verification mail.
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePasswordReset}
                        disabled={resettingPassword}
                      >
                        {resettingPassword ? (
                          <Loader2 className="size-3 animate-spin mr-2" />
                        ) : (
                          <Key className="size-3 mr-2" />
                        )}
                        Reset
                      </Button>
                    </div>
                  </div>

                  <div className="pt-6 space-y-3">
                    <div className="flex items-center gap-3 px-2">
                      <div className="text-[8px] font-black text-red-500 uppercase tracking-widest shrink-0">
                        Security Violation
                      </div>
                      <div className="h-[1px] w-full bg-red-500/10" />
                    </div>

                    <div className="bg-red-500/[0.02] border border-red-500/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="space-y-0.5 text-center sm:text-left">
                        <div className="text-base font-bold text-red-500">
                          Purge Data
                        </div>
                        <div className="text-[10px] text-red-500/60 font-medium">
                          Permanent deletion of all technical session data.
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="font-bold"
                      >
                        Purge
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
