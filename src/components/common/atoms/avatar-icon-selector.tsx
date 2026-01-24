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
import { TbLayersDifference } from "react-icons/tb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface AvatarIcon {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
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
}

export function AvatarIconSelector({
  selectedIcon,
  onSelectIcon,
  className,
}: AvatarIconSelectorProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Choose an Avatar Icon</CardTitle>
        <p className="text-sm text-muted-foreground">
          Select an icon that represents you
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {avatarIcons.map((avatarIcon) => {
            const IconComponent = avatarIcon.icon;
            const isSelected = selectedIcon === avatarIcon.id;

            return (
              <div key={avatarIcon.id} className="text-center">
                <Button
                  variant="ghost"
                  className={`w-16 h-16 rounded-full p-0 relative hover:scale-105 transition-all ${
                    isSelected
                      ? `${avatarIcon.bgColor} ring-2 ring-primary ring-offset-2`
                      : `${avatarIcon.bgColor} hover:${avatarIcon.bgColor}`
                  }`}
                  onClick={() => onSelectIcon(avatarIcon.id)}
                >
                  <IconComponent
                    className={`size-6 sm:size-8 ${avatarIcon.color}`}
                  />
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full size-4 sm:size-5 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-current rounded-full" />
                    </div>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {avatarIcon.name}
                </p>
              </div>
            );
          })}
        </div>
        {selectedIcon && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Selected</Badge>
              <span className="text-sm font-medium">
                {avatarIcons.find((icon) => icon.id === selectedIcon)?.name}
              </span>
            </div>
          </div>
        )}
      </CardContent>
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
