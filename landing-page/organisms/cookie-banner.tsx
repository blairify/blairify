"use client";

import { Timestamp } from "firebase/firestore";
import { Cookie, Settings, Shield, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatabaseService } from "@/lib/database";
import { useAuth } from "@/providers/auth-provider";

declare global {
  function gtag(
    command: string,
    targetId: string,
    config?: Record<string, unknown>,
  ): void;
  function gtag(
    command: "event",
    action: string,
    parameters?: Record<string, unknown>,
  ): void;
  function gtag(
    command: "config",
    targetId: string,
    config?: Record<string, unknown>,
  ): void;
  function gtag(
    command: "consent",
    type: "default" | "update",
    parameters: Record<string, unknown>,
  ): void;
}

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

interface CookieConsent {
  hasConsented: boolean;
  consentDate: Date;
  preferences: CookiePreferences;
  version: string;
}

const COOKIE_CONSENT_VERSION = "1.0";
const COOKIE_NAME = "Blairify-cookie-consent";

export const CookieBanner = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: false,
  });

  const checkConsentStatus = useCallback(async () => {
    try {
      const localConsent = localStorage.getItem(COOKIE_NAME);
      if (localConsent) {
        const consent: CookieConsent = JSON.parse(localConsent);

        if (
          consent.version === COOKIE_CONSENT_VERSION &&
          consent.hasConsented
        ) {
          setShowBanner(false);
          setShowFloatingButton(true);
          setPreferences(consent.preferences);
          return;
        }
      }

      if (user?.uid) {
        const profile = await DatabaseService.getUserProfile(user.uid);
        if (profile?.cookieConsent) {
          const dbConsent = profile.cookieConsent;

          if (
            dbConsent.version === COOKIE_CONSENT_VERSION &&
            dbConsent.hasConsented
          ) {
            const localConsent: CookieConsent = {
              hasConsented: dbConsent.hasConsented,
              consentDate: dbConsent.consentDate.toDate(),
              preferences: dbConsent.preferences,
              version: dbConsent.version,
            };
            localStorage.setItem(COOKIE_NAME, JSON.stringify(localConsent));
            setShowBanner(false);
            setShowFloatingButton(true);
            setPreferences(dbConsent.preferences);
            return;
          }
        }
      }

      setShowBanner(true);
    } catch (error) {
      console.error("Error checking consent status:", error);
      // Show banner on error to be safe
      setShowBanner(true);
    }
  }, [user?.uid]);

  // Initialize on mount
  useEffect(() => {
    // Small delay to avoid flash
    const timer = setTimeout(() => {
      checkConsentStatus();
    }, 500);

    return () => clearTimeout(timer);
  }, [checkConsentStatus]);

  // Save consent to both localStorage and database
  const saveConsent = async (
    consentGiven: boolean,
    userPreferences?: CookiePreferences,
  ) => {
    setLoading(true);

    try {
      const finalPreferences = consentGiven
        ? userPreferences || preferences
        : {
            necessary: true,
            analytics: false,
            marketing: false,
            personalization: false,
          };

      const consent: CookieConsent = {
        hasConsented: consentGiven,
        consentDate: new Date(),
        preferences: finalPreferences,
        version: COOKIE_CONSENT_VERSION,
      };

      localStorage.setItem(COOKIE_NAME, JSON.stringify(consent));

      if (user?.uid) {
        const dbConsent = {
          hasConsented: consentGiven,
          consentDate: Timestamp.fromDate(new Date()),
          preferences: finalPreferences,
          version: COOKIE_CONSENT_VERSION,
        };

        await DatabaseService.updateUserProfile(user.uid, {
          cookieConsent: dbConsent,
          gdprData: {
            cookieConsentGiven: consentGiven,
            cookieConsentDate: Timestamp.fromDate(new Date()),
            cookiePreferences: finalPreferences,
            consentVersion: COOKIE_CONSENT_VERSION,
            lastUpdated: Timestamp.fromDate(new Date()),
          },
        });
      }

      applyCookiePreferences(finalPreferences);

      setShowBanner(false);
      setShowFloatingButton(true);
    } catch (error) {
      console.error("Error saving cookie consent:", error);
      const consent: CookieConsent = {
        hasConsented: consentGiven,
        consentDate: new Date(),
        preferences: consentGiven
          ? preferences
          : {
              necessary: true,
              analytics: false,
              marketing: false,
              personalization: false,
            },
        version: COOKIE_CONSENT_VERSION,
      };
      localStorage.setItem(COOKIE_NAME, JSON.stringify(consent));
      setShowBanner(false);
      setShowFloatingButton(true);
    } finally {
      setLoading(false);
    }
  };

  // Apply cookie preferences to tracking scripts
  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // Google Analytics
    if (prefs.analytics) {
      // Enable GA tracking
      if (typeof gtag !== "undefined") {
        gtag("consent", "update", {
          analytics_storage: "granted",
        });
      }
    } else {
      // Disable GA tracking
      if (typeof gtag !== "undefined") {
        gtag("consent", "update", {
          analytics_storage: "denied",
        });
      }
    }

    if (prefs.marketing) {
      // Enable marketing tracking
    } else {
      // Disable marketing tracking
    }

    // Personalization cookies
    if (prefs.personalization) {
      // Enable personalization features
    } else {
      // Disable personalization features
    }
  };

  const handleAcceptAll = () => {
    const allPreferences: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
    };
    saveConsent(true, allPreferences);
  };

  const handleRejectAll = () => {
    saveConsent(false);
  };

  const handleCustomize = () => {
    setShowDetails(true);
  };

  const handleSaveCustom = () => {
    saveConsent(true, preferences);
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === "necessary") return; // Cannot disable necessary cookies
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const openCookieSettings = () => {
    setShowBanner(true);
    setShowDetails(false);
  };

  const isConfigureFlow = pathname?.startsWith("/configure");

  // Render floating cookie button when banner is hidden but user has consented
  if (!showBanner && showFloatingButton && !isConfigureFlow) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={openCookieSettings}
          variant="outline"
          size="icon"
          aria-label="Cookie Settings"
          className="size-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-background/95 backdrop-blur-sm border-2"
          title="Cookie Settings"
        >
          <Cookie className="size-5" />
        </Button>
      </div>
    );
  }

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none animate-in slide-in-from-bottom duration-300">
      <Card className="max-w-4xl mx-auto p-6 shadow-2xl border-border/50 backdrop-blur-md bg-background/95 pointer-events-auto">
        {!showDetails ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Cookie className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <Typography.Heading3 className="mb-2">
                    We value your privacy
                  </Typography.Heading3>
                  <p className="text-sm text-muted-foreground">
                    Blairify uses cookies to enhance your experience
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Close Cookie Banner"
                onClick={handleRejectAll}
                className="text-muted-foreground hover:text-foreground flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                We use cookies to provide essential functionality, analyze usage
                patterns, and personalize your interview preparation experience.
                By continuing to use our service, you agree to our use of
                cookies as described in our{" "}
                <a
                  href="/privacy"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
                .
              </p>
              <p>
                <strong>Essential cookies</strong> are required for the website
                to function. Other cookies help us improve your experience and
                are optional.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                aria-label="Accept All Cookies"
                onClick={handleAcceptAll}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                {loading ? "Saving..." : "Accept All"}
              </Button>
              <Button
                variant="outline"
                aria-label="Customize Cookies"
                onClick={handleCustomize}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </Button>
              <Button
                variant="outline"
                aria-label="Reject Optional Cookies"
                onClick={handleRejectAll}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                Reject Optional
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <Typography.Heading3 className="mb-2">
                  Cookie Preferences
                </Typography.Heading3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Essential Cookies</h4>
                  <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900 dark:text-green-200">
                    Always On
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Required for basic website functionality, authentication, and
                  security. These cannot be disabled.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Analytics Cookies</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        updatePreference("analytics", e.target.checked)
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition-colors ${
                        preferences.analytics ? "bg-primary" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`size-5 bg-white rounded-full shadow transition-transform transform ${
                          preferences.analytics
                            ? "translate-x-5"
                            : "translate-x-0"
                        } mt-0.5 ml-0.5`}
                      />
                    </div>
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Help us understand how visitors interact with our website by
                  collecting anonymous usage data and performance metrics.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Marketing Cookies</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) =>
                        updatePreference("marketing", e.target.checked)
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition-colors ${
                        preferences.marketing ? "bg-primary" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`size-5 bg-white rounded-full shadow transition-transform transform ${
                          preferences.marketing
                            ? "translate-x-5"
                            : "translate-x-0"
                        } mt-0.5 ml-0.5`}
                      />
                    </div>
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Used to deliver relevant advertisements and track the
                  effectiveness of marketing campaigns across websites.
                </p>
              </div>

              {/* Personalization Cookies */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Personalization Cookies</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.personalization}
                      onChange={(e) =>
                        updatePreference("personalization", e.target.checked)
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition-colors ${
                        preferences.personalization
                          ? "bg-primary"
                          : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`size-5 bg-white rounded-full shadow transition-transform transform ${
                          preferences.personalization
                            ? "translate-x-5"
                            : "translate-x-0"
                        } mt-0.5 ml-0.5`}
                      />
                    </div>
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Remember your preferences and settings to provide a more
                  personalized interview preparation experience.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                onClick={handleSaveCustom}
                disabled={loading}
                aria-label="Save Cookie Preferences"
                className="flex-1 sm:flex-none"
              >
                {loading ? "Saving..." : "Save Preferences"}
              </Button>
              <Button
                variant="outline"
                onClick={handleAcceptAll}
                disabled={loading}
                aria-label="Accept All Cookies"
                className="flex-1 sm:flex-none"
              >
                Accept All
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowDetails(false)}
                disabled={loading}
                aria-label="Back to Cookie Banner"
                className="flex-1 sm:flex-none"
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CookieBanner;
