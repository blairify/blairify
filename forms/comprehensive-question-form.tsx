"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type {
  CompanySize,
  ExperienceLevel,
  InterviewType,
  PracticeQuestion,
  QuestionCategory,
} from "@/lib/practice-questions-service";
import type { TechStack } from "@/types/tech-stack";

interface ComprehensiveQuestionFormProps {
  initialData?: PracticeQuestion;
  onSubmit: (
    data: Omit<
      PracticeQuestion,
      "id" | "createdAt" | "lastUpdatedAt" | "version"
    >,
  ) => Promise<void>;
  onCancel?: () => void;
}

export function ComprehensiveQuestionForm({
  initialData,
  onSubmit,
  onCancel,
}: ComprehensiveQuestionFormProps) {
  const [formData, setFormData] = useState<Partial<PracticeQuestion>>(
    initialData || {
      question: "",
      category: "algorithms" as QuestionCategory,
      difficulty: "medium",
      interviewType: "technical",
      companies: [],
      primaryTechStack: [],
      secondaryTechStack: [],
      verified: false,
      aiGenerated: false,
      isActive: true,
      answer: {
        content: "",
        keyPoints: [],
      },
      topicTags: [],
      source: "Admin",
      estimatedMinutes: 10,
      usageStats: {
        usedByCount: 0,
        totalAttempts: 0,
        avgScore: 0,
        avgTimeToComplete: 0,
        completionRate: 0,
        successRate: 0,
        usageLast7Days: 0,
        usageLast30Days: 0,
      },
      popularityScore: 0,
      qualityScore: 0,
    },
  );

  const [currentTab, setCurrentTab] = useState("basic");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(
      formData as Omit<
        PracticeQuestion,
        "id" | "createdAt" | "lastUpdatedAt" | "version"
      >,
    );
  };

  const updateField = <K extends keyof PracticeQuestion>(
    field: K,
    value: PracticeQuestion[K],
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleArrayItem = <T,>(array: T[] | undefined, item: T): T[] => {
    const arr = array || [];
    return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="tech">Tech Stack</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* BASIC TAB */}
        <TabsContent value="basic" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question *</Label>
            <Textarea
              id="question"
              required
              value={formData.question}
              onChange={(e) => updateField("question", e.target.value)}
              rows={3}
              placeholder="Enter the interview question..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Context</Label>
            <Textarea
              id="context"
              value={formData.context || ""}
              onChange={(e) => updateField("context", e.target.value)}
              rows={2}
              placeholder="Additional context or scenario..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: QuestionCategory) =>
                  updateField("category", value)
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="algorithms">Algorithms</SelectItem>
                  <SelectItem value="data-structures">
                    Data Structures
                  </SelectItem>
                  <SelectItem value="system-design">System Design</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="architecture">Architecture</SelectItem>
                  <SelectItem value="api-design">API Design</SelectItem>
                  <SelectItem value="cloud">Cloud</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="ml-ai">ML/AI</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="scalability">Scalability</SelectItem>
                  <SelectItem value="debugging">Debugging</SelectItem>
                  <SelectItem value="code-review">Code Review</SelectItem>
                  <SelectItem value="leadership">Leadership</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="problem-solving">
                    Problem Solving
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input
                id="subcategory"
                value={formData.subcategory || ""}
                onChange={(e) => updateField("subcategory", e.target.value)}
                placeholder="e.g., Binary Search, Dynamic Programming"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty *</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: "easy" | "medium" | "hard") =>
                  updateField("difficulty", value)
                }
              >
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewType">Interview Type *</Label>
              <Select
                value={formData.interviewType}
                onValueChange={(value: InterviewType) =>
                  updateField("interviewType", value)
                }
              >
                <SelectTrigger id="interviewType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="system-design">System Design</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="architecture">Architecture</SelectItem>
                  <SelectItem value="case-study">Case Study</SelectItem>
                  <SelectItem value="take-home">Take Home</SelectItem>
                  <SelectItem value="pair-programming">
                    Pair Programming
                  </SelectItem>
                  <SelectItem value="whiteboard">Whiteboard</SelectItem>
                  <SelectItem value="live-coding">Live Coding</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Experience Levels</Label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  "entry",
                  "junior",
                  "mid",
                  "senior",
                  "staff",
                  "principal",
                  "architect",
                ] as ExperienceLevel[]
              ).map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`exp-${level}`}
                    checked={formData.experienceLevel?.includes(level)}
                    onCheckedChange={() =>
                      updateField(
                        "experienceLevel",
                        toggleArrayItem(formData.experienceLevel, level),
                      )
                    }
                  />
                  <label
                    htmlFor={`exp-${level}`}
                    className="text-sm capitalize"
                  >
                    {level}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companies">Companies (comma-separated)</Label>
            <Input
              id="companies"
              value={formData.companies?.join(", ")}
              onChange={(e) =>
                updateField(
                  "companies",
                  e.target.value
                    .split(",")
                    .map((c) => c.trim())
                    .filter(Boolean),
                )
              }
              placeholder="Google, Meta, Amazon, Microsoft"
            />
          </div>

          <div className="space-y-2">
            <Label>Company Sizes</Label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  "startup",
                  "small",
                  "medium",
                  "large",
                  "enterprise",
                  "faang",
                  "unicorn",
                ] as CompanySize[]
              ).map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <Checkbox
                    id={`size-${size}`}
                    checked={formData.companySize?.includes(size)}
                    onCheckedChange={() =>
                      updateField(
                        "companySize",
                        toggleArrayItem(formData.companySize, size),
                      )
                    }
                  />
                  <label
                    htmlFor={`size-${size}`}
                    className="text-sm capitalize"
                  >
                    {size}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industries">Industries (comma-separated)</Label>
            <Input
              id="industries"
              value={formData.industries?.join(", ")}
              onChange={(e) =>
                updateField(
                  "industries",
                  e.target.value
                    .split(",")
                    .map((i) => i.trim())
                    .filter(Boolean),
                )
              }
              placeholder="fintech, healthcare, e-commerce"
            />
          </div>
        </TabsContent>

        {/* TECH STACK TAB */}
        <TabsContent value="tech" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryTechStack">
              Primary Tech Stack (comma-separated)
            </Label>
            <Textarea
              id="primaryTechStack"
              value={formData.primaryTechStack?.join(", ")}
              onChange={(e) =>
                updateField(
                  "primaryTechStack",
                  e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean) as TechStack[],
                )
              }
              rows={2}
              placeholder="react, typescript, nodejs, postgresql, docker"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryTechStack">
              Secondary Tech Stack (comma-separated)
            </Label>
            <Textarea
              id="secondaryTechStack"
              value={formData.secondaryTechStack?.join(", ")}
              onChange={(e) =>
                updateField(
                  "secondaryTechStack",
                  e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean) as TechStack[],
                )
              }
              rows={2}
              placeholder="redis, kafka, kubernetes"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="languages">Languages</Label>
              <Input
                id="languages"
                value={formData.languages?.join(", ")}
                onChange={(e) =>
                  updateField(
                    "languages",
                    e.target.value
                      .split(",")
                      .map((l) => l.trim())
                      .filter(
                        Boolean,
                      ) as unknown as PracticeQuestion["languages"],
                  )
                }
                placeholder="javascript, python, go"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frontendFrameworks">Frontend Frameworks</Label>
              <Input
                id="frontendFrameworks"
                value={formData.frontendFrameworks?.join(", ")}
                onChange={(e) =>
                  updateField(
                    "frontendFrameworks",
                    e.target.value
                      .split(",")
                      .map((f) => f.trim())
                      .filter(
                        Boolean,
                      ) as unknown as PracticeQuestion["frontendFrameworks"],
                  )
                }
                placeholder="react, vue, angular"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="databases">Databases</Label>
              <Input
                id="databases"
                value={formData.databases?.join(", ")}
                onChange={(e) =>
                  updateField(
                    "databases",
                    e.target.value
                      .split(",")
                      .map((d) => d.trim())
                      .filter(
                        Boolean,
                      ) as unknown as PracticeQuestion["databases"],
                  )
                }
                placeholder="postgresql, mongodb, redis"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cloudProviders">Cloud Providers</Label>
              <Input
                id="cloudProviders"
                value={formData.cloudProviders?.join(", ")}
                onChange={(e) =>
                  updateField(
                    "cloudProviders",
                    e.target.value
                      .split(",")
                      .map((c) => c.trim())
                      .filter(
                        Boolean,
                      ) as unknown as PracticeQuestion["cloudProviders"],
                  )
                }
                placeholder="aws, gcp, azure"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="containers">Containers</Label>
              <Input
                id="containers"
                value={formData.containers?.join(", ")}
                onChange={(e) =>
                  updateField(
                    "containers",
                    e.target.value
                      .split(",")
                      .map((c) => c.trim())
                      .filter(
                        Boolean,
                      ) as unknown as PracticeQuestion["containers"],
                  )
                }
                placeholder="docker, kubernetes"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cicd">CI/CD</Label>
              <Input
                id="cicd"
                value={formData.cicd?.join(", ")}
                onChange={(e) =>
                  updateField(
                    "cicd",
                    e.target.value
                      .split(",")
                      .map((c) => c.trim())
                      .filter(Boolean) as unknown as PracticeQuestion["cicd"],
                  )
                }
                placeholder="github-actions, jenkins"
              />
            </div>
          </div>
        </TabsContent>

        {/* CONTENT TAB */}
        <TabsContent value="content" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="answer">Answer *</Label>
            <Textarea
              id="answer"
              required
              value={formData.answer?.content}
              onChange={(e) =>
                updateField("answer", {
                  ...(formData.answer || { content: "", keyPoints: [] }),
                  content: e.target.value,
                })
              }
              rows={8}
              placeholder="Detailed answer to the question..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyPoints">Key Points (comma-separated)</Label>
            <Textarea
              id="keyPoints"
              value={formData.answer?.keyPoints?.join(", ")}
              onChange={(e) =>
                updateField("answer", {
                  ...(formData.answer || { content: "", keyPoints: [] }),
                  keyPoints: e.target.value
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean),
                })
              }
              rows={3}
              placeholder="Key point 1, Key point 2, Key point 3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="followUpQuestions">
              Follow-up Questions (one per line)
            </Label>
            <Textarea
              id="followUpQuestions"
              value={formData.followUpQuestions?.join("\n")}
              onChange={(e) =>
                updateField(
                  "followUpQuestions",
                  e.target.value.split("\n").filter(Boolean),
                )
              }
              rows={3}
              placeholder="What if the data size increases?\nHow would you handle failures?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hints">Hints (one per line)</Label>
            <Textarea
              id="hints"
              value={formData.hints?.join("\n")}
              onChange={(e) =>
                updateField("hints", e.target.value.split("\n").filter(Boolean))
              }
              rows={3}
              placeholder="Consider using a hash map\nThink about edge cases"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commonMistakes">
              Common Mistakes (one per line)
            </Label>
            <Textarea
              id="commonMistakes"
              value={formData.commonMistakes?.join("\n")}
              onChange={(e) =>
                updateField(
                  "commonMistakes",
                  e.target.value.split("\n").filter(Boolean),
                )
              }
              rows={3}
              placeholder="Not handling null values\nForgetting to check bounds"
            />
          </div>
        </TabsContent>

        {/* METADATA TAB */}
        <TabsContent value="metadata" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topicTags">Topic Tags (comma-separated)</Label>
            <Input
              id="topicTags"
              value={formData.topicTags?.join(", ")}
              onChange={(e) =>
                updateField(
                  "topicTags",
                  e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                )
              }
              placeholder="arrays, sorting, optimization"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prerequisites">
              Prerequisites (comma-separated)
            </Label>
            <Input
              id="prerequisites"
              value={formData.prerequisites?.join(", ")}
              onChange={(e) =>
                updateField(
                  "prerequisites",
                  e.target.value
                    .split(",")
                    .map((p) => p.trim())
                    .filter(Boolean),
                )
              }
              placeholder="Understanding of arrays, Basic algorithms"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relatedQuestions">
              Related Question IDs (comma-separated)
            </Label>
            <Input
              id="relatedQuestions"
              value={formData.relatedQuestions?.join(", ")}
              onChange={(e) =>
                updateField(
                  "relatedQuestions",
                  e.target.value
                    .split(",")
                    .map((q) => q.trim())
                    .filter(Boolean),
                )
              }
              placeholder="question-id-1, question-id-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">Source *</Label>
              <Input
                id="source"
                required
                value={formData.source}
                onChange={(e) => updateField("source", e.target.value)}
                placeholder="LeetCode, Interview Experience, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceUrl">Source URL</Label>
              <Input
                id="sourceUrl"
                type="url"
                value={formData.sourceUrl || ""}
                onChange={(e) => updateField("sourceUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contributor">Contributor</Label>
            <Input
              id="contributor"
              value={formData.contributor || ""}
              onChange={(e) => updateField("contributor", e.target.value)}
              placeholder="Name or email"
            />
          </div>
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedMinutes">Estimated Minutes *</Label>
              <Input
                id="estimatedMinutes"
                type="number"
                required
                value={formData.estimatedMinutes}
                onChange={(e) =>
                  updateField(
                    "estimatedMinutes",
                    Number.parseInt(e.target.value, 10),
                  )
                }
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficultyRating">Difficulty Rating (1-10)</Label>
              <Input
                id="difficultyRating"
                type="number"
                value={formData.difficultyRating || ""}
                onChange={(e) =>
                  updateField(
                    "difficultyRating",
                    Number.parseFloat(e.target.value),
                  )
                }
                min="1"
                max="10"
                step="0.1"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={formData.verified}
                onCheckedChange={(checked) =>
                  updateField("verified", checked as boolean)
                }
              />
              <label htmlFor="verified" className="text-sm">
                Verified Question
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="aiGenerated"
                checked={formData.aiGenerated}
                onCheckedChange={(checked) =>
                  updateField("aiGenerated", checked as boolean)
                }
              />
              <label htmlFor="aiGenerated" className="text-sm">
                AI Generated
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  updateField("isActive", checked as boolean)
                }
              />
              <label htmlFor="isActive" className="text-sm">
                Active (visible to users)
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDraft"
                checked={formData.isDraft}
                onCheckedChange={(checked) =>
                  updateField("isDraft", checked as boolean)
                }
              />
              <label htmlFor="isDraft" className="text-sm">
                Draft Mode
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviewedBy">Reviewed By (comma-separated)</Label>
            <Input
              id="reviewedBy"
              value={formData.reviewedBy?.join(", ")}
              onChange={(e) =>
                updateField(
                  "reviewedBy",
                  e.target.value
                    .split(",")
                    .map((r) => r.trim())
                    .filter(Boolean),
                )
              }
              placeholder="reviewer1, reviewer2"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 justify-end pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">
          {initialData ? "Update" : "Create"} Question
        </Button>
      </div>
    </form>
  );
}
