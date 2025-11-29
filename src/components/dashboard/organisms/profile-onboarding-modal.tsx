"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TECHNOLOGY_GROUPS } from "@/constants/configure";

interface ProfileOnboardingModalProps {
  open: boolean;
  initialRole?: string;
  initialExperience?: string;
  initialHowDidYouHear?: string;
  isSaving: boolean;
  onSave: (values: {
    role: string;
    experience: string;
    howDidYouHear: string;
    preferredLocation?: string;
    technologies?: string[];
    preferredWorkTypes?: string[];
    expectedSalary?: string;
    struggleAreas?: string[];
    careerGoals?: string[];
  }) => void | Promise<void>;
  onClose: () => void;
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

const HOW_DID_YOU_HEAR_OPTIONS = [
  "Google Search",
  "Social Media",
  "LinkedIn",
  "Twitter/X",
  "YouTube",
  "Reddit",
  "Hacker News",
  "Friend/Colleague",
  "Blog/Article",
  "Podcast",
  "Newsletter",
  "Advertisement",
  "GitHub",
  "Product Hunt",
  "Other",
];

const STRUGGLE_OPTIONS: string[] = [
  "System design",
  "Algorithms & data structures",
  "Live coding",
  "Behavioral questions",
  "Talking through my thinking",
  "Time management during interviews",
  "Confidence / nerves",
];

const GOAL_OPTIONS: string[] = [
  "Get my first full-time job",
  "Land a better / higher-paying role",
  "Switch into a new tech stack",
  "Practice for upcoming interviews",
  "Stay sharp between job searches",
  "Explore my strengths and weaknesses",
];

const WORK_TYPE_OPTIONS = [
  "Full-time",
  "Part-time",
  "Contract / Freelance",
  "Internship",
  "Remote-first",
  "Hybrid",
  "On-site",
];

export function ProfileOnboardingModal({
  open,
  initialRole,
  initialExperience,
  initialHowDidYouHear,
  isSaving,
  onSave,
  onClose,
}: ProfileOnboardingModalProps) {
  const [role, setRole] = useState(initialRole ?? "");
  const [experience, setExperience] = useState(initialExperience ?? "");
  const [howDidYouHear, setHowDidYouHear] = useState(
    initialHowDidYouHear ?? "",
  );
  const [preferredLocation, setPreferredLocation] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [preferredWorkTypes, setPreferredWorkTypes] = useState<string[]>([]);
  const [expectedSalary, setExpectedSalary] = useState("");
  const [struggleAreas, setStruggleAreas] = useState<string[]>([]);
  const [careerGoals, setCareerGoals] = useState<string[]>([]);
  const [step, setStep] = useState(0);

  const totalSteps = 9;

  useEffect(() => {
    if (!open) return;
    setRole(initialRole ?? "");
    setExperience(initialExperience ?? "");
    setHowDidYouHear(initialHowDidYouHear ?? "");
    setPreferredLocation("");
    setTechnologies([]);
    setPreferredWorkTypes([]);
    setExpectedSalary("");
    setStruggleAreas([]);
    setCareerGoals([]);
    setStep(0);
  }, [open, initialRole, initialExperience, initialHowDidYouHear]);

  const handleNext = async () => {
    if (step === 0 && !role) return;
    if (step === 1 && !experience) return;

    if (step < totalSteps - 1) {
      setStep((prev) => prev + 1);
      return;
    }

    await onSave({
      role,
      experience,
      howDidYouHear,
      preferredLocation,
      technologies,
      preferredWorkTypes,
      expectedSalary,
      struggleAreas,
      careerGoals,
    });
  };

  const handleBack = () => {
    if (isSaving || step === 0) return;
    setStep((prev) => prev - 1);
  };

  const canNext =
    !isSaving &&
    ((step === 0 && Boolean(role)) ||
      (step === 1 && Boolean(experience)) ||
      step >= 2);

  const setQuickLocation = (value: string) => {
    setPreferredLocation(value);
  };

  const toggleTechnology = (tech: string) => {
    setTechnologies((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech],
    );
  };

  const toggleWorkType = (type: string) => {
    setPreferredWorkTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleStruggleArea = (area: string) => {
    setStruggleAreas((prev) =>
      prev.includes(area) ? prev.filter((t) => t !== area) : [...prev, area],
    );
  };

  const toggleCareerGoal = (goal: string) => {
    setCareerGoals((prev) =>
      prev.includes(goal) ? prev.filter((t) => t !== goal) : [...prev, goal],
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && !isSaving && onClose()}
    >
      <DialogContent className="max-w-xl w-full mx-4">
        <DialogHeader>
          <DialogTitle>Personalize your Blairify experience</DialogTitle>
          <DialogDescription>
            Tell us about your dream role and experience so we can tailor
            interviews for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Step {step + 1} of {totalSteps}
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {step === 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Target role</Label>
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`cursor-pointer px-3 py-2 text-sm rounded-md border-2 transition-all duration-200 hover:shadow-md ${
                      role === option
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setRole(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Experience level</Label>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`cursor-pointer px-3 py-2 text-sm rounded-md border-2 transition-all duration-200 hover:shadow-md ${
                      experience === option
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setExperience(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Preferred location</Label>
              <p className="text-xs text-muted-foreground">
                Where would you prefer to work? You can pick a quick option or
                type a city, country, or region.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Remote",
                  "Hybrid",
                  "On-site",
                  "US / Canada",
                  "UK / Europe",
                ].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`cursor-pointer px-3 py-2 text-xs sm:text-sm rounded-md border-2 transition-all duration-200 hover:shadow-md ${
                      preferredLocation === option
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setQuickLocation(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <Input
                value={preferredLocation}
                onChange={(event) => setPreferredLocation(event.target.value)}
                placeholder="e.g. London, UK or Remote Europe"
                className="h-10"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Preferred work type</Label>
              <p className="text-xs text-muted-foreground">
                What kind of roles are you most interested in?
              </p>
              <div className="flex flex-wrap gap-2">
                {WORK_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`cursor-pointer px-3 py-2 text-xs sm:text-sm rounded-md border-2 transition-all duration-200 hover:shadow-md ${
                      preferredWorkTypes.includes(option)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => toggleWorkType(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Preferred technologies
              </Label>
              <p className="text-xs text-muted-foreground">
                Choose a few technologies you want to focus on. This helps
                personalize your practice sessions.
              </p>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {Object.entries(TECHNOLOGY_GROUPS).map(([groupName, techs]) => (
                  <div key={groupName} className="space-y-1">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {groupName}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {techs.map((tech) => (
                        <button
                          key={tech}
                          type="button"
                          className={`cursor-pointer px-3 py-1.5 text-[11px] sm:text-xs rounded-md border-2 transition-all duration-200 hover:shadow-md ${
                            technologies.includes(tech)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => toggleTechnology(tech)}
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Expected salary</Label>
              <p className="text-xs text-muted-foreground">
                Optional. Share a rough yearly or hourly target (with currency
                if you like).
              </p>
              <Input
                value={expectedSalary}
                onChange={(event) => setExpectedSalary(event.target.value)}
                placeholder="e.g. 80k USD / year or 40 EUR / hour"
                className="h-10"
              />
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Main areas you struggle with
              </Label>
              <p className="text-xs text-muted-foreground">
                Pick a few. This helps us focus your practice.
              </p>
              <div className="flex flex-wrap gap-2">
                {STRUGGLE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`cursor-pointer px-3 py-2 text-xs sm:text-sm rounded-md border-2 transition-all duration-200 hover:shadow-md ${
                      struggleAreas.includes(option)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => toggleStruggleArea(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                What are you looking for right now?
              </Label>
              <p className="text-xs text-muted-foreground">
                Choose the options that best match your current goals.
              </p>
              <div className="flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`cursor-pointer px-3 py-2 text-xs sm:text-sm rounded-md border-2 transition-all duration-200 hover:shadow-md ${
                      careerGoals.includes(option)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => toggleCareerGoal(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                How did you hear about Blairify?
              </Label>
              <div className="flex flex-wrap gap-2">
                {HOW_DID_YOU_HEAR_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`cursor-pointer px-3 py-2 text-sm rounded-md border-2 transition-all duration-200 hover:shadow-md ${
                      howDidYouHear === option
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setHowDidYouHear(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
            onClick={onClose}
            disabled={isSaving}
          >
            Maybe later
          </Button>
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSaving}
            >
              Back
            </Button>
          )}
          <Button
            type="button"
            className="text-sm font-medium text-white bg-primary hover:bg-primary/90"
            onClick={handleNext}
            disabled={!canNext}
          >
            {step === totalSteps - 1 ? "Save and continue" : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
