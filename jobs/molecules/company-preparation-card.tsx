"use client";

import { Building2 } from "lucide-react";
import { Typography } from "@/components/common/atoms/typography";
import { Badge } from "@/components/ui/badge";

interface CompanyPreparationCardProps {
  jobCompany: string;
  jobTitle: string;
}

export function CompanyPreparationCard({
  jobCompany,
  jobTitle,
}: CompanyPreparationCardProps) {
  const badges = [
    "Company Research",
    "Role-Specific Questions",
    "Industry Standards",
  ];

  return (
    <div className="bg-secondary/30 border border-border rounded-lg p-4 transition-colors hover:bg-secondary/50">
      <div className="flex items-start gap-3">
        <Building2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <Typography.Heading3 className="mb-2">
            Company-Tailored Experience
          </Typography.Heading3>
          <Typography.Body color="secondary" className="mb-3 leading-relaxed">
            We're analyzing {jobCompany}'s interview style, company culture, and
            specific requirements for this {jobTitle} position to create a
            personalized interview experience.
          </Typography.Body>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {badges.map((badge) => (
              <Badge key={badge} variant="secondary" className="text-xs">
                {badge}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
