"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import LoadingPage from "@/components/common/atoms/loading-page";
import { Typography } from "@/components/common/atoms/typography";
import { DashboardLayout } from "@/components/my-progress/templates/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    return ideas.filter((idea) => idea.audience === "candidate");
  }, [ideas]);

  const recruiterIdeas = useMemo(() => {
    return ideas.filter((idea) => idea.audience === "recruiter");
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

  const renderIdeaCard = (idea: RoadmapIdea) => {
    const upvoted = upvotedByIdeaId[idea.id] ?? false;
    const isBumping = bumpIdeaId === idea.id;
    const isDeleting = deletingIdeaId === idea.id;

    const statusLabel = (() => {
      switch (idea.status) {
        case "planned":
          return "Planned";
        case "in_progress":
          return "In Progress";
        default: {
          const _never: never = idea.status;
          throw new Error(`Unhandled status: ${_never}`);
        }
      }
    })();

    return (
      <Card key={idea.id}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-base">{idea.title}</CardTitle>
              <Badge variant="secondary">{statusLabel}</Badge>
            </div>
            <div className="flex items-center gap-2">
              {canManageRoadmap ? (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onRequestDeleteIdea(idea.id)}
                  disabled={isDeleting}
                >
                  Delete
                </Button>
              ) : null}
              <Button
                size="sm"
                variant={upvoted ? "secondary" : "outline"}
                onClick={() => onToggleUpvote(idea.id)}
                disabled={votingIdeaId === idea.id || isDeleting}
                aria-pressed={upvoted}
                className={
                  isBumping
                    ? "transition-transform duration-150 scale-105"
                    : undefined
                }
              >
                {upvoted ? "Upvoted" : "Upvote"} · {idea.voteCount}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Typography.Body color="secondary" className="text-sm">
            {idea.description}
          </Typography.Body>
        </CardContent>
      </Card>
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
      <div className="space-y-6">
        <div className="space-y-2">
          <Typography.Heading1 className="tracking-tight">
            Roadmap
          </Typography.Heading1>
          <Typography.Body color="secondary">
            Suggest features and upvote what you want next.
          </Typography.Body>
        </div>

        <Tabs
          value={selectedAudience}
          onValueChange={(value) => {
            if (value === "candidate") {
              setSelectedAudience("candidate");
              return;
            }
            if (value === "recruiter") {
              setSelectedAudience("recruiter");
              return;
            }

            const _never: never = value as never;
            throw new Error(`Unhandled audience tab: ${_never}`);
          }}
        >
          <TabsList>
            <TabsTrigger value="candidate">B2C</TabsTrigger>
            <TabsTrigger value="recruiter">B2B</TabsTrigger>
          </TabsList>
        </Tabs>

        {canManageRoadmap ? (
          <Card>
            <CardHeader>
              <CardTitle>Add roadmap item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Typography.CaptionMedium>Audience</Typography.CaptionMedium>
                  <Select
                    value={audience}
                    onValueChange={(value) =>
                      setAudience(value as RoadmapIdeaAudience)
                    }
                  >
                    <SelectTrigger className="w-full">
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

                <div className="space-y-2">
                  <Typography.CaptionMedium>Status</Typography.CaptionMedium>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setStatus(value as RoadmapIdeaStatus)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Typography.CaptionMedium>Title</Typography.CaptionMedium>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short, specific title"
                  maxLength={80}
                />
              </div>

              <div className="space-y-2">
                <Typography.CaptionMedium>Description</Typography.CaptionMedium>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What problem does it solve? What would good look like?"
                  maxLength={2000}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={onCreateIdea}
                  disabled={submitting || !title.trim() || !description.trim()}
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="space-y-8">
          <section className="space-y-3">
            <div className="space-y-1">
              {(() => {
                switch (selectedAudience) {
                  case "candidate":
                    return (
                      <>
                        <Typography.Heading2>For Candidate</Typography.Heading2>
                        <Typography.Body color="secondary" className="text-sm">
                          B2C roadmap items.
                        </Typography.Body>
                      </>
                    );
                  case "recruiter":
                    return (
                      <>
                        <Typography.Heading2>For Recruiter</Typography.Heading2>
                        <Typography.Body color="secondary" className="text-sm">
                          B2B roadmap items.
                        </Typography.Body>
                      </>
                    );
                  default: {
                    const _never: never = selectedAudience;
                    throw new Error(`Unhandled audience: ${_never}`);
                  }
                }
              })()}
            </div>

            {selectedIdeas.length === 0 ? (
              <Card>
                <CardContent>
                  <Typography.Body color="secondary">
                    {(() => {
                      switch (selectedAudience) {
                        case "candidate":
                          return "No candidate features yet.";
                        case "recruiter":
                          return "No recruiter features yet.";
                        default: {
                          const _never: never = selectedAudience;
                          throw new Error(`Unhandled audience: ${_never}`);
                        }
                      }
                    })()}
                  </Typography.Body>
                </CardContent>
              </Card>
            ) : (
              selectedIdeas.map(renderIdeaCard)
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
