"use client";

import {
  ArrowUp,
  Check,
  Rocket,
  Sparkles,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import LoadingPage from "@/components/common/atoms/loading-page";
import { Typography } from "@/components/common/atoms/typography";
import { DashboardLayout } from "@/components/dashboard/templates/dashboard-layout";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isAdmin } from "@/lib/services/auth/auth-roles";
import {
  createRoadmapIdea,
  deleteRoadmapIdea,
  hasUserUpvotedRoadmapIdea,
  type RoadmapIdea,
  type RoadmapIdeaAudience,
  type RoadmapIdeaStatus,
  subscribeRoadmapIdeas,
  toggleRoadmapIdeaUpvote,
} from "@/lib/services/roadmap/roadmap-service";
import { useAuth } from "@/providers/auth-provider";

interface RoadmapPageClientProps {
  userId: string;
}

export function RoadmapPageClient({ userId }: RoadmapPageClientProps) {
  const { user: authUser, userData, loading: authLoading } = useAuth();

  const [ideas, setIdeas] = useState<RoadmapIdea[]>([]);
  const [upvotedByIdeaId, setUpvotedByIdeaId] = useState<
    Record<string, boolean>
  >({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [votingIdeaId, setVotingIdeaId] = useState<string | null>(null);
  const [deletingIdeaId, setDeletingIdeaId] = useState<string | null>(null);
  const [deleteDialogIdeaId, setDeleteDialogIdeaId] = useState<string | null>(
    null,
  );
  const [bumpIdeaId, setBumpIdeaId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState<RoadmapIdeaAudience>("candidate");
  const [status, setStatus] = useState<RoadmapIdeaStatus>("planned");

  const [selectedAudience, setSelectedAudience] =
    useState<RoadmapIdeaAudience>("candidate");

  const canInteract = useMemo(() => {
    if (authLoading) return false;
    if (!authUser) return false;
    if (!userData) return false;
    if (userData.onboardingCompleted === false) return false;
    return true;
  }, [authLoading, authUser, userData]);

  const canManageRoadmap = useMemo(() => {
    return isAdmin(authUser, userData?.role);
  }, [authUser, userData?.role]);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) return;
    if (authUser.uid !== userId) return;

    setLoading(true);

    const unsubIdeas = subscribeRoadmapIdeas({
      onData: (nextIdeas) => {
        setIdeas(nextIdeas);
        setLoading(false);
      },
      onError: (error) => {
        console.error("Failed to subscribe to roadmap ideas:", error);
        toast.error("Failed to load roadmap");
        setLoading(false);
      },
    });

    return () => {
      unsubIdeas();
    };
  }, [authLoading, authUser, userId]);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) return;
    if (authUser.uid !== userId) return;
    if (ideas.length === 0) {
      setUpvotedByIdeaId({});
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const entries = await Promise.all(
          ideas.map(async (idea) => {
            const upvoted = await hasUserUpvotedRoadmapIdea({
              ideaId: idea.id,
              userId,
            });
            return [idea.id, upvoted] as const;
          }),
        );

        if (cancelled) return;

        setUpvotedByIdeaId(
          Object.fromEntries(entries.filter(([, v]) => v === true)),
        );
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to load roadmap vote state:", error);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [authLoading, authUser, ideas, userId]);

  const onCreateIdea = async () => {
    if (!canManageRoadmap) {
      toast.error("You don't have permission to add roadmap items");
      return;
    }

    try {
      setSubmitting(true);
      await createRoadmapIdea({
        title,
        description,
        audience,
        status,
        createdByUid: userId,
      });
      setTitle("");
      setDescription("");
      toast.success("Idea submitted");
    } catch (error) {
      console.error("Failed to create roadmap idea:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit idea",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onToggleUpvote = async (ideaId: string) => {
    if (!canInteract) {
      toast.error("You must be signed in and onboarded to vote");
      return;
    }

    const previousUpvoted = upvotedByIdeaId[ideaId] ?? false;
    const previousIdea = ideas.find((x) => x.id === ideaId) ?? null;
    if (!previousIdea) return;

    const optimisticDelta = previousUpvoted ? -1 : 1;
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === ideaId
          ? {
              ...idea,
              voteCount: Math.max(0, idea.voteCount + optimisticDelta),
            }
          : idea,
      ),
    );
    setUpvotedByIdeaId((prev) => ({ ...prev, [ideaId]: !previousUpvoted }));
    setBumpIdeaId(ideaId);
    window.setTimeout(() => setBumpIdeaId(null), 250);

    try {
      setVotingIdeaId(ideaId);
      const result = await toggleRoadmapIdeaUpvote({ ideaId, userId });

      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === ideaId ? { ...idea, voteCount: result.voteCount } : idea,
        ),
      );
      setUpvotedByIdeaId((prev) => ({ ...prev, [ideaId]: result.upvoted }));
    } catch (error) {
      console.error("Failed to vote:", error);
      toast.error("Failed to vote");

      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === ideaId
            ? {
                ...idea,
                voteCount: previousIdea.voteCount,
              }
            : idea,
        ),
      );
      setUpvotedByIdeaId((prev) => ({ ...prev, [ideaId]: previousUpvoted }));
    } finally {
      setVotingIdeaId(null);
    }
  };

  const onRequestDeleteIdea = (ideaId: string) => {
    if (!canManageRoadmap) {
      toast.error("You don't have permission to delete roadmap items");
      return;
    }
    setDeleteDialogIdeaId(ideaId);
  };

  const onConfirmDeleteIdea = async (ideaId: string) => {
    if (!canManageRoadmap) {
      toast.error("You don't have permission to delete roadmap items");
      return;
    }

    const previousIdeas = ideas;

    setIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));
    setUpvotedByIdeaId((prev) => {
      const { [ideaId]: _, ...rest } = prev;
      return rest;
    });

    try {
      setDeletingIdeaId(ideaId);
      await deleteRoadmapIdea({ ideaId });
      toast.success("Roadmap item deleted");
    } catch (error) {
      console.error("Failed to delete roadmap idea:", error);
      toast.error("Failed to delete roadmap item");
      setIdeas(previousIdeas);
    } finally {
      setDeletingIdeaId(null);
      setDeleteDialogIdeaId(null);
    }
  };

  const candidateIdeas = useMemo(() => {
    return ideas
      .filter((idea) => idea.audience === "candidate")
      .sort((a, b) => b.voteCount - a.voteCount);
  }, [ideas]);

  const recruiterIdeas = useMemo(() => {
    return ideas
      .filter((idea) => idea.audience === "recruiter")
      .sort((a, b) => b.voteCount - a.voteCount);
  }, [ideas]);

  const selectedIdeas = useMemo(() => {
    switch (selectedAudience) {
      case "candidate":
        return candidateIdeas;
      case "recruiter":
        return recruiterIdeas;
      default: {
        const _never: never = selectedAudience;
        throw new Error(`Unhandled audience: ${_never}`);
      }
    }
  }, [candidateIdeas, recruiterIdeas, selectedAudience]);

  const renderIdeaCard = (idea: RoadmapIdea, index: number) => {
    const upvoted = upvotedByIdeaId[idea.id] ?? false;
    const isBumping = bumpIdeaId === idea.id;
    const isDeleting = deletingIdeaId === idea.id;
    const isTopVoted = index === 0 && idea.voteCount > 0;

    const statusConfig = (() => {
      switch (idea.status) {
        case "planned":
          return {
            label: "Planned",
            icon: Sparkles,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/30",
            glow: "from-amber-500/20 to-orange-500/20",
          };
        case "in_progress":
          return {
            label: "In Progress",
            icon: Zap,
            color: "text-primary",
            bg: "bg-primary/10",
            border: "border-primary/30",
            glow: "from-primary/20 to-yellow-500/20",
          };
        default: {
          const _never: never = idea.status;
          throw new Error(`Unhandled status: ${_never}`);
        }
      }
    })();

    return (
      <div
        key={idea.id}
        className="group relative animate-in fade-in slide-in-from-bottom-4"
        style={{ animationDelay: `${index * 75}ms`, animationFillMode: "both" }}
      >
        {/* Enhanced gradient glow */}
        <div
          className={`absolute -inset-1 bg-gradient-to-r ${statusConfig.glow} rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700 ${isTopVoted ? "opacity-50" : ""}`}
        />

        {/* Top voted indicator */}
        {isTopVoted && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-yellow-500 shadow-lg shadow-primary/50">
              <TrendingUp className="size-3.5 text-black" />
              <Typography.SubCaptionBold className="text-black text-xs uppercase tracking-wider">
                Most Requested
              </Typography.SubCaptionBold>
            </div>
          </div>
        )}

        <div
          className={`relative bg-gradient-to-br from-[#0D0D0D] to-[#0A0A0A] border ${isTopVoted ? "border-primary/40" : "border-white/10"} rounded-3xl overflow-hidden backdrop-blur-xl transition-all duration-300 ${isTopVoted ? "shadow-2xl shadow-primary/20" : ""}`}
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Status indicator line */}

          <div className="relative p-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 space-y-4">
                {/* Status badge */}
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className={`${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border} font-semibold px-3 py-1`}
                  >
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Title */}
                <Typography.Heading2 className="text-2xl font-black text-white leading-tight tracking-tight">
                  {idea.title}
                </Typography.Heading2>

                {/* Description */}
                <Typography.Body className="text-base text-gray-300 leading-relaxed">
                  {idea.description}
                </Typography.Body>
              </div>

              {/* Admin delete button */}
              {canManageRoadmap && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRequestDeleteIdea(idea.id)}
                  disabled={isDeleting}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>

            {/* Footer with voting */}
            <div className="flex items-center justify-between pt-6">
              <div className="flex items-center gap-3">
                {/* Upvote button */}
                <button
                  type="button"
                  onClick={() => onToggleUpvote(idea.id)}
                  disabled={votingIdeaId === idea.id || isDeleting}
                  className={`group/vote relative flex items-center gap-3 px-5 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    upvoted
                      ? "bg-gradient-to-r from-primary to-yellow-500 text-black shadow-lg shadow-primary/30"
                      : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-white hover:shadow-lg hover:shadow-white/10"
                  } ${isBumping ? "scale-110" : ""} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {/* Glow effect */}
                  {upvoted && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-yellow-500 rounded-2xl blur-xl opacity-50" />
                  )}

                  <div className="relative flex items-center gap-3">
                    <ArrowUp
                      className={`size-5 transition-all duration-300 ${upvoted ? "fill-current" : "group-hover/vote:-translate-y-1"}`}
                    />
                    <div className="flex flex-col items-start">
                      <Typography.SubCaptionBold className="text-xs uppercase tracking-wider">
                        {upvoted ? "Upvoted" : "Upvote"}
                      </Typography.SubCaptionBold>
                      <Typography.CaptionBold className="text-lg leading-none">
                        {idea.voteCount}
                      </Typography.CaptionBold>
                    </div>
                  </div>
                </button>

                {/* Upvoted indicator */}
                {upvoted && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 animate-in fade-in zoom-in duration-300">
                    <Check className="size-4 text-emerald-400" />
                    <Typography.SubCaptionMedium className="text-emerald-400 text-xs font-semibold">
                      You voted
                    </Typography.SubCaptionMedium>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Decorative corner gradient */}
          <div
            className={`absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl ${statusConfig.glow} rounded-tl-full opacity-5 group-hover:opacity-10 transition-opacity duration-500`}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingPage message="Loading roadmap..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Dialog
        open={deleteDialogIdeaId !== null}
        onOpenChange={(open) => {
          if (open) return;
          setDeleteDialogIdeaId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete roadmap item?</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogIdeaId(null)}
              disabled={deletingIdeaId !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!deleteDialogIdeaId) return;
                void onConfirmDeleteIdea(deleteDialogIdeaId);
              }}
              disabled={deleteDialogIdeaId === null || deletingIdeaId !== null}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="relative min-h-screen">
        {/* Animated background gradients */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div
            className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="space-y-16 max-w-6xl mx-auto pb-20">
          {/* Hero Section - Minimal Side-by-Side */}
          <div className="relative overflow-hidden rounded-[32px] border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />

            <div className="relative z-10 p-12 sm:p-16">
              <div className="grid lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
                {/* Left: Content */}
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                      <div className="size-2 rounded-full bg-primary animate-pulse" />
                      <Typography.SubCaptionBold className="text-primary uppercase tracking-[0.2em] text-xs">
                        Live Roadmap
                      </Typography.SubCaptionBold>
                    </div>

                    <Typography.Heading1 className="text-5xl sm:text-6xl font-black text-white leading-[1.1] tracking-tight">
                      Shape What's
                      <br />
                      <span className="text-primary">Coming Next</span>
                    </Typography.Heading1>

                    <Typography.Body className="text-lg text-gray-400 leading-relaxed max-w-xl">
                      Vote on features, track development progress, and help us
                      build the product you need.
                    </Typography.Body>
                  </div>

                  {/* Audience selector - minimal pills */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedAudience("candidate")}
                      className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                        selectedAudience === "candidate"
                          ? "bg-white text-black shadow-lg shadow-white/20"
                          : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                      }`}
                    >
                      Candidates
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAudience("recruiter")}
                      className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                        selectedAudience === "recruiter"
                          ? "bg-white text-black shadow-lg shadow-white/20"
                          : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                      }`}
                    >
                      Recruiters
                    </button>
                  </div>
                </div>

                {/* Right: Visual element */}
                <div className="relative hidden lg:block">
                  <div className="relative aspect-square max-w-md ml-auto">
                    {/* Animated rings */}
                    <div
                      className="absolute inset-0 rounded-full border border-primary/20 animate-ping"
                      style={{ animationDuration: "3s" }}
                    />
                    <div
                      className="absolute inset-8 rounded-full border border-primary/30 animate-ping"
                      style={{
                        animationDuration: "2.5s",
                        animationDelay: "0.5s",
                      }}
                    />
                    <div
                      className="absolute inset-16 rounded-full border border-primary/40 animate-ping"
                      style={{ animationDuration: "2s", animationDelay: "1s" }}
                    />

                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-yellow-500 rounded-full blur-3xl opacity-50" />
                        <div className="relative p-8 rounded-full bg-gradient-to-br from-primary to-yellow-500">
                          <Rocket className="size-16 text-black" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin: Add New Item */}

          {/* Roadmap Items */}
          <div className="space-y-8">
            {selectedIdeas.length === 0 ? (
              <div className="text-center py-24 px-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent">
                <div className="inline-flex p-6 rounded-3xl bg-white/5 border border-white/10 mb-6">
                  <Sparkles className="size-12 text-gray-500" />
                </div>
                <Typography.Heading2 className="text-3xl font-black text-white mb-3">
                  No features yet
                </Typography.Heading2>
                <Typography.Body className="text-gray-400 text-lg">
                  {selectedAudience === "candidate"
                    ? "No candidate features planned yet. Be the first to suggest one!"
                    : "No recruiter features planned yet. Be the first to suggest one!"}
                </Typography.Body>
              </div>
            ) : (
              <div className="grid gap-8">
                {selectedIdeas.map((idea, index) =>
                  renderIdeaCard(idea, index),
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {canManageRoadmap && (
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-primary/30 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition duration-700" />
          <div className="relative bg-gradient-to-br from-[#0D0D0D] to-[#0A0A0A] border border-white/10 rounded-3xl p-10 space-y-8">
            <Typography.Heading2 className="text-2xl font-black text-white uppercase tracking-tight">
              Add Roadmap Item
            </Typography.Heading2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <Typography.CaptionBold className="text-gray-300 uppercase tracking-wider text-xs">
                  Audience
                </Typography.CaptionBold>
                <Select
                  value={audience}
                  onValueChange={(value) =>
                    setAudience(value as RoadmapIdeaAudience)
                  }
                >
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="candidate">
                      For Candidate (B2C)
                    </SelectItem>
                    <SelectItem value="recruiter">
                      For Recruiter (B2B)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Typography.CaptionBold className="text-gray-300 uppercase tracking-wider text-xs">
                  Status
                </Typography.CaptionBold>
                <Select
                  value={status}
                  onValueChange={(value) =>
                    setStatus(value as RoadmapIdeaStatus)
                  }
                >
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Typography.CaptionBold className="text-gray-300 uppercase tracking-wider text-xs">
                Title
              </Typography.CaptionBold>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short, specific title"
                maxLength={80}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-3">
              <Typography.CaptionBold className="text-gray-300 uppercase tracking-wider text-xs">
                Description
              </Typography.CaptionBold>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What problem does it solve? What would good look like?"
                maxLength={2000}
                rows={5}
                className="text-base"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={onCreateIdea}
                disabled={submitting || !title.trim() || !description.trim()}
                className="bg-gradient-to-r from-primary to-yellow-500 text-black hover:opacity-90 font-bold px-8 py-6 text-base shadow-xl shadow-primary/30"
              >
                Add to Roadmap
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
