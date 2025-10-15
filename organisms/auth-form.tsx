"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import LoadingPage from "@/components/atoms/loading-page";
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
import { useGuestGuard } from "@/hooks/useAuthGuard";
import {
  checkEmailExists,
  registerWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithGitHub,
  signInWithGoogle,
} from "@/lib/auth";
import Logo from "../atoms/logo-blairify";

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

  const totalSteps = 6;

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
        console.warn("Email check failed:", error);
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
    } catch (error) {
      console.warn("Email check failed:", error);
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
        !formData.confirmPassword ||
        !formData.experience ||
        !formData.role ||
        !formData.howDidYouHear
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
        {
          role: formData.role,
          experience: formData.experience,
          howDidYouHear: formData.howDidYouHear,
        },
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
      return "Welcome";
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

  const renderLoginForm = () => (
    <form onSubmit={handleLoginSubmit} className="space-y-6 mt-6">
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
          disabled={isLoading}
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

      <Button
        type="submit"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );

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
    <div className="grid grid-cols-2 gap-4 items-center">
      <Button
        type="button"
        variant="outline"
        className="bg-transparent border border-border text-foreground hover:bg-accent/10 hover:text-foreground transition-colors"
        onClick={handleGithubLogin}
        disabled={isLoading}
      >
        <FaGithub className="size-4 mr-1" />
        {isMobile ? "GitHub" : "Continue with GitHub"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="bg-transparent border border-border text-foreground hover:bg-accent/10 hover:text-foreground transition-colors"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        <FaGoogle className="size-4 mr-1" />
        {isMobile ? "Google" : "Continue with Google"}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {isMobile ? (
        <Card className="border-border bg-card w-full max-w-md mx-4 sm:mx-auto">
          <CardHeader className="text-center">
            <div
              className={`transition-all duration-500 ease-in-out ${
                isTransitioning
                  ? "opacity-0 transform translate-y-2 scale-95"
                  : "opacity-100 transform translate-y-0 scale-100"
              }`}
            >
              <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
              <CardDescription>{getStepDescription()}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {error}
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
                {currentMode === "login" ? (
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
                ) : (
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
        <Card className="p-6 bg-transparent shadow-none">
          <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 items-center flex-1 relative overflow-hidden">
            <div
              className={`min-w-1/2 max-w-1/2 transition-all duration-700 ease-in-out z-10 transform ${
                currentMode === "login"
                  ? "md:translate-x-[calc(100%)]"
                  : "md:translate-x-0"
              }`}
            >
              <Card className="border-border bg-card w-full">
                <CardHeader className="text-center">
                  <div
                    className={`transition-all duration-500 ease-in-out ${
                      isTransitioning
                        ? "opacity-0 transform translate-y-2 scale-95"
                        : "opacity-100 transform translate-y-0 scale-100"
                    }`}
                  >
                    <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
                    <CardDescription>{getStepDescription()}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                      {error}
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
                                currentStep === 1 ||
                                isLoading ||
                                isCheckingEmail
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
                      {currentMode === "login" ? (
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
                      ) : (
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
            </div>

            <div
              className={`transition-all duration-700 ease-in-out transform z-2 ${
                currentMode === "login"
                  ? "md:-translate-x-[calc(100%+5rem)]"
                  : "md:translate-x-0"
              }`}
            >
              <Logo variant="stacked" />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
