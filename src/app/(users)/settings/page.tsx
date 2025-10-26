"use client";

import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Cookie,
  Palette,
  Save,
  Settings as SettingsIcon,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import LoadingPage from "@/components/common/atoms/loading-page";
import DashboardNavbar from "@/components/common/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/common/organisms/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/providers/auth-provider";

interface CookieSettings {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cookieSettings, setCookieSettings] = useState<CookieSettings>({
    essential: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem("cookieSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setCookieSettings({
          essential: true,
          analytics: parsed.analytics || false,
          marketing: parsed.marketing || false,
          preferences: parsed.preferences || false,
        });
      } catch (error) {
        console.error("Error parsing cookie settings:", error);
      }
    }
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  const handleCookieSettingChange = (
    key: keyof CookieSettings,
    value: boolean,
  ) => {
    if (key === "essential") return;

    setCookieSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      localStorage.setItem("cookieSettings", JSON.stringify(cookieSettings));
      toast.success("Settings saved successfully!", {
        description: "Your cookie preferences have been updated.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings", {
        description: "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const clearAllCookies = () => {
    const cookies = document.cookie.split(";");
    const essentialCookies = ["auth-token", "session", "csrf"];

    cookies.forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

      const isEssential = essentialCookies.some((essential) =>
        name.includes(essential),
      );

      if (!isEssential && name) {
        try {
          const clearCookie = (cookieName: string) => {
            const paths = ["/", `${window.location.pathname}`];
            const domains = ["", window.location.hostname];

            paths.forEach((path) => {
              domains.forEach((domain) => {
                const domainPart = domain ? `; domain=${domain}` : "";
                const cookieString = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domainPart}`;

                try {
                  // biome-ignore lint/suspicious/noDocumentCookie: Legacy cookie clearing requires direct manipulation
                  document.cookie = cookieString;
                } catch (error) {
                  console.warn(`Failed to clear cookie ${cookieName}:`, error);
                }
              });
            });
          };

          clearCookie(name);
        } catch (error) {
          console.warn(`Failed to clear cookie: ${name}`, error);
        }
      }
    });

    setCookieSettings({
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });

    toast.success("Cookies cleared successfully", {
      description: "Non-essential cookies have been removed.",
    });
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-5xl">
            {/* Page Header */}
            <div className="mb-8 sm:mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <SettingsIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Settings
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage your preferences and application settings
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {/* Cookie Settings */}
              <Card className="border-2">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Cookie className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl sm:text-2xl">
                        Cookie Settings
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Manage your cookie preferences for this application
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-6">
                    {/* Essential Cookies */}
                    <Card className="border-2">
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-green-600" />
                              <Label className="text-base font-semibold">
                                Essential Cookies
                              </Label>
                              <Badge variant="secondary" className="text-xs">
                                Required
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Required for the website to function properly.
                              These cookies enable core functionality and cannot
                              be disabled.
                            </p>
                          </div>
                          <div className="flex items-center justify-start sm:justify-end">
                            <Switch
                              checked={cookieSettings.essential}
                              disabled={true}
                              aria-label="Essential cookies (always enabled)"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Analytics Cookies */}
                    <Card className="border-2 hover:border-primary/30 transition-all">
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Label className="text-base font-semibold">
                                Analytics Cookies
                              </Label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Help us understand how you use our application to
                              improve your experience and optimize performance.
                            </p>
                          </div>
                          <div className="flex items-center justify-start sm:justify-end">
                            <Switch
                              checked={cookieSettings.analytics}
                              onCheckedChange={(checked: boolean) =>
                                handleCookieSettingChange("analytics", checked)
                              }
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Marketing Cookies */}
                    <Card className="border-2 hover:border-primary/30 transition-all">
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Label className="text-base font-semibold">
                                Marketing Cookies
                              </Label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Used to show you relevant advertisements and track
                              campaign performance across different platforms.
                            </p>
                          </div>
                          <div className="flex items-center justify-start sm:justify-end">
                            <Switch
                              checked={cookieSettings.marketing}
                              onCheckedChange={(checked: boolean) =>
                                handleCookieSettingChange("marketing", checked)
                              }
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Preferences Cookies */}
                    <Card className="border-2 hover:border-primary/30 transition-all">
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Label className="text-base font-semibold">
                                Preferences Cookies
                              </Label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Remember your settings and preferences for a
                              personalized and better user experience.
                            </p>
                          </div>
                          <div className="flex items-center justify-start sm:justify-end">
                            <Switch
                              checked={cookieSettings.preferences}
                              onCheckedChange={(checked: boolean) =>
                                handleCookieSettingChange(
                                  "preferences",
                                  checked,
                                )
                              }
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Separator className="my-6" />

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        size="lg"
                        className="flex items-center gap-2"
                      >
                        {saving ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {saving ? "Saving..." : "Save Settings"}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={clearAllCookies}
                        size="lg"
                        className="flex items-center gap-2"
                      >
                        <AlertCircle className="h-4 w-4" />
                        Clear All Cookies
                      </Button>
                    </div>

                    {/* Cookie Status */}
                    <Card className="bg-muted/50 border-2">
                      <CardContent className="p-5">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          Current Cookie Status
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                            <span className="font-medium">Essential</span>
                            <Badge variant="default" className="bg-green-600">
                              Always Active
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                            <span className="font-medium">Analytics</span>
                            <Badge
                              variant={
                                cookieSettings.analytics
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                cookieSettings.analytics ? "bg-green-600" : ""
                              }
                            >
                              {cookieSettings.analytics ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                            <span className="font-medium">Marketing</span>
                            <Badge
                              variant={
                                cookieSettings.marketing
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                cookieSettings.marketing ? "bg-green-600" : ""
                              }
                            >
                              {cookieSettings.marketing ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                            <span className="font-medium">Preferences</span>
                            <Badge
                              variant={
                                cookieSettings.preferences
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                cookieSettings.preferences ? "bg-green-600" : ""
                              }
                            >
                              {cookieSettings.preferences
                                ? "Active"
                                : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-4 bg-blue-500/10 rounded-full">
                        <Bell className="h-8 w-8 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          Notifications
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Manage your notification preferences and alerts
                        </p>
                        <Badge variant="secondary">Coming Soon</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-4 bg-purple-500/10 rounded-full">
                        <Palette className="h-8 w-8 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          Appearance
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Customize theme and display preferences
                        </p>
                        <Badge variant="secondary">Coming Soon</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
