"use client";

import {
  Brain,
  Briefcase,
  Camera,
  Coffee,
  Crown,
  Diamond,
  Flame,
  Heart,
  Music,
  Palette,
  Rocket,
  Shield,
  Star,
  Trophy,
  User,
} from "lucide-react";
import type { ComponentType } from "react";
import { TbLayersDifference } from "react-icons/tb";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export interface AvatarIcon {
  id: string;
  name: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const avatarIcons: AvatarIcon[] = [
  {
    id: "user",
    name: "Professional",
    icon: User,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "crown",
    name: "Leader",
    icon: Crown,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  {
    id: "star",
    name: "Rising Star",
    icon: Star,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    id: "heart",
    name: "Passionate",
    icon: Heart,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    id: "shield",
    name: "Defender",
    icon: Shield,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    id: "briefcase",
    name: "Executive",
    icon: Briefcase,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  {
    id: "coffee",
    name: "Coffee Lover",
    icon: Coffee,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  {
    id: "palette",
    name: "Creative",
    icon: Palette,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
  },
  {
    id: "gamepad",
    name: "Gamer",
    icon: TbLayersDifference,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  {
    id: "music",
    name: "Music Lover",
    icon: Music,
    color: "text-violet-600",
    bgColor: "bg-violet-100",
  },
  {
    id: "camera",
    name: "Photographer",
    icon: Camera,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
  {
    id: "rocket",
    name: "Innovator",
    icon: Rocket,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    id: "brain",
    name: "Thinker",
    icon: Brain,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
  },
  {
    id: "trophy",
    name: "Winner",
    icon: Trophy,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  {
    id: "diamond",
    name: "Premium",
    icon: Diamond,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
  },
  {
    id: "flame",
    name: "Hot Shot",
    icon: Flame,
    color: "text-rose-600",
    bgColor: "bg-rose-100",
  },
];

interface AvatarIconSelectorProps {
  selectedIcon?: string;
  onSelectIcon: (iconId: string) => void;
  className?: string;
  variant?: "card" | "embedded";
}

function getSelectedAvatarName(selectedIcon: string | undefined) {
  if (!selectedIcon) return null;
  return avatarIcons.find((icon) => icon.id === selectedIcon)?.name ?? null;
}

export function AvatarIconSelector({
  selectedIcon,
  onSelectIcon,
  className,
  variant = "card",
}: AvatarIconSelectorProps) {
  const selectedAvatarName = getSelectedAvatarName(selectedIcon);

  const gridClassName =
    variant === "embedded"
      ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4"
      : "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2";

  const tileClassName =
    variant === "embedded"
      ? "flex flex-col items-center min-w-0"
      : "text-center";
  const labelClassName =
    variant === "embedded" ? "mt-1 max-w-24 truncate" : "mt-0.5 truncate";

  const content = (
    <>
      <div className={gridClassName}>
        {avatarIcons.map((avatarIcon) => {
          const IconComponent = avatarIcon.icon;
          const isSelected = selectedIcon === avatarIcon.id;

          return (
            <div key={avatarIcon.id} className={tileClassName}>
              <Button
                type="button"
                variant="ghost"
                className={`w-14 h-14 rounded-full p-0 relative hover:scale-105 transition-all focus-visible:ring-2 focus-visible:ring-primary/30 ${
                  isSelected
                    ? `${avatarIcon.bgColor} ring-1 ring-primary/20 border border-primary/20 shadow-sm`
                    : `${avatarIcon.bgColor} hover:${avatarIcon.bgColor}`
                }`}
                aria-label={`Select avatar icon: ${avatarIcon.name}`}
                aria-pressed={isSelected}
                onClick={() => onSelectIcon(isSelected ? "" : avatarIcon.id)}
              >
                <IconComponent
                  className={`size-6 sm:size-7 ${avatarIcon.color}`}
                  aria-hidden="true"
                />
                {isSelected && (
                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full size-4 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-current rounded-full" />
                  </div>
                )}
              </Button>
              <Typography.SubCaptionMedium
                className={labelClassName}
                color="secondary"
              >
                {avatarIcon.name}
              </Typography.SubCaptionMedium>
            </div>
          );
        })}
      </div>

      {selectedIcon && (
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <Typography.SubCaptionMedium color="secondary">
              Selected:
            </Typography.SubCaptionMedium>
            <Typography.SubCaptionMedium className="truncate">
              {selectedAvatarName}
            </Typography.SubCaptionMedium>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelectIcon("")}
            aria-label="Clear avatar selection"
          >
            Clear
          </Button>
        </div>
      )}
    </>
  );

  if (variant === "embedded") {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="space-y-1">
          <Typography.Heading3>Choose an Avatar Icon</Typography.Heading3>
          <Typography.Caption color="secondary">
            Select an icon that represents you
          </Typography.Caption>
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

// Helper function to get avatar icon component by ID
export function getAvatarIcon(iconId: string): AvatarIcon | undefined {
  return avatarIcons.find((icon) => icon.id === iconId);
}

// Helper component to render an avatar icon
interface AvatarIconDisplayProps {
  iconId: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function AvatarIconDisplay({
  iconId,
  size = "md",
  className,
}: AvatarIconDisplayProps) {
  const avatarIcon = getAvatarIcon(iconId);

  if (!avatarIcon) {
    return <User className={className} />;
  }

  const IconComponent = avatarIcon.icon;

  const sizeClasses = {
    sm: "size-4",
    md: "size-6",
    lg: "size-8",
    xl: "size-12",
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center ${avatarIcon.bgColor} ${className}`}
    >
      <IconComponent className={`${avatarIcon.color} ${sizeClasses[size]}`} />
    </div>
  );
}
