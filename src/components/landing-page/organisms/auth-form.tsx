"use client";

import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import LoadingPage from "@/components/common/atoms/loading-page";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useGuestGuard } from "@/hooks/use-auth-guard";
import {
  checkEmailExists,
  registerWithEmailAndPassword,
  requestPasswordReset,
  signInWithEmailAndPassword,
  signInWithGitHub,
  signInWithGoogle,
} from "@/lib/services/auth/auth";

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
}

export default function AuthForm({
  mode = "login",
  onModeChange,
}: AuthFormProps) {
  const router = useRouter();
  const { loading: authLoading } = useGuestGuard();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);
  const [showResetForm, setShowResetForm] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  // Login form data
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Register form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    experience: "",
    howDidYouHear: "",
  });

  const totalSteps = 3;

  // Add state for email validation step
  const [_showEmailValidation, _setShowEmailValidation] = useState(false);

  useEffect(() => {
    if (mode !== currentMode) {
      setIsTransitioning(true);
      setError("");

      // Reset form states when switching modes
      setCurrentStep(1);
      setShowPassword(false);
      setShowConfirmPassword(false);

      // Animate transition
      const timer = setTimeout(() => {
        setCurrentMode(mode);
        setIsTransitioning(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [mode, currentMode]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Show loading while checking auth state
  if (authLoading) {
    return <LoadingPage />;
  }

  const handleEmailValidation = async (email: string) => {
    setIsCheckingEmail(true);
    setError("");

    try {
      const { exists, error } = await checkEmailExists(email);

      if (error) {
        setError("Unable to verify email. Please try again.");
        setIsCheckingEmail(false);
        return;
      }

      if (exists) {
        // Email exists - redirect to login
        if (onModeChange) {
          onModeChange("login");
        }
        setLoginData((prev) => ({ ...prev, email }));
      } else {
        // Email doesn't exist - continue with signup
        setCurrentStep(2); // Move to next step in signup flow
      }
    } catch (_error) {
      setIsCheckingEmail(false);
      setError("Unable to verify email. Please try again.");
    }

    setIsCheckingEmail(false);
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      // Check if email already exists when moving from step 1 (email validation step)
      if (currentStep === 1 && formData.email) {
        await handleEmailValidation(formData.email);
        return;
      }

      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { user, error } = await signInWithEmailAndPassword(
        loginData.email,
        loginData.password,
      );

      if (error) {
        setError(error);
        return;
      }

      if (user) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!loginData.email) {
      setError("Please enter your email address.");
      return;
    }

    setIsResettingPassword(true);
    setError("");
    setResetMessage("");

    try {
      const { error: resetError } = await requestPasswordReset(loginData.email);

      if (resetError) {
        setError(resetError);
        return;
      }

      setResetMessage(
        "If an account exists for this email, we've sent a password reset link.",
      );
    } catch (error) {
      console.error("Password reset failed:", error);
      setError("Unable to send reset email. Please try again.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleRegisterSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Basic validation
      if (
        !formData.name ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        throw new Error("Please fill in all fields");
      }

      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const { user, error } = await registerWithEmailAndPassword(
        formData.email,
        formData.password,
        formData.name,
      );

      if (error) {
        if (
          error.includes("email already exists") ||
          error.includes("EMAIL_EXISTS")
        ) {
          setError(
            "This email is already registered. Please use a different email or try logging in.",
          );
          setCurrentStep(1);
        } else {
          setError(error);
        }
        return;
      }

      if (user) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { user, error } = await signInWithGoogle();

      if (error) {
        setError(error);
        return;
      }

      if (user) {
        router.push("/dashboard");
      }
      if (error) {
        setError(error);
        return;
      }

      if (user) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Google login failed:", error);
      setError("Google login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { user, error } = await signInWithGitHub();

      if (error) {
        setError(error);
        return;
      }

      if (user) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("GitHub login failed:", error);
      setError("GitHub login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSwitch = (newMode: AuthMode) => {
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (currentMode === "login") {
      setLoginData((prev) => ({ ...prev, [field]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return formData.email;
      case 2:
        return formData.name;
      case 3:
        return (
          formData.password &&
          formData.confirmPassword &&
          formData.password === formData.confirmPassword &&
          formData.password.length >= 6
        );
      case 4:
        return formData.role;
      case 5:
        return formData.experience;
      case 6:
        return formData.howDidYouHear;
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    if (currentMode === "login") {
      if (showResetForm) {
        return "Reset your password";
      }
      return "Welcome back";
    }

    switch (currentStep) {
      case 1:
        return "What's your email?";
      case 2:
        return "Tell us your name";
      case 3:
        return "Secure your account";
      case 4:
        return "What's your target role?";
      case 5:
        return "Your experience level";
      case 6:
        return "How did you find us?";
      default:
        return "Create Account";
    }
  };

  const getStepDescription = () => {
    if (currentMode === "login") {
      if (showResetForm) {
        return "Enter your email address to receive a password reset link";
      }
      return "Sign in to continue your interview preparation journey";
    }

    switch (currentStep) {
      case 1:
        return "Enter your email address to get started";
      case 2:
        return "What should we call you?";
      case 3:
        return "Create a strong password for your account";
      case 4:
        return "Select the role you're preparing for";
      case 5:
        return "Help us personalize your experience";
      case 6:
        return "We'd love to know how you discovered us";
      default:
        return "Start your AI-powered interview preparation journey";
    }
  };

  const renderLoginForm = () => {
    if (showResetForm) {
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handlePasswordReset();
          }}
          className="space-y-6 mt-6"
          data-analytics-id="auth-reset-form"
        >
          <div className="space-y-2">
            <Label htmlFor="reset-email">Reset password</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="Enter your email to reset your password"
              value={loginData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              className="bg-input border-border"
              disabled={isLoading || isResettingPassword}
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            className="w-full"
            disabled={isResettingPassword || !loginData.email}
          >
            {isResettingPassword ? "Sending reset link..." : "Send reset link"}
          </Button>
          <button
            type="button"
            className="w-full text-sm text-primary hover:underline disabled:opacity-50"
            onClick={() => {
              setShowResetForm(false);
              setResetMessage("");
              setError("");
            }}
            disabled={isResettingPassword}
          >
            Back to login
          </button>
        </form>
      );
    }

    return (
      <form
        onSubmit={handleLoginSubmit}
        className="space-y-6 mt-6"
        data-analytics-id="auth-login-form"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={loginData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
            className="bg-input border-border"
            disabled={isLoading || isResettingPassword}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={loginData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
              className="bg-input border-border pr-10"
              disabled={isLoading || isResettingPassword}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading || isResettingPassword}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            className="text-sm text-primary hover:underline disabled:opacity-50"
            onClick={() => {
              setShowResetForm(true);
              setResetMessage("");
              setError("");
            }}
            disabled={isLoading || isResettingPassword}
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isLoading || isResettingPassword}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="bg-input border-border"
                disabled={isLoading || isCheckingEmail}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="bg-input border-border"
                disabled={isLoading}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min. 6 characters)"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  required
                  minLength={6}
                  className="bg-input border-border pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                {formData.password &&
                  formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="text-sm text-red-500">
                      Passwords do not match
                    </p>
                  )}
              </div>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  required
                  className="bg-input border-border pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "frontend", label: "Frontend Engineer" },
                  { value: "backend", label: "Backend Engineer" },
                  { value: "fullstack", label: "Full Stack Engineer" },
                  { value: "devops", label: "DevOps Engineer" },
                  { value: "mobile", label: "Mobile Developer" },
                  { value: "data", label: "Data Engineer" },
                  { value: "product", label: "Product Manager" },
                  { value: "design", label: "UI/UX Designer" },
                ].map((role) => (
                  <button
                    key={role.value}
                    className={`cursor-pointer p-2 transition-all duration-200 border-2 text-center rounded-md hover:shadow-md ${
                      formData.role === role.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleInputChange("role", role.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleInputChange("role", role.value);
                      }
                    }}
                    type="button"
                    tabIndex={0}
                    aria-label={`Select ${role.label} as your target role`}
                  >
                    <p className="text-sm font-medium">{role.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "entry", label: "Entry Level" },
                  { value: "mid", label: "Middle" },
                  { value: "junior", label: "Junior" },
                  { value: "senior", label: "Senior" },
                ].map((exp) => (
                  <button
                    key={exp.value}
                    className={`cursor-pointer transition-all rounded-md duration-200 border-2 hover:shadow-md ${
                      formData.experience === exp.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleInputChange("experience", exp.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleInputChange("experience", exp.value);
                      }
                    }}
                    type="button"
                    tabIndex={0}
                    aria-label={`Select ${exp.label} experience level`}
                  >
                    <div className="px-2 py-1">
                      <p className="text-sm font-medium">{exp.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "search", label: "Google Search" },
                  { value: "social", label: "Social Media" },
                  { value: "linkedin", label: "LinkedIn" },
                  { value: "twitter", label: "Twitter/X" },
                  { value: "youtube", label: "YouTube" },
                  { value: "reddit", label: "Reddit" },
                  { value: "hackernews", label: "Hacker News" },
                  { value: "friend", label: "Friend/Colleague" },
                  { value: "blog", label: "Blog/Article" },
                  { value: "podcast", label: "Podcast" },
                  { value: "newsletter", label: "Newsletter" },
                  { value: "ad", label: "Advertisement" },
                  { value: "github", label: "GitHub" },
                  { value: "producthunt", label: "Product Hunt" },
                  { value: "other", label: "Other" },
                ].map((source) => (
                  <button
                    key={source.value}
                    className={`cursor-pointer transition-all rounded-md duration-200 border-2 hover:shadow-md ${
                      formData.howDidYouHear === source.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() =>
                      handleInputChange("howDidYouHear", source.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleInputChange("howDidYouHear", source.value);
                      }
                    }}
                    type="button"
                    tabIndex={0}
                    aria-label={`Select ${source.label} as how you found us`}
                  >
                    <div className="px-2 py-1">
                      <p className="text-sm font-medium">{source.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSocialButtons = () => (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-center">
      <Button
        type="button"
        variant="outline"
        className="flex items-center justify-center max-w-xs bg-transparent border border-border text-foreground hover:bg-accent/10 hover:text-foreground transition-colors"
        onClick={handleGithubLogin}
        disabled={isLoading}
      >
        <FaGithub className="mr-2" />
        GitHub
      </Button>
      <Button
        type="button"
        variant="outline"
        className="flex items-center justify-center max-w-xs bg-transparent border border-border text-foreground hover:bg-accent/10 hover:text-foreground transition-colors"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        <FaGoogle className="mr-2" />
        Google
      </Button>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-background flex flex-col items-center justify-center p-4"
      data-analytics-id="auth-shell"
    >
      <div className="w-full max-w-5xl">
        {isMobile ? (
          <Card className="w-full rounded-3xl border border-[color:var(--border)]/60 bg-[color:var(--card)]/95 shadow-2xl backdrop-blur">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs text-muted-foreground hover:text-foreground md:hidden"
                >
                  <Link href="/">
                    <span aria-hidden="true">←</span> Back to home
                  </Link>
                </Button>
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Blairify
                </span>
              </div>
              <div
                className={`text-center transition-all duration-500 ease-in-out ${
                  isTransitioning
                    ? "opacity-0 transform translate-y-2 scale-95"
                    : "opacity-100 transform translate-y-0 scale-100"
                }`}
              >
                <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
                <CardDescription className="text-sm">
                  {getStepDescription()}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="min-h-[420px] space-y-4">
              {error && (
                <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  {error}
                </div>
              )}
              {resetMessage && (
                <div className="mb-4 p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">
                  {resetMessage}
                </div>
              )}

              <div className="relative overflow-hidden">
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    isTransitioning
                      ? "opacity-0 transform translate-x-4 scale-95"
                      : "opacity-100 transform translate-x-0 scale-100"
                  }`}
                >
                  {currentMode === "login" ? (
                    showResetForm ? (
                      renderLoginForm()
                    ) : (
                      <>
                        {renderSocialButtons()}

                        <div className="relative mt-6">
                          <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                              Or continue with email
                            </span>
                          </div>
                        </div>

                        {renderLoginForm()}
                      </>
                    )
                  ) : (
                    <>
                      <div className="overflow-hidden">
                        <div
                          className="flex transition-transform duration-300 ease-in-out"
                          style={{
                            transform: `translateX(-${(currentStep - 1) * 100}%)`,
                          }}
                        >
                          {[...Array(totalSteps)].map((_, index) => (
                            <div
                              key={`content-${index + 1}`}
                              className="w-full flex-shrink-0"
                            >
                              {currentStep === index + 1 && renderStepContent()}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={
                            currentStep === 1 || isLoading || isCheckingEmail
                          }
                          className="bg-transparent border border-border text-foreground hover:bg-accent/10 hover:text-foreground transition-colors"
                        >
                          Previous
                        </Button>

                        {currentStep === totalSteps ? (
                          <Button
                            onClick={handleRegisterSubmit}
                            disabled={!canProceedToNextStep() || isLoading}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            {isLoading
                              ? "Creating Account..."
                              : "Create Account"}
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={handleNext}
                            disabled={
                              !canProceedToNextStep() ||
                              isLoading ||
                              isCheckingEmail
                            }
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            Next
                          </Button>
                        )}
                      </div>

                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">
                            Or sign up with
                          </span>
                        </div>
                      </div>
                      <div className="my-6">{renderSocialButtons()}</div>
                    </>
                  )}
                </div>
              </div>

              <div className="text-center">
                <p
                  className={`text-sm text-muted-foreground ${currentMode === "login" ? "mt-4" : "mt-0"}`}
                >
                  {currentMode === "login" && !showResetForm && (
                    <>
                      Don't have an account?{" "}
                      {onModeChange ? (
                        <button
                          type="button"
                          onClick={() => handleModeSwitch("register")}
                          className="text-primary hover:underline focus:outline-none focus:underline transition-colors duration-200"
                          disabled={isLoading || isTransitioning}
                        >
                          Sign up
                        </button>
                      ) : (
                        <Button
                          onClick={() => handleModeSwitch("register")}
                          className="bg-transparent p-0 text-primary hover:underline hover:bg-transparent"
                        >
                          Sign up
                        </Button>
                      )}
                    </>
                  )}

                  {currentMode === "register" && !showResetForm && (
                    <>
                      Already have an account?{" "}
                      {onModeChange ? (
                        <button
                          type="button"
                          onClick={() => handleModeSwitch("login")}
                          className="text-primary hover:underline focus:outline-none focus:underline transition-colors duration-200"
                          disabled={isLoading || isTransitioning}
                        >
                          Log In
                        </button>
                      ) : (
                        <Button
                          onClick={() => handleModeSwitch("login")}
                          className="bg-transparent p-0 text-primary hover:underline hover:bg-transparent"
                        >
                          Log In
                        </Button>
                      )}
                    </>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="w-full grid md:grid-cols-2 rounded-3xl overflow-hidden border border-[color:var(--border)]/60 shadow-2xl">
            <div className="hidden md:flex flex-col items-center justify-center bg-[hsl(var(--blairify-bg-200))] text-[color:var(--foreground)] relative min-h-[32rem]">
              <div className="relative w-40 h-40 sm:w-56 sm:h-56">
                <Image
                  src="/icon0.svg"
                  alt="Blairify logo"
                  fill
                  priority
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            <div className="w-full bg-card p-6 sm:p-10 flex flex-col justify-center min-h-[32rem]">
              <div className="flex justify-end mb-4">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Link href="/">
                    <span aria-hidden="true">←</span> Back to home
                  </Link>
                </Button>
              </div>
              <div
                className={`text-center transition-all duration-500 ease-in-out ${
                  isTransitioning
                    ? "opacity-0 transform translate-y-2 scale-95"
                    : "opacity-100 transform translate-y-0 scale-100"
                }`}
              >
                <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">
                  {getStepTitle()}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {getStepDescription()}
                </p>
              </div>

              <div className="mt-6 flex-1 flex flex-col">
                {error && (
                  <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                    {error}
                  </div>
                )}
                {resetMessage && (
                  <div className="mb-4 p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">
                    {resetMessage}
                  </div>
                )}

                <div className="relative overflow-hidden flex-1">
                  <div
                    className={`transition-all duration-500 ease-in-out ${
                      isTransitioning
                        ? "opacity-0 transform translate-x-4 scale-95"
                        : "opacity-100 transform translate-x-0 scale-100"
                    }`}
                  >
                    {currentMode === "login" ? (
                      showResetForm ? (
                        renderLoginForm()
                      ) : (
                        <>
                          {renderSocialButtons()}

                          <div className="relative mt-6">
                            <div className="absolute inset-0 flex items-center">
                              <Separator className="w-full" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-card px-2 text-muted-foreground">
                                Or continue with email
                              </span>
                            </div>
                          </div>

                          {renderLoginForm()}
                        </>
                      )
                    ) : (
                      <>
                        <div className="overflow-hidden">
                          <div
                            className="flex transition-transform duration-300 ease-in-out"
                            style={{
                              transform: `translateX(-${(currentStep - 1) * 100}%)`,
                            }}
                          >
                            {[...Array(totalSteps)].map((_, index) => (
                              <div
                                key={`content-${index + 1}`}
                                className="w-full flex-shrink-0"
                              >
                                {currentStep === index + 1 &&
                                  renderStepContent()}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between mt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={
                              currentStep === 1 || isLoading || isCheckingEmail
                            }
                            className="bg-transparent border border-border text-foreground hover:bg-accent/10 hover:text-foreground transition-colors"
                          >
                            Previous
                          </Button>

                          {currentStep === totalSteps ? (
                            <Button
                              onClick={handleRegisterSubmit}
                              disabled={!canProceedToNextStep() || isLoading}
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              {isLoading
                                ? "Creating Account..."
                                : "Create Account"}
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={handleNext}
                              disabled={
                                !canProceedToNextStep() ||
                                isLoading ||
                                isCheckingEmail
                              }
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              Next
                            </Button>
                          )}
                        </div>

                        <div className="relative my-6">
                          <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                              Or sign up with
                            </span>
                          </div>
                        </div>
                        <div className="my-6">{renderSocialButtons()}</div>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-center mt-6">
                  <p
                    className={`text-sm text-muted-foreground ${currentMode === "login" ? "mt-4" : "mt-0"}`}
                  >
                    {currentMode === "login" && !showResetForm && (
                      <>
                        Don't have an account?{" "}
                        {onModeChange ? (
                          <button
                            type="button"
                            onClick={() => handleModeSwitch("register")}
                            className="text-primary hover:underline focus:outline-none focus:underline transition-colors duration-200"
                            disabled={isLoading || isTransitioning}
                          >
                            Sign up
                          </button>
                        ) : (
                          <Button
                            onClick={() => handleModeSwitch("register")}
                            className="bg-transparent p-0 text-primary hover:underline hover:bg-transparent"
                          >
                            Sign up
                          </Button>
                        )}
                      </>
                    )}

                    {currentMode === "register" && (
                      <>
                        Already have an account?{" "}
                        {onModeChange ? (
                          <button
                            type="button"
                            onClick={() => handleModeSwitch("login")}
                            className="text-primary hover:underline focus:outline-none focus:underline transition-colors duration-200"
                            disabled={isLoading || isTransitioning}
                          >
                            Log In
                          </button>
                        ) : (
                          <Button
                            onClick={() => handleModeSwitch("login")}
                            className="bg-transparent p-0 text-primary hover:underline hover:bg-transparent"
                          >
                            Log In
                          </Button>
                        )}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
