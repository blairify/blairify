"use client";

import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { FaGithub, FaGoogle, FaUserGraduate } from "react-icons/fa6";
import LoadingPage from "@/components/common/atoms/loading-page";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
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
import { safeRedirect } from "@/lib/utils/safe-redirect";

type AuthMode = "login" | "register" | "student-register";

type StudentStep = "email" | "code" | "details";

interface AuthFormProps {
  mode: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
  audience?: "individual" | "enterprise";
  onAudienceChange?: (audience: "individual" | "enterprise") => void;
  redirect?: string | null;
}

export default function AuthForm({
  mode = "login",
  onModeChange,
  audience: _audience,
  onAudienceChange,
  redirect,
}: AuthFormProps) {
  const router = useRouter();
  const postAuthDestination = safeRedirect(redirect ?? null, "/onboarding");
  const guardDestination = safeRedirect(redirect ?? null, "/dashboard");
  const { loading: authLoading } = useGuestGuard(guardDestination);
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

  const [studentStep, setStudentStep] = useState<StudentStep>("email");
  const [studentSubMode, setStudentSubMode] = useState<"register" | "login">(
    "register",
  );
  const [studentData, setStudentData] = useState({
    email: "",
    code: "",
    displayName: "",
    password: "",
    confirmPassword: "",
  });
  const [studentError, setStudentError] = useState("");
  const [isStudentLoading, setIsStudentLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const totalSteps = 4;

  const [agreements, setAgreements] = useState({
    termsOfService: false,
    privacyPolicy: false,
    marketingEmails: false,
  });

  const [_showEmailValidation, _setShowEmailValidation] = useState(false);

  useEffect(() => {
    if (mode !== currentMode) {
      setIsTransitioning(true);
      setError("");

      setCurrentStep(1);
      setShowPassword(false);
      setShowConfirmPassword(false);

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
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleStudentVerifyCode = useCallback(async () => {
    setStudentError("");
    setIsStudentLoading(true);
    try {
      const res = await fetch("/api/student/validate-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: studentData.email,
          code: studentData.code,
        }),
      });
      const data = (await res.json()) as { error?: string; valid?: boolean };
      if (!res.ok || !data.valid) {
        setStudentError(
          data.error ?? "Invalid verification code. Please try again.",
        );
        setStudentData((p) => ({ ...p, code: "" }));
        return;
      }
      setStudentStep("details");
    } catch {
      setStudentError("Network error. Please try again.");
    } finally {
      setIsStudentLoading(false);
    }
  }, [studentData.email, studentData.code]);

  useEffect(() => {
    if (studentStep === "code" && studentData.code.length === 6) {
      handleStudentVerifyCode();
    }
  }, [studentData.code, studentStep, handleStudentVerifyCode]);

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
        if (onModeChange) {
          onModeChange("login");
        }
        setLoginData((prev) => ({ ...prev, email }));
      } else {
        setCurrentStep(2);
      }
    } catch (_error) {
      setIsCheckingEmail(false);
      setError("Unable to verify email. Please try again.");
    }

    setIsCheckingEmail(false);
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      if (currentStep === 1 && formData.email) {
        await handleEmailValidation(formData.email);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
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
      const domain = loginData.email.split("@")[1]?.toLowerCase() ?? "";
      if (domain) {
        const checkRes = await fetch("/api/student/check-domain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain }),
        });
        if (checkRes.ok) {
          const { isUniversity } = (await checkRes.json()) as {
            isUniversity: boolean;
          };
          if (isUniversity) {
            setError("");
            setStudentData((p) => ({
              ...p,
              email: loginData.email,
              password: loginData.password,
            }));
            setStudentSubMode("login");
            setStudentStep("email");
            handleModeSwitch("student-register");
            return;
          }
        }
      }

      const { user, error } = await signInWithEmailAndPassword(
        loginData.email,
        loginData.password,
      );

      if (error) {
        setError(error);
        return;
      }

      if (user) {
        router.push(postAuthDestination);
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
        router.push(postAuthDestination);
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
        router.push(postAuthDestination);
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
        router.push(postAuthDestination);
      }
    } catch (error) {
      console.error("GitHub login failed:", error);
      setError("GitHub login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSwitch = (newMode: AuthMode) => {
    if (newMode !== currentMode) {
      setStudentStep("email");
      setStudentSubMode("register");
      setStudentData({
        email: "",
        code: "",
        displayName: "",
        password: "",
        confirmPassword: "",
      });
      setStudentError("");
    }
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const handleStudentSendOtp = async (email: string) => {
    setIsStudentLoading(true);
    setStudentError("");
    try {
      const res = await fetch("/api/student/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as {
        error?: string;
        retryAfterMs?: number;
      };
      if (!res.ok) {
        setStudentError(data.error ?? "Failed to send code.");
        return;
      }
      setStudentStep("code");
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setStudentError("Network error. Please try again.");
    } finally {
      setIsStudentLoading(false);
    }
  };

  const handleStudentRegister = async () => {
    if (!studentData.displayName.trim()) {
      setStudentError("Please enter your name.");
      return;
    }
    if (studentData.password.length < 6) {
      setStudentError("Password must be at least 6 characters.");
      return;
    }
    if (studentData.password !== studentData.confirmPassword) {
      setStudentError("Passwords do not match.");
      return;
    }
    setIsStudentLoading(true);
    setStudentError("");
    try {
      const res = await fetch("/api/student/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: studentData.email,
          code: studentData.code,
          displayName: studentData.displayName,
          password: studentData.password,
        }),
      });
      const data = (await res.json()) as { error?: string; uid?: string };
      if (!res.ok) {
        setStudentError(data.error ?? "Registration failed.");
        return;
      }
      await signInWithEmailAndPassword(studentData.email, studentData.password);
      router.push(postAuthDestination);
    } catch {
      setStudentError("Network error. Please try again.");
    } finally {
      setIsStudentLoading(false);
    }
  };

  const renderStudentForm = () => {
    switch (studentStep) {
      case "email":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-email">University email</Label>
              <Input
                id="student-email"
                type="email"
                placeholder="your@university.edu"
                value={studentData.email}
                onChange={(e) =>
                  setStudentData((p) => ({ ...p, email: e.target.value }))
                }
                disabled={isStudentLoading}
                className="bg-input border-gray-300"
              />
            </div>

            {studentSubMode === "login" && (
              <div className="space-y-2">
                <Label htmlFor="student-login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="student-login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={studentData.password}
                    onChange={(e) =>
                      setStudentData((p) => ({
                        ...p,
                        password: e.target.value,
                      }))
                    }
                    disabled={isStudentLoading}
                    className="bg-input border-gray-300 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 size-9 p-0 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4 text-muted-foreground" />
                    ) : (
                      <Eye className="size-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {studentError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {studentError}
              </div>
            )}

            {studentSubMode === "register" ? (
              <Button
                type="button"
                className="w-full"
                disabled={isStudentLoading || !studentData.email}
                onClick={() => handleStudentSendOtp(studentData.email)}
              >
                {isStudentLoading ? "Sending code…" : "Send verification code"}
              </Button>
            ) : (
              <Button
                type="button"
                className="w-full"
                disabled={
                  isStudentLoading ||
                  !studentData.email ||
                  !studentData.password
                }
                onClick={async () => {
                  setIsStudentLoading(true);
                  setStudentError("");
                  try {
                    const { user, error } = await signInWithEmailAndPassword(
                      studentData.email,
                      studentData.password,
                    );
                    if (error) {
                      setStudentError(error);
                      return;
                    }
                    if (user) {
                      router.push(postAuthDestination);
                    }
                  } catch {
                    setStudentError("Invalid email or password.");
                  } finally {
                    setIsStudentLoading(false);
                  }
                }}
              >
                {isStudentLoading ? "Logging in…" : "Log In"}
              </Button>
            )}

            <Typography.Caption color="secondary" className="text-center block">
              {studentSubMode === "register" ? (
                <>
                  Already have a university account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setStudentSubMode("login");
                      setStudentError("");
                    }}
                    className="text-primary hover:underline focus:outline-none focus:underline transition-colors duration-200"
                  >
                    Log in
                  </button>
                </>
              ) : (
                <>
                  New student?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setStudentSubMode("register");
                      setStudentError("");
                    }}
                    className="text-primary hover:underline focus:outline-none focus:underline transition-colors duration-200"
                  >
                    Register here
                  </button>
                </>
              )}
            </Typography.Caption>
          </div>
        );

      case "code":
        return (
          <div className="space-y-4 mx-auto">
            <div className="space-y-2 flex justify-center gap-1 items-center">
              <InputOTP
                maxLength={6}
                value={studentData.code}
                onValueChange={(value) =>
                  setStudentData((p) => ({ ...p, code: value }))
                }
                disabled={isStudentLoading}
              >
                <InputOTPGroup className="flex gap-1 py-1">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {studentError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {studentError}
              </div>
            )}
            <button
              type="button"
              disabled={resendCooldown > 0 || isStudentLoading}
              onClick={() => handleStudentSendOtp(studentData.email)}
              className="w-full text-sm text-muted-foreground hover:underline disabled:opacity-50"
            >
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : "Resend code"}
            </button>
          </div>
        );

      case "details":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-name">Full name</Label>
              <Input
                id="student-name"
                type="text"
                placeholder="Your full name"
                value={studentData.displayName}
                onChange={(e) =>
                  setStudentData((p) => ({ ...p, displayName: e.target.value }))
                }
                disabled={isStudentLoading}
                className="bg-input border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-password">Password</Label>
              <div className="relative">
                <Input
                  id="student-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={studentData.password}
                  onChange={(e) =>
                    setStudentData((p) => ({ ...p, password: e.target.value }))
                  }
                  disabled={isStudentLoading}
                  className="bg-input border-gray-300 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 size-9 p-0 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-4 text-muted-foreground" />
                  ) : (
                    <Eye className="size-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="student-confirm-password">
                  Confirm password
                </Label>
                {studentData.password &&
                  studentData.confirmPassword &&
                  studentData.password !== studentData.confirmPassword && (
                    <Typography.Caption color="error">
                      Passwords do not match
                    </Typography.Caption>
                  )}
              </div>
              <div className="relative">
                <Input
                  id="student-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={studentData.confirmPassword}
                  onChange={(e) =>
                    setStudentData((p) => ({
                      ...p,
                      confirmPassword: e.target.value,
                    }))
                  }
                  disabled={isStudentLoading}
                  className="bg-input border-gray-300 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 size-9 p-0 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4 text-muted-foreground" />
                  ) : (
                    <Eye className="size-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            {studentError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {studentError}
              </div>
            )}
            <Button
              type="button"
              className="w-full"
              disabled={
                isStudentLoading ||
                !studentData.displayName.trim() ||
                studentData.password.length < 6 ||
                studentData.password !== studentData.confirmPassword
              }
              onClick={handleStudentRegister}
            >
              {isStudentLoading
                ? "Creating account…"
                : "Create student account"}
            </Button>
          </div>
        );

      default: {
        const _never: never = studentStep;
        throw new Error(`Unhandled student step: ${_never}`);
      }
    }
  };

  const getStudentStepTitle = () => {
    if (studentStep === "email")
      return studentSubMode === "login"
        ? "Student login"
        : "Student registration";
    switch (studentStep) {
      case "code":
        return "Check your inbox";
      case "details":
        return "Almost there";
    }
  };

  const getStudentStepDescription = () => {
    if (studentStep === "email")
      return studentSubMode === "login"
        ? "Log in with your university email"
        : "Enter your university email to get a free student plan";
    switch (studentStep) {
      case "code":
        return "Enter the 6-digit code we sent to your university email";
      case "details":
        return "Set your name and password to complete registration";
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
        return agreements.termsOfService && agreements.privacyPolicy;
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    if (currentMode === "student-register") return getStudentStepTitle();
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
        return "What's your name?";
      case 3:
        return "Create a password";
      case 4:
        return "Agreements";
      default:
        return "Create Account";
    }
  };

  const getStepDescription = () => {
    if (currentMode === "student-register") return getStudentStepDescription();
    if (currentMode === "login") {
      if (showResetForm) {
        return "Enter your email address to receive a password reset link";
      }
      return "";
    }

    switch (currentStep) {
      case 1:
        return "";
      case 2:
        return "We'll use this as your display name";
      case 3:
        return "Make it strong and secure";
      case 4:
        return "Review and accept our terms";
      default:
        return "";
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
          className="space-y-4 mt-4"
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
              className="bg-input border-gray-300"
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
        className="space-y-4 mt-4"
        data-analytics-id="auth-login-form"
      >
        <div className="space-y-2 px-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={loginData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
            className="bg-input border-gray-300"
            disabled={isLoading || isResettingPassword}
          />
        </div>

        <div className="space-y-2 px-1">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={loginData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
              className="bg-input border-gray-300 pr-10"
              disabled={isLoading || isResettingPassword}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 size-9 p-0 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading || isResettingPassword}
            >
              {showPassword ? (
                <EyeOff className="size-4 text-muted-foreground" />
              ) : (
                <Eye className="size-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline disabled:opacity-50"
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
            <div className="space-y-2 p-1">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="bg-input border-gray-300"
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
                className="bg-input border-gray-300"
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
                  className="bg-input border-gray-300 pr-10"
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
                    <Typography.Caption color="error">
                      Passwords do not match
                    </Typography.Caption>
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
                  className="bg-input border-gray-300 pr-10"
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
            <Typography.Body color="secondary" className="text-sm">
              Please review and accept the following agreements to continue.
            </Typography.Body>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="termsOfService"
                  checked={agreements.termsOfService}
                  onCheckedChange={(checked) =>
                    setAgreements({
                      ...agreements,
                      termsOfService: checked === true,
                    })
                  }
                  disabled={isLoading}
                />
                <label
                  htmlFor="termsOfService"
                  className="text-sm leading-tight cursor-pointer"
                >
                  <Typography.Caption>
                    I agree to the{" "}
                    <Link
                      href="/legal/terms"
                      className="underline hover:text-foreground"
                    >
                      Terms of Service
                    </Link>{" "}
                    <span className="text-red-500">*</span>
                  </Typography.Caption>
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="privacyPolicy"
                  checked={agreements.privacyPolicy}
                  onCheckedChange={(checked) =>
                    setAgreements({
                      ...agreements,
                      privacyPolicy: checked === true,
                    })
                  }
                  disabled={isLoading}
                />
                <label
                  htmlFor="privacyPolicy"
                  className="text-sm leading-tight cursor-pointer"
                >
                  <Typography.Caption>
                    I have read and agree to the{" "}
                    <Link
                      href="/legal/privacy"
                      className="underline hover:text-foreground"
                    >
                      Privacy Policy
                    </Link>{" "}
                    <span className="text-red-500">*</span>
                  </Typography.Caption>
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="marketingEmails"
                  checked={agreements.marketingEmails}
                  onCheckedChange={(checked) =>
                    setAgreements({
                      ...agreements,
                      marketingEmails: checked === true,
                    })
                  }
                  disabled={isLoading}
                />
                <label
                  htmlFor="marketingEmails"
                  className="text-sm leading-tight cursor-pointer"
                >
                  <Typography.Caption>
                    I would like to receive marketing emails about product
                    updates, tips, and promotions
                  </Typography.Caption>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSocialButtons = () => (
    <div className="flex flex-row items-stretch sm:items-center gap-3 sm:gap-4 justify-center">
      <Button
        type="button"
        variant="outline"
        className="flex flex-1 min-w-0 items-center justify-center bg-transparent border border-border text-foreground hover:bg-accent/10 hover:text-foreground transition-colors h-10 sm:h-9"
        onClick={handleGithubLogin}
        disabled={isLoading}
      >
        <FaGithub className="mr-2 flex-shrink-0" />
        GitHub
      </Button>
      <Button
        type="button"
        variant="outline"
        className="flex flex-1 min-w-0 items-center justify-center bg-transparent border border-border text-foreground hover:bg-accent/10 hover:text-foreground transition-colors h-10 sm:h-9"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        <FaGoogle className="mr-2 flex-shrink-0" />
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="flex flex-1 min-w-0 items-center justify-center bg-transparent border border-border text-foreground hover:bg-accent/10 hover:text-foreground transition-colors h-10 sm:h-9"
        onClick={() => handleModeSwitch("student-register")}
        disabled={isLoading}
      >
        <FaUserGraduate className="mr-2 flex-shrink-0" />
        <span>University</span>
      </Button>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6"
      data-analytics-id="auth-shell"
    >
      <div className="w-full max-w-5xl">
        {isMobile ? (
          <Card className="w-full rounded-xl border-none bg-card shadow-lg backdrop-blur py-10 gap-6">
            <CardContent className="px-6">
              <div
                className={`mb-6 text-center transition-all duration-500 ease-in-out ${
                  isTransitioning
                    ? "opacity-0 transform translate-y-2 scale-95"
                    : "opacity-100 transform translate-y-0 scale-100"
                }`}
              >
                <Typography.Heading1>{getStepTitle()}</Typography.Heading1>
                <Typography.Body color="secondary">
                  {getStepDescription()}
                </Typography.Body>
              </div>
              <div
                className={`text-center transition-all duration-500 ease-in-out ${
                  isTransitioning
                    ? "opacity-0 transform translate-x-4 scale-95"
                    : "opacity-100 transform translate-x-0 scale-100"
                }`}
              >
                {currentMode === "student-register" ? (
                  renderStudentForm()
                ) : currentMode === "login" ? (
                  showResetForm ? (
                    <>
                      {renderLoginForm()}
                      {error && (
                        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                          {error}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex flex-row items-stretch sm:items-center gap-3 sm:gap-4 justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-[45%]"
                          onClick={handleGithubLogin}
                          disabled={isLoading}
                        >
                          <FaGithub className="mr-2 flex-shrink-0" />
                          GitHub
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-[45%]"
                          onClick={handleGoogleLogin}
                          disabled={isLoading}
                        >
                          <FaGoogle className="mr-2 flex-shrink-0" />
                          Google
                        </Button>
                      </div>

                      <div className="relative mt-4">
                        <div className="absolute inset-0 flex items-center">
                          <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-[7px] uppercase">
                          <Typography.Caption
                            color="secondary"
                            className="bg-card px-2"
                          >
                            Or continue with email
                          </Typography.Caption>
                        </div>
                      </div>

                      {renderLoginForm()}

                      {error && (
                        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                          {error}
                        </div>
                      )}

                      {resetMessage && (
                        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                          {resetMessage}
                        </div>
                      )}
                    </>
                  )
                ) : (
                  <>
                    <div className="flex flex-row items-stretch sm:items-center gap-3 sm:gap-4 justify-center mb-8">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-[45%]"
                        size="sm"
                        onClick={handleGithubLogin}
                        disabled={isLoading}
                      >
                        <FaGithub className="mr-2 flex-shrink-0" />
                        GitHub
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                      >
                        <FaGoogle className="mr-2 flex-shrink-0" />
                        Google
                      </Button>
                    </div>

                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-[7px] uppercase">
                        <Typography.Caption className="bg-card px-2">
                          Or sign up with email
                        </Typography.Caption>
                      </div>
                    </div>

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

                    <div className="mt-8 flex justify-between">
                      {currentStep > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={handlePrevious}
                          disabled={isLoading || isCheckingEmail}
                        >
                          Previous
                        </Button>
                      )}

                      {currentStep === totalSteps ? (
                        <Button
                          onClick={handleRegisterSubmit}
                          disabled={!canProceedToNextStep() || isLoading}
                          size="sm"
                        >
                          {isLoading ? "Creating Account..." : "Create Account"}
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
                          size="sm"
                        >
                          Next
                        </Button>
                      )}
                    </div>
                  </>
                )}

                <div className="text-center mt-6">
                  <Typography.Caption
                    color="secondary"
                    className={currentMode === "login" ? "mt-4" : "mt-0"}
                  >
                    {currentMode === "login" && !showResetForm && (
                      <>
                        Don&apos;t have an account?{" "}
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

                    {currentMode === "student-register" && (
                      <>
                        Not a student?{" "}
                        {onModeChange ? (
                          <button
                            type="button"
                            onClick={() => handleModeSwitch("login")}
                            className="text-primary hover:underline focus:outline-none focus:underline transition-colors duration-200"
                            disabled={isStudentLoading || isTransitioning}
                          >
                            Sign in normally
                          </button>
                        ) : (
                          <Button
                            onClick={() => handleModeSwitch("login")}
                            className="bg-transparent p-0 text-primary hover:underline hover:bg-transparent"
                          >
                            Sign in normally
                          </Button>
                        )}
                      </>
                    )}
                  </Typography.Caption>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="w-full grid  md:grid-cols-2 rounded-3xl overflow-hidden border border-[color:var(--border)]/60 shadow-2xl">
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
              {onAudienceChange && (
                <div className="absolute inset-x-0 bottom-10 flex justify-center">
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onAudienceChange("enterprise");
                    }}
                    className="flex items-center gap-1 hover:gap-1.5 text-sm text-muted-foreground hover:text-foreground px-2 leading-tight transition-all duration-200"
                  >
                    Blairify for Enterprise
                    <ArrowRight className="size-3 mt-1" />
                  </Link>
                </div>
              )}
            </div>

            <div className="w-full bg-card p-6 sm:p-10 flex flex-col justify-center min-h-[32rem]">
              <div
                className={`text-center transition-all duration-500 ease-in-out ${
                  isTransitioning
                    ? "opacity-0 transform translate-y-2 scale-95"
                    : "opacity-100 transform translate-y-0 scale-100"
                }`}
              >
                <Typography.Heading1>{getStepTitle()}</Typography.Heading1>
                <Typography.Body color="secondary">
                  {getStepDescription()}
                </Typography.Body>
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
                    {currentMode === "student-register" ? (
                      renderStudentForm()
                    ) : currentMode === "login" ? (
                      showResetForm ? (
                        renderLoginForm()
                      ) : (
                        <>
                          {renderSocialButtons()}

                          <div className="relative mt-6">
                            <div className="absolute inset-0 flex items-center">
                              <Separator className="w-full" />
                            </div>
                            <div className="relative flex justify-center text-[7px] uppercase">
                              <Typography.Caption
                                color="secondary"
                                className="bg-card px-2"
                              >
                                Or continue with email
                              </Typography.Caption>
                            </div>
                          </div>

                          {renderLoginForm()}
                        </>
                      )
                    ) : (
                      <>
                        <div className="mb-8">{renderSocialButtons()}</div>

                        <div className="relative my-8">
                          <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                          </div>
                          <div className="relative flex justify-center text-[7px] uppercase">
                            <Typography.Caption
                              color="secondary"
                              className="bg-card px-2"
                            >
                              Or sign up with email
                            </Typography.Caption>
                          </div>
                        </div>

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

                        <div className="flex justify-between mt-8">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handlePrevious}
                            disabled={
                              currentStep === 1 || isLoading || isCheckingEmail
                            }
                          >
                            Previous
                          </Button>

                          {currentStep === totalSteps ? (
                            <Button
                              onClick={handleRegisterSubmit}
                              disabled={!canProceedToNextStep() || isLoading}
                              size="lg"
                            >
                              {isLoading
                                ? "Creating Account..."
                                : "Create Account"}
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={handleNext}
                              size="lg"
                              disabled={
                                !canProceedToNextStep() ||
                                isLoading ||
                                isCheckingEmail
                              }
                            >
                              Next
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-center mt-6">
                  <Typography.Caption
                    color="secondary"
                    className={currentMode === "login" ? "mt-4" : "mt-0"}
                  >
                    {currentMode === "login" && !showResetForm && (
                      <>
                        Don&apos;t have an account?{" "}
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

                    {currentMode === "student-register" && (
                      <>
                        Not a student?{" "}
                        {onModeChange ? (
                          <button
                            type="button"
                            onClick={() => handleModeSwitch("login")}
                            className="text-primary hover:underline focus:outline-none focus:underline transition-colors duration-200"
                            disabled={isStudentLoading || isTransitioning}
                          >
                            Sign in normally
                          </button>
                        ) : (
                          <Button
                            onClick={() => handleModeSwitch("login")}
                            className="bg-transparent p-0 text-primary hover:underline hover:bg-transparent"
                          >
                            Sign in normally
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
                  </Typography.Caption>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
