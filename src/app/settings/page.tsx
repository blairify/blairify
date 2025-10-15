"use client";

import { Cookie, Save } from "lucide-react";
import { useEffect, useState } from "react";
import LoadingPage from "@/components/atoms/loading-page";
import DashboardNavbar from "@/components/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/organisms/dashboard-sidebar";
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

      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const clearAllCookies = () => {
    if (
      confirm(
        "Are you sure you want to clear all cookies? This will reset your preferences.",
      )
    ) {
      const cookies = document.cookie.split(";");
      const essentialCookies = ["auth-token", "session", "csrf"];

      cookies.forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name =
          eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

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

                  // Use the cookie manipulation in a more controlled way
                  try {
                    // biome-ignore lint/suspicious/noDocumentCookie: Legacy cookie clearing requires direct manipulation
                    document.cookie = cookieString;
                  } catch (error) {
                    console.warn(
                      `Failed to clear cookie ${cookieName}:`,
                      error,
                    );
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

      alert("Non-essential cookies have been cleared.");
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-4xl">
            <div className="space-y-6 sm:space-y-8">
              {/* Cookie Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Cookie className="h-5 w-5" />
                    Cookie Settings
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage your cookie preferences for this application.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {/* Essential Cookies */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 py-2">
                    <div className="space-y-1 flex-1">
                      <Label className="text-sm sm:text-base font-medium">
                        Essential Cookies
                      </Label>
                      <p className="text-sm text-muted-foreground pr-2">
                        Required for the website to function properly. Cannot be
                        disabled.
                      </p>
                    </div>
                    <div className="flex items-center justify-start sm:justify-end min-h-[44px]">
                      <Switch
                        checked={cookieSettings.essential}
                        disabled={true}
                        aria-label="Essential cookies (always enabled)"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Analytics Cookies */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 py-2">
                    <div className="space-y-1 flex-1">
                      <Label className="text-sm sm:text-base font-medium">
                        Analytics Cookies
                      </Label>
                      <p className="text-sm text-muted-foreground pr-2">
                        Help us understand how you use our application to
                        improve your experience.
                      </p>
                    </div>
                    <div className="flex items-center justify-start sm:justify-end min-h-[44px]">
                      <Switch
                        checked={cookieSettings.analytics}
                        onCheckedChange={(checked: boolean) =>
                          handleCookieSettingChange("analytics", checked)
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Marketing Cookies */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 py-2">
                    <div className="space-y-1 flex-1">
                      <Label className="text-sm sm:text-base font-medium">
                        Marketing Cookies
                      </Label>
                      <p className="text-sm text-muted-foreground pr-2">
                        Used to show you relevant advertisements and track
                        campaign performance.
                      </p>
                    </div>
                    <div className="flex items-center justify-start sm:justify-end min-h-[44px]">
                      <Switch
                        checked={cookieSettings.marketing}
                        onCheckedChange={(checked: boolean) =>
                          handleCookieSettingChange("marketing", checked)
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Preferences Cookies */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 py-2">
                    <div className="space-y-1 flex-1">
                      <Label className="text-sm sm:text-base font-medium">
                        Preferences Cookies
                      </Label>
                      <p className="text-sm text-muted-foreground pr-2">
                        Remember your settings and preferences for a better
                        experience.
                      </p>
                    </div>
                    <div className="flex items-center justify-start sm:justify-end min-h-[44px]">
                      <Switch
                        checked={cookieSettings.preferences}
                        onCheckedChange={(checked: boolean) =>
                          handleCookieSettingChange("preferences", checked)
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                    <Button
                      onClick={handleSaveSettings}
                      disabled={saving}
                      className="flex items-center gap-2"
                    >
                      {saving ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Settings
                    </Button>

                    <Button
                      variant="outline"
                      onClick={clearAllCookies}
                      className="flex items-center gap-2"
                    >
                      <Cookie className="h-4 w-4" />
                      Clear All Cookies
                    </Button>
                  </div>

                  {/* Cookie Information */}
                  <div className="bg-muted/50 rounded-lg p-4 mt-6">
                    <h4 className="font-medium mb-2">Current Cookie Status</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                      <div>
                        <span className="font-medium">Essential:</span>
                        <span className="ml-2 text-green-600">
                          Always Active
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Analytics:</span>
                        <span
                          className={`ml-2 ${cookieSettings.analytics ? "text-green-600" : "text-red-600"}`}
                        >
                          {cookieSettings.analytics ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Marketing:</span>
                        <span
                          className={`ml-2 ${cookieSettings.marketing ? "text-green-600" : "text-red-600"}`}
                        >
                          {cookieSettings.marketing ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Preferences:</span>
                        <span
                          className={`ml-2 ${cookieSettings.preferences ? "text-green-600" : "text-red-600"}`}
                        >
                          {cookieSettings.preferences ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Settings Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    Additional Settings
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    More settings will be available here in future updates.
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Coming soon: Notification preferences, data export options,
                    and more.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
