"use client";

import { updateProfile } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  CreditCard,
  Edit2,
  History,
  Key,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Save,
  ShieldCheck,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiCreditCard } from "react-icons/fi";
import { toast } from "sonner";
import {
  AvatarIconDisplay,
  AvatarIconSelector,
} from "@/components/common/atoms/avatar-icon-selector";
import { Typography } from "@/components/common/atoms/typography";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  initialTab = "subscription",
}: ProfileContentProps) {
  const { user, userData, refreshUserData, loading, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [activeTab, setActiveTab] = useState<
    "subscription" | "profile" | "account"
  >(initialTab);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success) {
      toast.success("Subscription successful! Welcome to Pro.");
    }
    if (canceled) {
      toast.error("Subscription canceled. No charges were made.");
    }
  }, [searchParams]);

  const SETTINGS_TABS = [
    { id: "subscription", label: "Subscription", icon: CreditCard },
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: Lock },
  ] as const;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
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

  if (loading) {
    return null;
  }

  if (!user || !userData) {
    return null;
  }

  return (
    <main className="flex-1 overflow-y-auto bg-background animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="relative border-b bg-card overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 py-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              {userData?.avatarIcon ? (
                <div className="size-20 border-4 border-background rounded-full flex items-center justify-center bg-card shadow-xl ring-1 ring-primary/20">
                  <AvatarIconDisplay
                    iconId={userData.avatarIcon}
                    size="xl"
                    className="size-14"
                  />
                </div>
              ) : (
                <Avatar className="size-20 border-4 border-background shadow-xl ring-1 ring-primary/20">
                  <AvatarFallback className="bg-primary/5 text-primary">
                    <Typography.Heading3>
                      {getInitials(userData?.displayName || user.displayName)}
                    </Typography.Heading3>
                  </AvatarFallback>
                </Avatar>
              )}
              {userData?.subscription?.plan === "pro" && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -bottom-1 -right-1 bg-primary/10 px-2 py-0.5 rounded-full shadow-lg border-2 border-background flex items-center gap-1"
                >
                  <Zap
                    className="size-3 fill-current text-primary"
                    aria-hidden="true"
                  />
                  <Typography.SubCaptionBold color="brand">
                    PRO
                  </Typography.SubCaptionBold>
                </motion.div>
              )}
            </div>

            <div className="space-y-1 text-center md:text-left flex-1">
              <Typography.Heading1>
                {userData?.displayName || user.displayName || "Anonymous User"}
              </Typography.Heading1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="size-3.5 text-muted-foreground" />
                  <Typography.Caption color="secondary">
                    {userData?.role || "Candidate"}
                  </Typography.Caption>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  <Typography.Caption color="secondary">
                    {userData.preferences?.preferredLocation || "Remote"}
                  </Typography.Caption>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1.5 min-w-0">
                  <Mail className="size-3.5 text-muted-foreground" />
                  <Typography.Caption className="truncate" color="secondary">
                    {user.email}
                  </Typography.Caption>
                </div>
              </div>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                await signOut();
                router.push("/");
                router.refresh();
              }}
            >
              <Typography.CaptionMedium>Sign Out</Typography.CaptionMedium>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 sm:px-6 pt-4 pb-12">
        {statusMessage && (
          <div
            className={`mb-6 p-3 border rounded-md ${
              statusVariant === "success"
                ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
            }`}
          >
            <Typography.Caption
              color={statusVariant === "success" ? "success" : "error"}
            >
              {statusMessage}
            </Typography.Caption>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          <nav className="md:w-56 shrink-0 flex md:flex-col gap-1">
            {SETTINGS_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Button
                  type="button"
                  key={tab.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={`justify-start gap-2.5 border rounded-lg ${
                    isActive
                      ? "bg-primary/10 border-primary/20"
                      : "border-border/20 hover:bg-muted/5"
                  }`}
                >
                  <tab.icon
                    className={`size-4 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                    aria-hidden="true"
                  />
                  <Typography.Caption color={isActive ? "brand" : "secondary"}>
                    {tab.label}
                  </Typography.Caption>
                </Button>
              );
            })}
          </nav>

          <div className="flex-1 space-y-5 min-w-0">
            {activeTab === "subscription" && (
              <div
                key="subscription"
                className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"
              >
                <div className="grid grid-cols-1 gap-4">
                  <Card className="gap-2 py-4">
                    <CardHeader className="py-0 gap-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FiCreditCard className="size-9 text-primary" />
                          <div className="flex flex-col gap-0.5">
                            <Typography.BodyBold>
                              Subscription Overview
                            </Typography.BodyBold>
                            <Typography.Caption color="secondary">
                              View and manage your current access level
                            </Typography.Caption>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-2">
                      {userData?.subscription?.plan === "pro" ? (
                        <div className="space-y-4">
                          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <ShieldCheck className="size-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                              <Typography.BodyBold>
                                Pro Benefits Active
                              </Typography.BodyBold>
                              <Typography.Caption color="secondary">
                                You have full access to unlimited mock
                                interviews, advanced AI analysis, and career
                                progress tracking.
                              </Typography.Caption>
                            </div>
                          </div>

                          <Typography.SubCaptionBold
                            className="uppercase"
                            color="secondary"
                          >
                            Plan details
                          </Typography.SubCaptionBold>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-3 rounded-lg border border-border/20 bg-muted/5 flex flex-col gap-1.5">
                              <Typography.SubCaptionBold
                                className="uppercase"
                                color="secondary"
                              >
                                Current plan
                              </Typography.SubCaptionBold>
                              <Typography.BodyBold className="flex items-center gap-2">
                                Pro Monthly{" "}
                                <Zap className="size-4 fill-primary text-primary" />
                              </Typography.BodyBold>
                            </div>
                            <div className="p-3 rounded-lg border border-border/20 bg-muted/5 flex flex-col gap-1.5">
                              <Typography.SubCaptionBold
                                className="uppercase"
                                color="secondary"
                              >
                                Billing price
                              </Typography.SubCaptionBold>
                              <Typography.BodyBold color="brand">
                                $5 / month
                              </Typography.BodyBold>
                            </div>
                            <div className="p-3 rounded-lg border border-border/20 bg-muted/5 flex flex-col gap-1.5">
                              <Typography.SubCaptionBold
                                className="uppercase"
                                color="secondary"
                              >
                                Status
                              </Typography.SubCaptionBold>
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                <Typography.BodyBold color="success">
                                  Active
                                </Typography.BodyBold>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="lg"
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

                            <Typography.SubCaption color="secondary">
                              Secure billing portal powered by Stripe
                            </Typography.SubCaption>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Typography.SubCaptionBold
                            className="block uppercase mb-3"
                            color="secondary"
                          >
                            Choose your plan
                          </Typography.SubCaptionBold>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <section className="rounded-xl border border-border/30 p-4 space-y-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                  <Typography.BodyBold>
                                    Free
                                  </Typography.BodyBold>
                                  <Typography.Caption color="secondary">
                                    Current plan
                                  </Typography.Caption>
                                </div>
                                <Typography.BodyBold color="secondary">
                                  $0
                                </Typography.BodyBold>
                              </div>

                              <Separator />

                              <Typography.SubCaptionBold
                                className="block uppercase mb-3"
                                color="secondary"
                              >
                                Includes
                              </Typography.SubCaptionBold>

                              <div className="pt-1 space-y-3">
                                {[
                                  "Limited daily usage",
                                  "Core interview practice",
                                  "Basic progress tracking",
                                ].map((feature) => (
                                  <div
                                    key={feature}
                                    className="flex items-start gap-3"
                                  >
                                    <div className="mt-0.5 h-4 w-4 rounded-full bg-muted flex items-center justify-center shrink-0">
                                      <CheckCircle2 className="size-2.5 text-muted-foreground" />
                                    </div>
                                    <Typography.Caption color="secondary">
                                      {feature}
                                    </Typography.Caption>
                                  </div>
                                ))}
                              </div>
                            </section>

                            <section className="rounded-xl border-2 border-primary/40 bg-primary/5 p-4 space-y-3 ring-1 ring-primary/10 transition-shadow hover:ring-primary/20 focus-within:ring-2 focus-within:ring-primary/25">
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Typography.BodyBold>
                                      Pro
                                    </Typography.BodyBold>
                                    <div className="rounded-full border border-primary/30 px-2 py-0.5">
                                      <Typography.SubCaptionBold color="brand">
                                        Recommended
                                      </Typography.SubCaptionBold>
                                    </div>
                                  </div>
                                  <Typography.Caption color="secondary">
                                    Unlimited practice + advanced insights
                                  </Typography.Caption>
                                </div>

                                <div className="flex flex-col items-end">
                                  <div className="flex items-baseline gap-2">
                                    <Typography.Heading2 color="brand">
                                      $5
                                    </Typography.Heading2>
                                    <Typography.SubCaption color="brandLight">
                                      / month
                                    </Typography.SubCaption>
                                  </div>
                                  <Typography.SubCaption color="secondary">
                                    Cancel anytime
                                  </Typography.SubCaption>
                                </div>
                              </div>

                              <Separator />

                              <Typography.SubCaptionBold
                                className="block uppercase mb-3"
                                color="secondary"
                              >
                                Includes
                              </Typography.SubCaptionBold>

                              <div className="pt-1 space-y-3">
                                {[
                                  "Unlimited Mock Interviews",
                                  "AI Performance Metrics",
                                  "Priority Support",
                                ].map((feature) => (
                                  <div
                                    key={feature}
                                    className="flex items-start gap-3"
                                  >
                                    <div className="mt-0.5 h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                      <CheckCircle2 className="size-2.5 text-primary" />
                                    </div>
                                    <Typography.Caption color="secondary">
                                      {feature}
                                    </Typography.Caption>
                                  </div>
                                ))}
                              </div>

                              <div className="space-y-2">
                                <Button
                                  variant="default"
                                  size="lg"
                                  className="w-full sm:w-auto"
                                  onClick={async () => {
                                    if (!user) {
                                      toast.error("Please sign in to upgrade");
                                      router.push(
                                        "/auth/login?redirect=/settings",
                                      );
                                      return;
                                    }

                                    if (!LOOKUP_KEY || !PRICE_ID) {
                                      toast.error(
                                        "Billing is not configured. Please contact support.",
                                      );
                                      return;
                                    }

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
                                      if (data.url) {
                                        window.location.href = data.url;
                                        return;
                                      }

                                      throw new Error(
                                        data.error ||
                                          "Failed to create checkout session",
                                      );
                                    } catch (error: any) {
                                      toast.error(error.message);
                                    } finally {
                                      setCheckoutLoading(false);
                                    }
                                  }}
                                  disabled={checkoutLoading}
                                >
                                  <Zap className="size-4 mr-2 fill-current" />
                                  {checkoutLoading
                                    ? "Processing..."
                                    : "Upgrade to Pro"}
                                </Button>

                                <Typography.SubCaption
                                  className="block"
                                  color="secondary"
                                >
                                  Secure payment powered by Stripe
                                </Typography.SubCaption>
                              </div>
                            </section>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="gap-2 py-4">
                    <CardContent className="py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-center sm:text-left">
                        <Typography.BodyBold>
                          Need help with your subscription?
                        </Typography.BodyBold>
                        <Typography.Caption color="secondary">
                          Our support team is here to assist with billing and
                          plan questions.
                        </Typography.Caption>
                      </div>
                      <Button
                        variant="link"
                        onClick={() => router.push("/support")}
                      >
                        Contact Support
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div
                key="profile"
                className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"
              >
                <div className="grid grid-cols-1 gap-4">
                  <Card className="gap-2 py-4">
                    <CardHeader className="py-0 gap-0">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Typography.Heading3 className="flex items-center gap-2">
                            <User className="size-4 text-primary" />
                            Personal Identity
                          </Typography.Heading3>
                          <Typography.Caption color="secondary">
                            Manage your public-facing information and avatar
                          </Typography.Caption>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent"
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
                    <CardContent className="pt-2 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <Typography.SubCaptionBold
                            className="uppercase"
                            color="secondary"
                          >
                            Display Name
                          </Typography.SubCaptionBold>
                          {isEditing ? (
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                              <Input
                                value={editData.displayName}
                                onChange={(e) =>
                                  setEditData((p) => ({
                                    ...p,
                                    displayName: e.target.value,
                                  }))
                                }
                                className="h-10 pl-10 bg-muted/20 border-border/20 focus:ring-primary/20 rounded-lg"
                              />
                            </div>
                          ) : (
                            <div className="h-10 flex items-center px-3 rounded-lg bg-muted/5 border border-border/20">
                              <Typography.BodyMedium color="primary">
                                {userData?.displayName ||
                                  user.displayName ||
                                  "Not set"}
                              </Typography.BodyMedium>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Typography.SubCaptionBold
                            className="uppercase"
                            color="secondary"
                          >
                            Account Email
                          </Typography.SubCaptionBold>
                          <div className="h-10 flex items-center px-3 rounded-lg bg-muted/5 border border-border/20">
                            <Typography.BodyMedium color="primary">
                              {user.email}
                            </Typography.BodyMedium>
                          </div>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-border/20">
                        <Typography.SubCaptionBold
                          className="uppercase block mb-2"
                          color="secondary"
                        >
                          Profile Avatar
                        </Typography.SubCaptionBold>
                        <AvatarIconSelector
                          selectedIcon={selectedIcon}
                          onSelectIcon={handleIconSelect}
                          variant="embedded"
                          className="border-none shadow-none bg-transparent p-0"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="gap-2 py-4">
                    <CardHeader className="py-0 gap-0">
                      <Typography.Heading3
                        className="flex items-center gap-2"
                        color="primary"
                      >
                        <Briefcase className="size-4 text-primary" />
                        Professional Details
                      </Typography.Heading3>
                      <Typography.Caption color="secondary">
                        Details we use to customize your experience
                      </Typography.Caption>
                    </CardHeader>
                    <CardContent className="pt-2 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <Typography.SubCaptionBold
                            className="uppercase"
                            color="secondary"
                          >
                            Target Role
                          </Typography.SubCaptionBold>
                          {isEditing ? (
                            <Select
                              value={editData.role}
                              onValueChange={(v) =>
                                setEditData((p) => ({ ...p, role: v }))
                              }
                            >
                              <SelectTrigger className="h-10 bg-muted/20 border-border/20 rounded-lg">
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
                            <div className="h-10 flex items-center px-3 rounded-lg bg-muted/5 border border-border/20">
                              <Typography.BodyMedium>
                                {userData?.role || "Not set"}
                              </Typography.BodyMedium>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Typography.SubCaptionBold
                            className="uppercase"
                            color="secondary"
                          >
                            Experience Level
                          </Typography.SubCaptionBold>
                          {isEditing ? (
                            <Select
                              value={editData.experience}
                              onValueChange={(v) =>
                                setEditData((p) => ({ ...p, experience: v }))
                              }
                            >
                              <SelectTrigger className="h-10 bg-muted/20 border-border/20 rounded-lg">
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
                            <div className="h-10 flex items-center px-3 rounded-lg bg-muted/5 border border-border/20">
                              <Typography.BodyMedium>
                                {userData?.experience || "Not set"}
                              </Typography.BodyMedium>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {isEditing && (
                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        size="lg"
                      >
                        {saving ? (
                          <Loader2 className="size-4 animate-spin mr-2" />
                        ) : (
                          <Save className="size-4 mr-2" />
                        )}
                        Update Career Profile
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div
                key="account"
                className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"
              >
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Card className="gap-2 py-4">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Calendar className="size-5" />
                        </div>
                        <div>
                          <Typography.SubCaptionBold
                            className="uppercase"
                            color="secondary"
                          >
                            Member Since
                          </Typography.SubCaptionBold>
                          <Typography.BodyBold>
                            {userData?.createdAt
                              ? formatDate(userData.createdAt).split(" at")[0]
                              : "Jan 2024"}
                          </Typography.BodyBold>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="gap-2 py-4">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <History className="size-5" />
                        </div>
                        <div>
                          <Typography.SubCaptionBold
                            className="uppercase"
                            color="secondary"
                          >
                            Last Login
                          </Typography.SubCaptionBold>
                          <Typography.BodyBold>
                            {userData?.lastLoginAt
                              ? formatDate(userData.lastLoginAt).split(" at")[0]
                              : "Today"}
                          </Typography.BodyBold>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="gap-2 py-4">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <ShieldCheck className="size-5" />
                        </div>
                        <div>
                          <Typography.SubCaptionBold
                            className="uppercase"
                            color="secondary"
                          >
                            Security Status
                          </Typography.SubCaptionBold>
                          <Typography.BodyBold>Verified</Typography.BodyBold>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="gap-2 py-4">
                    <CardHeader className="py-0 gap-0">
                      <Typography.Heading3 className="flex items-center gap-2">
                        <Lock className="size-4 text-primary" />
                        Security & Access
                      </Typography.Heading3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border/20 bg-muted/5">
                        <div className="space-y-1">
                          <Typography.BodyBold>
                            Password Management
                          </Typography.BodyBold>
                          <Typography.Caption color="secondary">
                            Update your password to keep your account secure
                          </Typography.Caption>
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
                          Reset via Email
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="gap-2 py-4">
                    <CardHeader className="py-0 gap-0">
                      <Typography.Heading3 className="flex items-center gap-2">
                        <Trash2 className="size-4 text-red-500" />
                        Danger Zone
                      </Typography.Heading3>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 rounded-lg border border-red-200/70 bg-red-50/40 dark:border-red-900/40 dark:bg-red-900/10 flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          <Typography.BodyBold color="error">
                            Permanently Delete Account
                          </Typography.BodyBold>
                          <Typography.Caption color="error">
                            All data will be lost forever
                          </Typography.Caption>
                        </div>
                        <Button variant="destructive" size="sm">
                          Delete Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
